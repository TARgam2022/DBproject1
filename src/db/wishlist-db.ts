import { BaseDB } from "./base-db";

type WishlistRow = {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
};

export type WishlistItem = {
  id: number;
  userId: number;
  productId: number;
  title: string;
  price: number;
  discountedPrice: number;
  imgs?: { thumbnails: string[]; previews: string[] };
  createdAt: string;
};

let instance: WishlistDB | null = null;

export class WishlistDB extends BaseDB {
  protected tableName = "wishlists";
  private initialized = false;

  static getInstance(): WishlistDB {
    if (!instance) {
      instance = new WishlistDB();
    }
    return instance;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    await this.ddl(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        productId INT NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_product (userId, productId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    this.initialized = true;
  }

  async getByUser(userId: number): Promise<WishlistItem[]> {
    await this.init();
    const rows = await this.all<
      WishlistRow & {
        title: string;
        price: number;
        discountedPrice: number;
        thumbnail_1: string;
        thumbnail_2: string;
        preview_1: string;
        preview_2: string;
      }
    >(
      `SELECT w.*, p.title, p.price, p.discountedPrice,
              p.thumbnail_1, p.thumbnail_2, p.preview_1, p.preview_2
       FROM wishlists w
       JOIN products p ON p.id = w.productId
       WHERE w.userId = ?
       ORDER BY w.id DESC`,
      [userId]
    );
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      productId: r.productId,
      title: r.title,
      price: Number(r.price),
      discountedPrice: Number(r.discountedPrice),
      imgs: {
        thumbnails: [r.thumbnail_1, r.thumbnail_2].filter(Boolean),
        previews: [r.preview_1, r.preview_2].filter(Boolean),
      },
      createdAt: r.createdAt,
    }));
  }

  async add(userId: number, productId: number): Promise<WishlistItem | null> {
    await this.init();
    await this.run(
      "INSERT IGNORE INTO wishlists (userId, productId) VALUES (?, ?)",
      [userId, productId]
    );
    const items = await this.getByUser(userId);
    return items.find((i) => i.productId === productId) ?? null;
  }

  async remove(userId: number, productId: number): Promise<boolean> {
    await this.init();
    const result = await this.run(
      "DELETE FROM wishlists WHERE userId = ? AND productId = ?",
      [userId, productId]
    );
    return result.affectedRows > 0;
  }

  async exists(userId: number, productId: number): Promise<boolean> {
    await this.init();
    const rows = await this.all<{ c: number }>(
      "SELECT COUNT(*) AS c FROM wishlists WHERE userId = ? AND productId = ?",
      [userId, productId]
    );
    return (rows[0]?.c ?? 0) > 0;
  }
}

export const wishlistDB = WishlistDB.getInstance();
