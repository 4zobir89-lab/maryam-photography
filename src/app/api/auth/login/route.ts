import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";

// Default fallback credentials (used when DB is not yet set up)
const DEFAULT_USERNAME = "maryam";
const DEFAULT_PASSWORD_HASH = "$2b$10$FDPiYgy7IZCg0lqWu4s7cOb1DQ1GBnU41A1Yxnj3NpJBqk6aNTe7S"; // "maryam2024"

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "اسم المستخدم وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    let admin: { id: string; username: string; name: string | null; password: string } | null = null;

    // Try DB first
    try {
      admin = await db.adminUser.findUnique({
        where: { username: username.toLowerCase() },
      });
    } catch (dbErr) {
      console.error("DB not available, using default admin:", dbErr);
    }

    // Fallback: try default credentials if DB fails or no admin found
    if (!admin) {
      if (username.toLowerCase() === DEFAULT_USERNAME) {
        const valid = await bcrypt.compare(password, DEFAULT_PASSWORD_HASH);
        if (valid) {
          admin = {
            id: "default-admin-id",
            username: DEFAULT_USERNAME,
            name: "مريم (افتراضي)",
            password: DEFAULT_PASSWORD_HASH,
          };
        }
      }
    } else {
      const valid = await bcrypt.compare(password, admin.password);
      if (!valid) admin = null;
    }

    if (!admin) {
      return NextResponse.json(
        { error: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }

    await setSessionCookie({
      userId: admin.id,
      username: admin.username,
      name: admin.name || undefined,
    });

    return NextResponse.json({
      success: true,
      user: { username: admin.username, name: admin.name },
    });
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

