import dotenv from "dotenv";
dotenv.config();

import { db } from "../db/index.js";
import { roles } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

const predefinedRoles = [
  "super_admin",
  "dpo",
  "data_steward",
  "risk_analyst",
  "auditor",
];

async function seedRoles() {
  try {
    for (const name of predefinedRoles) {
      const existing = await db.query.roles.findFirst({
        where: eq(roles.name, name),
      });

      if (!existing) {
        await db.insert(roles).values({ name });
        console.log(`✅ Inserted role: ${name}`);
      } else {
        console.log(`ℹ️ Role already exists: ${name}`);
      }
    }

    console.log("🎉 All roles seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed roles:", error);
    process.exit(1);
  }
}

seedRoles();
