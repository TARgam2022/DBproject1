import { NextRequest, NextResponse } from "next/server";
import { userDB } from "@/db/user-db";
import { verifyToken, getCookieValue, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = getCookieValue(
      AUTH_COOKIE_NAME,
      request.headers.get("cookie")
    );
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ user: null });
    }

    const user = await userDB.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image ?? null,
      },
    });
  } catch (err) {
    console.error("[api/auth/me] failed", err);
    return NextResponse.json({ user: null });
  }
}
