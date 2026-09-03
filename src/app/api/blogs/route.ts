import { NextResponse } from "next/server";
import { blogDB } from "@/db/blog-db";

export async function GET() {
  try {
    const blogs = await blogDB.getAll();
    return NextResponse.json({ blogs });
  } catch (err) {
    console.error("[api/blogs] GET failed", err);
    return NextResponse.json(
      { error: "Failed to load blogs" },
      { status: 500 }
    );
  }
}
