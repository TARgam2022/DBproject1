import { NextRequest, NextResponse } from "next/server";
import { userDB } from "@/db/user-db";
import {
  verifyToken,
  getCookieValue,
  AUTH_COOKIE_NAME,
  hashPassword,
  comparePassword,
} from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const token = getCookieValue(AUTH_COOKIE_NAME, request.headers.get("cookie"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await userDB.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, image } = body ?? {};

    const updates: { name?: string; image?: string | null } = {};
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      }
      updates.name = name.trim();
    }
    if (image !== undefined) {
      updates.image = typeof image === "string" && image ? image : null;
    }

    const updated = await userDB.updateProfile(payload.userId, updates);
    if (!updated) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        image: updated.image ?? null,
      },
    });
  } catch (err) {
    console.error("[api/auth/profile] PUT failed", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getCookieValue(AUTH_COOKIE_NAME, request.headers.get("cookie"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await userDB.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body ?? {};

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "oldPassword and newPassword are required" },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const valid = await comparePassword(String(oldPassword), user.password);
    if (!valid) {
      return NextResponse.json({ error: "Old password is incorrect" }, { status: 400 });
    }

    const hashed = await hashPassword(String(newPassword));
    await userDB.updatePassword(user.id, hashed);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/auth/profile] POST failed", err);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
