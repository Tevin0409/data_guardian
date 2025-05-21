import { eq, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/index.js";
import { processes, projects } from "../drizzle/schema.js";

// Utility to update process count
async function updateProcessCount(project_id) {
  const count = await db
    .select()
    .from(processes)
    .where(eq(processes.project_id, project_id))
    .then((rows) => rows.filter((p) => !p.deleted_at).length);

  await db
    .update(projects)
    .set({ number_of_processes: count })
    .where(eq(projects.id, project_id));
}

// Create
export async function createProcess(req, res) {
  const { project_id, name, description, status } = req.body;

  try {
    await db.insert(processes).values({
      id: uuidv4(),
      project_id,
      name,
      description,
      status,
    });

    await updateProcessCount(project_id);

    res.status(201).json({ message: "Process created" });
  } catch (error) {
    res.status(500).json({ message: "Process creation failed", error });
  }
}

// Read
export async function getProcesses(req, res) {
  const { project_id, status, q, page = 1, limit = 10 } = req.query;
  const take = parseInt(limit);
  const skip = (parseInt(page) - 1) * take;

  const filters = [isNull(processes.deleted_at)];
  if (project_id) filters.push(eq(processes.project_id, project_id));
  if (status) filters.push(eq(processes.status, status));
  if (q) filters.push(ilike(processes.name, `%${q}%`));

  try {
    const [data, total] = await Promise.all([
      db.query.processes.findMany({
        where: and(...filters),
        with: { project: true }, // eager load parent project
        limit: take,
        offset: skip,
      }),
      db
        .select({ count: processes.id })
        .from(processes)
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
    console.error("Error fetching processes:", error);
    res.status(500).json({ message: "Failed to fetch processes" });
  }
}

// Update
export async function updateProcess(req, res) {
  const { id } = req.params;
  const { name, description, status } = req.body;

  try {
    await db
      .update(processes)
      .set({ name, description, status })
      .where(eq(processes.id, id));

    res.json({ message: "Process updated" });
  } catch (error) {
    res.status(500).json({ message: "Process update failed", error });
  }
}

// Soft Delete
export async function deleteProcess(req, res) {
  const { id } = req.params;

  try {
    const [process] = await db
      .select()
      .from(processes)
      .where(eq(processes.id, id));
    if (!process) return res.status(404).json({ message: "Process not found" });

    await db
      .update(processes)
      .set({ deleted_at: new Date() })
      .where(eq(processes.id, id));

    await updateProcessCount(process.project_id);

    res.json({ message: "Process soft-deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error });
  }
}
