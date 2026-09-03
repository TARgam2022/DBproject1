import { NextRequest, NextResponse } from "next/server";
import { categoryDB } from "@/db/category-db";

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
    const body = await request.json();
    const { title, img } = body ?? {};

    if (!title) {
      return NextResponse.json(
        { error: "title (string) is required" },
        { status: 400 }
      );
    }

    const category = await categoryDB.add({
      title: String(title),
      img: img ? String(img) : "/images/categories/categories-01.png",
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
