import { NextRequest, NextResponse } from "next/server";
import { categoryDB } from "@/db/category-db";
import { userDB } from "@/db/user-db";
import { verifyToken, getCookieValue, AUTH_COOKIE_NAME } from "@/lib/auth";
import { CATEGORY_COLORS } from "@/config/category-colors";

export async function GET() {
  try {
    const categories = await categoryDB.getAll();
    return NextResponse.json({ categories });
  } catch (err) {
    console.error("[api/categories] GET failed", err);
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 }
    );
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
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, color, img } = body ?? {};

    if (!title) {
      return NextResponse.json(
        { error: "title (string) is required" },
        { status: 400 }
      );
    }

    const validColor = CATEGORY_COLORS.some((c) => c.key === color);
    const category = await categoryDB.add({
      title: String(title),
      color: validColor ? String(color) : "blue",
      img: img ? String(img) : undefined,
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    console.error("[api/categories] POST failed", err);
    return NextResponse.json(
      { error: "Failed to add category" },
      { status: 500 }
    );
  }
}
