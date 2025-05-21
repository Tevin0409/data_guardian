import { eq, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/index.js";
import { projects, processes } from "../drizzle/schema.js";

// List all active projects

export async function getProjects(req, res) {
  const { department_id, status, q, page = 1, limit = 10 } = req.query;
  const take = parseInt(limit);
  const skip = (parseInt(page) - 1) * take;

  const filters = [isNull(projects.deleted_at)];
  if (department_id) filters.push(eq(projects.department_id, department_id));
  if (status) filters.push(eq(projects.status, status));
  if (q) filters.push(ilike(projects.name, `%${q}%`));

  try {
    const [data, total] = await Promise.all([
      db.query.projects.findMany({
        where: and(...filters),
        with: { processes: true }, // eager load
        limit: take,
        offset: skip,
      }),
      db
        .select({ count: projects.id })
        .from(projects)
        .where(and(...filters))
        .then((r) => r[0].count),
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
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
}

// Create a project
export async function createProject(req, res) {
  const { department_id, name, description, status } = req.body;

  if (!department_id || !name || !status) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    await db.insert(projects).values({
      id: uuidv4(),
      department_id,
      name,
      description,
      status,
      number_of_processes: 0,
    });

    res.status(201).json({ message: "Project created" });
  } catch (error) {
    console.error("Create Project Error:", error);
    res.status(500).json({ message: "Failed to create project" });
  }
}

// Update a project
export async function updateProject(req, res) {
  const { id } = req.params;
  const { name, description, status } = req.body;

  try {
    await db
      .update(projects)
      .set({ name, description, status })
      .where(eq(projects.id, id));

    res.json({ message: "Project updated" });
  } catch (error) {
    console.error("Update Project Error:", error);
    res.status(500).json({ message: "Failed to update project" });
  }
}

// Soft delete a project
export async function deleteProject(req, res) {
  const { id } = req.params;

  try {
    await db
      .update(projects)
      .set({ deleted_at: new Date() })
      .where(eq(projects.id, id));

    res.json({ message: "Project soft-deleted" });
  } catch (error) {
    console.error("Delete Project Error:", error);
    res.status(500).json({ message: "Failed to delete project" });
  }
}
