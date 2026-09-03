import { BaseDB } from "./base-db";
import { Category } from "@/types/category";
import path from "node:path";

type CategoryRow = {
  id: number;
  title: string;
  img: string | null;
  color: string | null;
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
        img TEXT,
        color VARCHAR(50) NOT NULL DEFAULT 'blue'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    if (!(await this.columnExists("categories", "color"))) {
      await this.ddl(
        "ALTER TABLE categories ADD COLUMN color VARCHAR(50) NOT NULL DEFAULT 'blue'"
      );
    }

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

  private rowToCategory(r: CategoryRow): Category {
    return {
      id: Number(r.id),
      title: r.title,
      img: r.img ?? "",
      color: r.color ?? "blue",
    };
  }

  async getAll(): Promise<Category[]> {
    await this.init();
    const rows = await this.all<CategoryRow>(
      "SELECT * FROM categories ORDER BY id ASC"
    );
    return rows.map((r) => this.rowToCategory(r));
  }

  async add(input: { title: string; color: string; img?: string }): Promise<Category> {
    await this.init();
    const result = await this.run(
      "INSERT INTO categories (title, img, color) VALUES (?, ?, ?)",
      [input.title, input.img ?? null, input.color ?? "blue"]
    );
    const rows = await this.all<CategoryRow>(
      "SELECT * FROM categories WHERE id = ?",
      [result.insertId]
    );
    return this.rowToCategory(rows[0]);
  }

  async delete(id: number): Promise<boolean> {
    await this.init();
    const rows = await this.all<CategoryRow>(
      "SELECT * FROM categories WHERE id = ?",
      [id]
    );
    if (!rows.length) return false;
    await this.run("DELETE FROM categories WHERE id = ?", [id]);
    return true;
  }
}

export const categoryDB = CategoryDB.getInstance();
