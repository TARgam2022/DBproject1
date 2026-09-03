import { BaseDB } from "./base-db";
import { Category } from "@/types/category";
import path from "node:path";

type CategoryRow = {
  id: number;
  title: string;
  img: string;
};

let instance: CategoryDB | null = null;

export class CategoryDB extends BaseDB {
  protected tableName = "categories";
  private initialized = false;

  static getInstance(): CategoryDB {
    if (!instance) {
      instance = new CategoryDB();
    }
    return instance;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    await this.ddl(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        img TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    if ((await this.count("categories")) === 0) {
      const seedPath = path.join(
        process.cwd(),
        "data",
        "seeds",
        "categories.sql"
      );
      await this.seedFromFile("categories", seedPath);
    }

    this.initialized = true;
  }

  async getAll(): Promise<Category[]> {
    await this.init();
    const rows = await this.all<CategoryRow>(
      "SELECT * FROM categories ORDER BY id ASC"
    );
    return rows.map((r) => ({
      id: Number(r.id),
      title: r.title,
      img: r.img,
    }));
  }

  async add(input: { title: string; img?: string }): Promise<Category> {
    await this.init();
    const result = await this.run(
      "INSERT INTO categories (title, img) VALUES (?, ?)",
      [input.title, input.img ?? null]
    );
    const rows = await this.all<CategoryRow>(
      "SELECT * FROM categories WHERE id = ?",
      [result.insertId]
    );
    const r = rows[0];
    return { id: Number(r.id), title: r.title, img: r.img };
  }
}

export const categoryDB = CategoryDB.getInstance();
