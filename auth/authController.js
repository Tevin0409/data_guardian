import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { users, roles } from "../drizzle/schema.js";
import { env } from "../config/env.js";

// Generate JWT
const generateToken = (payload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: "1d" });

// Register user
export async function register(req, res) {
  const { name, email, password, roleName } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);

    const role = await db.query.roles.findFirst({
      where: eq(roles.name, roleName),
    });

    if (!role) {
      return res.status(400).json({ message: "Invalid role name." });
    }

    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existing) {
      return res.status(409).json({ message: "Email already in use." });
    }

    await db.insert(users).values({
      name,
      email,
      password: hashed,
      role_id: role.id,
    });

    return res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

// Login
export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      with: { role: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ id: user.id, role: user.role.name });

    // Set secure cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400000, // 1 day
    });

    return res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

// Get current user
export async function me(req, res) {
  return res.json({ user: req.user });
}

// Logout
export async function logout(req, res) {
  res.clearCookie("token");
  return res.json({ message: "Logged out successfully." });
}

export async function createUser(req, res) {
  const { name, email, phone, roleName } = req.body;

  try {
    if (!name || !email || !phone || !roleName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const role = await db.query.roles.findFirst({
      where: eq(roles.name, roleName),
    });

    if (!role) {
      return res.status(400).json({ message: `Role '${roleName}' not found` });
    }

    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(phone, 10); // phone number as default password

    await db.insert(users).values({
      name,
      email,
      password: hashed,
      role_id: role.id,
    });

    return res
      .status(201)
      .json({ message: `User '${name}' created as '${roleName}'` });
  } catch (error) {
    console.error("❌ createUser error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
