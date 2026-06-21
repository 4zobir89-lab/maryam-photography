import { db } from "@/lib/db";

/**
 * Log an admin activity to the ActivityLog table.
 * Failures are swallowed so they never break the calling request.
 */
export async function logActivity(
  action: string,
  entity: string,
  entityId: string = "",
  details: string = "",
  username: string = "maryam"
) {
  try {
    await db.activityLog.create({
      data: { action, entity, entityId, details, username },
    });
  } catch (e) {
    console.error("Failed to log activity:", e);
  }
}
