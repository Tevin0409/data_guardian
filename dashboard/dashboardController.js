import { sql, eq, isNull } from "drizzle-orm";
import { db } from "../db/index.js";
import { projects, departments, users } from "../drizzle/schema.js";

export async function getDashboardSummary(req, res) {
  try {
    const [activeProjects, totalUsers, allDepartments, topRisks] =
      await Promise.all([
        db.select().from(projects).where(eq(projects.status, "active")),
        db
          .select({ count: sql`COUNT(*)`.mapWith(Number) })
          .from(users)
          .then((r) => r[0]?.count || 0),
        db.query.departments.findMany({
          where: isNull(departments.deleted_at),
          with: { projects: true },
        }),
      ]);

    res.json({
      activeProjectsCount: activeProjects.length,
      totalUsers,
      departmentActivity: allDepartments.map((d) => ({
        name: d.name,
        activityLevel:
          d.projects.length > 5
            ? "High"
            : d.projects.length > 2
            ? "Medium"
            : "Low",
      })),
      complianceScore: 88, // Placeholder until compliance tracking exists
      complianceStatus: "Compliant",
      complianceDeadlines: ["DPA Audit - 2025-06-01"],
      complianceGaps: [
        "Missing DPA audit documentation",
        "Incomplete staff training records",
      ],
      riskItems: [],
      riskSeverityDistribution: [],
      teamPerformance: {
        activeMembers: 24,
        tasksCompleted: 110,
        avgCompletionTime: "2.5 days",
      },
      recentReports: [], // Placeholder until reports are modeled
      recentActivity: [
        "User admin created Risk 'Data Breach' at 2025-05-18 14:30 EAT",
        "Report 'Compliance Report - 2025-05-19' generated at 03:00 EAT",
        "Project 'Budget 2025' updated by admin at 2025-05-18 10:15 EAT",
      ],
    });
  } catch (err) {
    console.error("Dashboard Summary Error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard summary" });
  }
}
