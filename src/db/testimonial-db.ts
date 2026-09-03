import { BaseDB } from "./base-db";
import { Testimonial } from "@/types/testimonial";
import path from "node:path";

type TestimonialRow = {
  id: number;
  review: string;
  authorName: string;
  authorRole: string;
  authorImg: string;
};

let instance: TestimonialDB | null = null;

export class TestimonialDB extends BaseDB {
  protected tableName = "testimonials";
  private initialized = false;

  static getInstance(): TestimonialDB {
    if (!instance) {
      instance = new TestimonialDB();
    }
    return instance;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    await this.ddl(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        review TEXT NOT NULL,
        authorName VARCHAR(255) NOT NULL,
        authorRole VARCHAR(255) NOT NULL,
        authorImg TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    if ((await this.count("testimonials")) === 0) {
      const seedPath = path.join(
        process.cwd(),
        "data",
        "seeds",
        "testimonials.sql"
      );
      await this.seedFromFile("testimonials", seedPath);
    }

    this.initialized = true;
  }

  async getAll(): Promise<Testimonial[]> {
    await this.init();
    const rows = await this.all<TestimonialRow>(
      "SELECT * FROM testimonials ORDER BY id ASC"
    );
    return rows.map((r) => ({
      review: r.review,
      authorName: r.authorName,
      authorRole: r.authorRole,
      authorImg: r.authorImg,
    }));
  }

  async add(input: {
    review: string;
    authorName: string;
    authorRole: string;
    authorImg?: string;
  }): Promise<Testimonial> {
    await this.init();
    const result = await this.run(
      "INSERT INTO testimonials (review, authorName, authorRole, authorImg) VALUES (?, ?, ?, ?)",
      [input.review, input.authorName, input.authorRole, input.authorImg ?? null]
    );
    const rows = await this.all<TestimonialRow>(
      "SELECT * FROM testimonials WHERE id = ?",
      [result.insertId]
    );
    const r = rows[0];
    return {
      review: r.review,
      authorName: r.authorName,
      authorRole: r.authorRole,
      authorImg: r.authorImg,
    };
  }
}

export const testimonialDB = TestimonialDB.getInstance();
