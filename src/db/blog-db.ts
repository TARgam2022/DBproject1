import { BaseDB } from "./base-db";
import { BlogItem } from "@/types/blogItem";
import path from "node:path";

type BlogRow = {
  id: number;
  date: string;
  views: number;
  title: string;
  img: string;
};

let instance: BlogDB | null = null;

export class BlogDB extends BaseDB {
  protected tableName = "blogs";
  private initialized = false;

  static getInstance(): BlogDB {
    if (!instance) {
      instance = new BlogDB();
    }
    return instance;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    await this.ddl(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date VARCHAR(50) NOT NULL,
        views INT NOT NULL DEFAULT 0,
        title VARCHAR(255) NOT NULL,
        img TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    if ((await this.count("blogs")) === 0) {
      const seedPath = path.join(process.cwd(), "data", "seeds", "blogs.sql");
      await this.seedFromFile("blogs", seedPath);
    }

    this.initialized = true;
  }

  async getAll(): Promise<BlogItem[]> {
    await this.init();
    const rows = await this.all<BlogRow>(
      "SELECT * FROM blogs ORDER BY id ASC"
    );
    return rows.map((r) => ({
      date: r.date,
      views: Number(r.views),
      title: r.title,
      img: r.img,
    }));
  }

  async getById(id: number): Promise<BlogItem | undefined> {
    await this.init();
    const rows = await this.all<BlogRow>(
      "SELECT * FROM blogs WHERE id = ?",
      [id]
    );
    return rows.length
      ? {
          date: rows[0].date,
          views: Number(rows[0].views),
          title: rows[0].title,
          img: rows[0].img,
        }
      : undefined;
  }

  async add(input: {
    date: string;
    views: number;
    title: string;
    img?: string;
  }): Promise<BlogItem> {
    await this.init();
    const result = await this.run(
      "INSERT INTO blogs (date, views, title, img) VALUES (?, ?, ?, ?)",
      [input.date, input.views, input.title, input.img ?? null]
    );
    const rows = await this.all<BlogRow>(
      "SELECT * FROM blogs WHERE id = ?",
      [result.insertId]
    );
    const r = rows[0];
    return { date: r.date, views: Number(r.views), title: r.title, img: r.img };
  }
}

export const blogDB = BlogDB.getInstance();
