import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Roles table
export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
});

// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  password: text("password").notNull(),
  role_id: uuid("role_id")
    .notNull()
    .references(() => roles.id),
});

// Departments Table
export const departments = pgTable("departments", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  deleted_at: timestamp("deleted_at"),
});

// --- Projects
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  department_id: uuid("department_id")
    .notNull()
    .references(() => departments.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 100 }).notNull(),
  number_of_processes: integer("number_of_processes").default(0),
  deleted_at: timestamp("deleted_at"),
});

// --- Processes
export const processes = pgTable("processes", {
  id: uuid("id").defaultRandom().primaryKey(),
  project_id: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 100 }).default("pending"),
  deleted_at: timestamp("deleted_at"),
});

// relationship
export const userRelations = relations(users, ({ one }) => ({
  role: one(roles, {
    fields: [users.role_id],
    references: [roles.id],
  }),
}));

export const departmentRelations = relations(departments, ({ many }) => ({
  projects: many(projects),
}));

export const projectRelations = relations(projects, ({ one, many }) => ({
  department: one(departments, {
    fields: [projects.department_id],
    references: [departments.id],
  }),
  processes: many(processes),
}));

export const processRelations = relations(processes, ({ one }) => ({
  project: one(projects, {
    fields: [processes.project_id],
    references: [projects.id],
  }),
}));
