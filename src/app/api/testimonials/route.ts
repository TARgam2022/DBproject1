import { NextResponse } from "next/server";
import { testimonialDB } from "@/db/testimonial-db";

export async function GET() {
  try {
    const testimonials = await testimonialDB.getAll();
    return NextResponse.json({ testimonials });
  } catch (err) {
    console.error("[api/testimonials] GET failed", err);
    return NextResponse.json(
      { error: "Failed to load testimonials" },
      { status: 500 }
    );
  }
}
