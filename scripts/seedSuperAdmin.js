import dotenv from "dotenv";
import { eq } from "drizzle-orm";

import bcrypt from "bcryptjs";
import { db } from "../db/index.js";
import { users, roles } from "../drizzle/schema.js";

dotenv.config();
const superAdmin = {
  name: "System Admin",
  email: "admin@dataguardian.io",
  password: "SecureP@ssw0rd!",
  roleName: "super_admin",
};

async function seedSuperAdmin() {
  try {
    const role = await db.query.roles.findFirst({
      where: eq(roles.name, superAdmin.roleName),
    });

    if (!role) {
      throw new Error(
        `Role '${superAdmin.roleName}' not found. Did you run seedRoles.js first?`
      );
    }

    const existing = await db.query.users.findFirst({
      where: eq(users.email, superAdmin.email),
    });

    if (existing) {
      console.log(`ℹ️ Super admin already exists: ${superAdmin.email}`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(superAdmin.password, 10);

    await db.insert(users).values({
      name: superAdmin.name,
      email: superAdmin.email,
      password: hashedPassword,
      role_id: role.id,
    });

    console.log(`✅ Super admin created: ${superAdmin.email}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create super admin:", error.message);
    process.exit(1);
  }
}

seedSuperAdmin();
