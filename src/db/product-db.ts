import { BaseDB } from "./base-db";
import { Product } from "@/types/product";
import path from "node:path";

type ProductRow = {
  id: number;
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  description: string;
  thumbnail_1: string;
  thumbnail_2: string;
  preview_1: string;
  preview_2: string;
  categoryId: number | null;
};

function rowToProduct(row: ProductRow): Product {
  return {
    id: Number(row.id),
    title: row.title,
    reviews: Number(row.reviews),
    price: Number(row.price),
    discountedPrice: Number(row.discountedPrice),
    description: row.description ?? "",
    categoryId: row.categoryId == null ? null : Number(row.categoryId),
    imgs: {
      thumbnails: [row.thumbnail_1, row.thumbnail_2].filter(Boolean),
      previews: [row.preview_1, row.preview_2].filter(Boolean),
    },
  };
}

let instance: ProductDB | null = null;

export class ProductDB extends BaseDB {
  protected tableName = "products";
  private initialized = false;

  static getInstance(): ProductDB {
    if (!instance) {
      instance = new ProductDB();
    }
    return instance;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    await this.ddl(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        reviews INT NOT NULL DEFAULT 0,
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        discountedPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
        thumbnail_1 TEXT,
        thumbnail_2 TEXT,
        preview_1 TEXT,
        preview_2 TEXT,
        categoryId INT,
        description TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    if (!(await this.columnExists("products", "description"))) {
      await this.ddl("ALTER TABLE products ADD COLUMN description TEXT");
    }

    if ((await this.count("products")) === 0) {
      const seedPath = path.join(process.cwd(), "data", "seeds", "products.sql");
      await this.seedFromFile("products", seedPath);
    }

    this.initialized = true;
  }

  async getAll(): Promise<Product[]> {
    await this.init();
    const rows = await this.all<ProductRow>(
      "SELECT * FROM products ORDER BY id ASC"
    );
    return rows.map(rowToProduct);
  }

  async getById(id: number): Promise<Product | undefined> {
    await this.init();
    const rows = await this.all<ProductRow>(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );
    return rows.length ? rowToProduct(rows[0]) : undefined;
  }

  async update(
    id: number,
    input: {
      title?: string;
      reviews?: number;
      price?: number;
      discountedPrice?: number;
      thumbnail?: string;
      preview?: string;
      description?: string;
      categoryId?: number | null;
    }
  ): Promise<Product | undefined> {
    await this.init();
    const existing = await this.getById(id);
    if (!existing) return undefined;

    const fields: string[] = [];
    const values: unknown[] = [];

    if (input.title !== undefined) {
      fields.push("title = ?");
      values.push(input.title);
    }
    if (input.reviews !== undefined) {
      fields.push("reviews = ?");
      values.push(input.reviews);
    }
    if (input.price !== undefined) {
      fields.push("price = ?");
      values.push(input.price);
    }
    if (input.discountedPrice !== undefined) {
      fields.push("discountedPrice = ?");
      values.push(input.discountedPrice);
    }
    if (input.thumbnail !== undefined) {
      fields.push("thumbnail_1 = ?");
      values.push(input.thumbnail);
      fields.push("preview_1 = ?");
      values.push(input.preview ?? input.thumbnail);
    }
    if (input.categoryId !== undefined) {
      fields.push("categoryId = ?");
      values.push(input.categoryId == null ? null : input.categoryId);
    }
    if (input.description !== undefined) {
      fields.push("description = ?");
      values.push(input.description);
    }

    if (fields.length === 0) return existing;

    values.push(id);
    await this.run(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`, values);
    return this.getById(id);
  }

  async delete(id: number): Promise<boolean> {
    await this.init();
    const existing = await this.getById(id);
    if (!existing) return false;
    await this.run("DELETE FROM products WHERE id = ?", [id]);
    return true;
  }

  async add(input: {
    title: string;
    reviews?: number;
    price: number;
    discountedPrice?: number;
    thumbnail?: string;
    preview?: string;
    categoryId?: number | null;
    description?: string;
  }): Promise<Product> {
    await this.init();
    const result = await this.run(
      `INSERT INTO products
        (title, reviews, price, discountedPrice, thumbnail_1, thumbnail_2, preview_1, preview_2, categoryId, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.title,
        input.reviews ?? 0,
        input.price,
        input.discountedPrice ?? input.price,
        input.thumbnail ?? null,
        null,
        input.preview ?? input.thumbnail ?? null,
        null,
        input.categoryId == null ? null : input.categoryId,
        input.description ?? null,
      ]
    );
    const rows = await this.all<ProductRow>(
      "SELECT * FROM products WHERE id = ?",
      [result.insertId]
    );
    return rowToProduct(rows[0]);
  }
}

export const productDB = ProductDB.getInstance();
