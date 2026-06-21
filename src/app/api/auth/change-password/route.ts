import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

const DEFAULT_USERNAME = "maryam";
const DEFAULT_PASSWORD_HASH = "$2b$10$FDPiYgy7IZCg0lqWu4s7cOb1DQ1GBnU41A1Yxnj3NpJBqk6aNTe7S"; // "maryam2024"

// POST /api/auth/change-password — admin only
// Body: { currentPassword, newPassword }
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "كلمة المرور الحالية والجديدة مطلوبتان" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" },
        { status: 400 }
      );
    }

    // Try DB first to find admin user
    let admin: { id: string; username: string; password: string; name: string | null } | null = null;
    try {
      admin = await db.adminUser.findUnique({
        where: { username: session.username.toLowerCase() },
      });
    } catch (dbErr) {
      console.error("DB not available for password change:", dbErr);
    }

    // Verify current password
    let valid = false;
    let targetUsername = session.username;

    if (admin) {
      // Real DB row — verify against stored hash
      valid = await bcrypt.compare(currentPassword, admin.password);
    } else if (session.username.toLowerCase() === DEFAULT_USERNAME) {
      // Fallback: compare against default hash
      valid = await bcrypt.compare(currentPassword, DEFAULT_PASSWORD_HASH);
    }

    if (!valid) {
      return NextResponse.json(
        { error: "كلمة المرور الحالية غير صحيحة" },
        { status: 401 }
      );
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    if (admin) {
      // Update existing DB row
      await db.adminUser.update({
        where: { id: admin.id },
        data: { password: newHash },
      });
    } else {
      // DB may be missing or admin row doesn't exist yet — try to create one
      try {
        await db.adminUser.upsert({
          where: { username: targetUsername.toLowerCase() },
          update: { password: newHash },
          create: {
            username: targetUsername.toLowerCase(),
            password: newHash,
            name: session.name || "Maryam",
          },
        });
      } catch (upsertErr) {
        console.error("Failed to persist new password:", upsertErr);
        return NextResponse.json(
          { error: "تعذّر حفظ كلمة المرور الجديدة (قاعدة البيانات غير متاحة)" },
          { status: 500 }
        );
      }
    }

    await logActivity(
      "update",
      "admin",
      session.userId || "",
      `Changed password for ${targetUsername}`,
      session.username
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Change password error:", e);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
