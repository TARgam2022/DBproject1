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

type JoinRow = {
  product_id: number;
  category_id: number;
};

function rowToProduct(row: ProductRow, categoryIds: number[] = []): Product {
  return {
    id: Number(row.id),
    title: row.title,
    reviews: Number(row.reviews),
    price: Number(row.price),
    discountedPrice: Number(row.discountedPrice),
    description: row.description ?? "",
    categoryId: row.categoryId == null ? null : Number(row.categoryId),
    categoryIds,
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

    await this.ddl(`
      CREATE TABLE IF NOT EXISTS product_categories (
        product_id INT NOT NULL,
        category_id INT NOT NULL,
        PRIMARY KEY (product_id, category_id),
        KEY idx_category_id (category_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    if (!(await this.columnExists("products", "description"))) {
      await this.ddl("ALTER TABLE products ADD COLUMN description TEXT");
    }

    if ((await this.count("products")) === 0) {
      const seedPath = path.join(process.cwd(), "data", "seeds", "products.sql");
      await this.seedFromFile("products", seedPath);
    }

    await this.migrateLegacyCategories();

    this.initialized = true;
  }

  private async migrateLegacyCategories(): Promise<void> {
    await this.run(`
      INSERT INTO product_categories (product_id, category_id)
      SELECT p.id, p.categoryId FROM products p
      WHERE p.categoryId IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM product_categories pc
          WHERE pc.product_id = p.id AND pc.category_id = p.categoryId
        )
    `);
  }

  private async getCategoryIdsFor(productIds: number[]): Promise<number[]> {
    if (productIds.length === 0) {
      return await this.all<JoinRow>(
        "SELECT product_id, category_id FROM product_categories"
      ).then((rows) => rows.map((r) => r.category_id));
    }
    const placeholders = productIds.map(() => "?").join(",");
    const rows = await this.all<JoinRow>(
      `SELECT product_id, category_id FROM product_categories WHERE product_id IN (${placeholders})`,
      productIds
    );
    return rows.map((r) => r.category_id);
  }

  private async getCategoryMap(productIds: number[]): Promise<Map<number, number[]>> {
    const map = new Map<number, number[]>();
    if (productIds.length === 0) {
      const rows = await this.all<JoinRow>(
        "SELECT product_id, category_id FROM product_categories"
      );
      for (const r of rows) {
        const list = map.get(r.product_id) ?? [];
        list.push(r.category_id);
        map.set(r.product_id, list);
      }
      return map;
    }
    const placeholders = productIds.map(() => "?").join(",");
    const rows = await this.all<JoinRow>(
      `SELECT product_id, category_id FROM product_categories WHERE product_id IN (${placeholders})`,
      productIds
    );
    for (const r of rows) {
      const list = map.get(r.product_id) ?? [];
      list.push(r.category_id);
      map.set(r.product_id, list);
    }
    return map;
  }

  async getAll(): Promise<Product[]> {
    await this.init();
    const rows = await this.all<ProductRow>(
      "SELECT * FROM products ORDER BY id ASC"
    );
    const ids = rows.map((r) => r.id);
    const cats = await this.getCategoryMap(ids);
    return rows.map((r) => rowToProduct(r, cats.get(r.id) ?? []));
  }

  async getById(id: number): Promise<Product | undefined> {
    await this.init();
    const rows = await this.all<ProductRow>(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );
    if (!rows.length) return undefined;
    const cats = await this.getCategoryIdsFor([id]);
    return rowToProduct(rows[0], cats);
  }

  private async replaceCategories(productId: number, categoryIds: number[]): Promise<void> {    await this.run("DELETE FROM product_categories WHERE product_id = ?", [
      productId,
    ]);
    const unique = Array.from(new Set(categoryIds.map(Number))).filter((n) => n > 0);
    for (const categoryId of unique) {
      await this.run(
        "INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)",
        [productId, categoryId]
      );
    }
  }

  async removeCategory(categoryId: number): Promise<void> {
    await this.init();
    await this.run("DELETE FROM product_categories WHERE category_id = ?", [
      categoryId,
    ]);
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
      preview2?: string;
      description?: string;
      categoryId?: number | null;
      categoryIds?: number[];
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
    if (input.preview2 !== undefined) {
      fields.push("thumbnail_2 = ?");
      values.push(input.preview2);
      fields.push("preview_2 = ?");
      values.push(input.preview2);
    }
    if (input.categoryIds !== undefined) {
      const first = input.categoryIds.length > 0 ? input.categoryIds[0] : null;
      fields.push("categoryId = ?");
      values.push(first);
    } else if (input.categoryId !== undefined) {
      fields.push("categoryId = ?");
      values.push(input.categoryId == null ? null : input.categoryId);
    }
    if (input.description !== undefined) {
      fields.push("description = ?");
      values.push(input.description);
    }

    if (fields.length > 0) {
      values.push(id);
      await this.run(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`, values);
    }

    if (input.categoryIds !== undefined) {
      await this.replaceCategories(id, input.categoryIds);
    }

    return this.getById(id);
  }

  async delete(id: number): Promise<boolean> {
    await this.init();
    const existing = await this.getById(id);
    if (!existing) return false;
    await this.run("DELETE FROM product_categories WHERE product_id = ?", [id]);
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
    preview2?: string;
    categoryId?: number | null;
    categoryIds?: number[];
    description?: string;
  }): Promise<Product> {
    await this.init();

    const categoryIds = input.categoryIds ?? (
      input.categoryId != null ? [input.categoryId] : []
    );
    const first = categoryIds.length > 0 ? categoryIds[0] : null;

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
        input.preview2 ?? null,
        input.preview ?? input.thumbnail ?? null,
        input.preview2 ?? null,
        first,
        input.description ?? null,
      ]
    );

    const newId = Number(result.insertId);
    if (categoryIds.length > 0) {
      await this.replaceCategories(newId, categoryIds);
    }

    const rows = await this.all<ProductRow>(
      "SELECT * FROM products WHERE id = ?",
      [newId]
    );
    const cats = await this.getCategoryIdsFor([newId]);
    return rowToProduct(rows[0], cats);
  }
}

export const productDB = ProductDB.getInstance();