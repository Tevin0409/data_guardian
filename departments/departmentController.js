import { eq, isNull, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/index.js";
import { departments } from "../drizzle/schema.js";

// CREATE
export async function createDepartment(req, res) {
  const { name, slug, description } = req.body;

  try {
    await db.insert(departments).values({
      id: uuidv4(),
      name,
      slug,
      description,
    });

    res.status(201).json({ message: "Department created" });
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({ message: "Failed to create department" });
  }
}

// READ ALL (excluding deleted)
export async function getDepartments(req, res) {
  const { q, page = 1, limit = 10 } = req.query;
  const take = parseInt(limit);
  const skip = (parseInt(page) - 1) * take;

  const filters = [isNull(departments.deleted_at)];
  if (q) filters.push(ilike(departments.name, `%${q}%`));

  try {
    const [data, total] = await Promise.all([
      db.query.departments.findMany({
        where: and(...filters),
        with: { projects: true }, // eager load
        limit: take,
        offset: skip,
      }),
      db
        .select({ count: departments.id })
        .from(departments)
        .where(and(...filters))
        .then((r) => r[0]?.count || 0),
    ]);

    res.json({
      data,
      pagination: {
        total: Number(total),
        page: parseInt(page),
        limit: take,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Failed to fetch departments" });
  }
}

// UPDATE
export async function updateDepartment(req, res) {
  const { id } = req.params;
  const { name, slug, description } = req.body;

  try {
    await db
      .update(departments)
      .set({ name, slug, description })
      .where(eq(departments.id, id));

    res.json({ message: "Department updated" });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
}

// SOFT DELETE
export async function deleteDepartment(req, res) {
  const { id } = req.params;

  try {
    await db
      .update(departments)
      .set({ deleted_at: new Date() })
      .where(eq(departments.id, id));

    res.json({ message: "Department deleted (soft)" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
}
