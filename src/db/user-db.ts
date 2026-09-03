import { BaseDB } from "./base-db";
import { hashPassword } from "@/lib/auth";
import { getPool } from "./mysql";

export type UserRole = "user" | "admin";

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  image?: string | null;
  createdAt: string;
};

export type Order = {
  id: number;
  orderId: string;
  userId: number;
  status: string;
  total: number;
  items: {
    id: number;
    title: string;
    price: number;
    discountedPrice: number;
    quantity: number;
  }[];
  createdAt: string;
};

export type CartItemData = {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

type UserRow = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  image: string;
  createdAt: string;
};

type CartRow = {
  id: number;
  userId: number;
  items: string;
  updatedAt: string;
};

type OrderRow = {
  id: number;
  orderId: string;
  userId: number;
  status: string;
  total: number;
  items: string;
  createdAt: string;
};

function rowToUser(row: UserRow): User {
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role === "admin" ? "admin" : "user",
    image: row.image || null,
    createdAt: row.createdAt,
  };
}

function parseJsonArray<T>(json: string): T[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function rowToOrder(row: OrderRow): Order {
  return {
    id: Number(row.id),
    orderId: row.orderId,
    userId: Number(row.userId),
    status: row.status,
    total: Number(row.total),
    items: parseJsonArray<Order["items"][0]>(row.items),
    createdAt: row.createdAt,
  };
}

let instance: UserDB | null = null;

export class UserDB extends BaseDB {
  protected tableName = "users";
  private initialized = false;

  static getInstance(): UserDB {
    if (!instance) {
      instance = new UserDB();
    }
    return instance;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    await this.ddl(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        image LONGTEXT,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    if (!(await this.columnExists("users", "image"))) {
      await this.ddl("ALTER TABLE users ADD COLUMN image LONGTEXT");
    }

    await this.ddl(`
      CREATE TABLE IF NOT EXISTS carts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL UNIQUE,
        items LONGTEXT NOT NULL,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await this.ddl(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        orderId VARCHAR(64) NOT NULL UNIQUE,
        userId INT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'processing',
        total DECIMAL(10,2) NOT NULL DEFAULT 0,
        items LONGTEXT NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const adminCount = await this.count("users");
    if (adminCount === 0) {
      const hashedPassword = await hashPassword("admin123");
      await getPool()
        .execute(
          "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
          ["Company Admin", "admin@company.com", hashedPassword, "admin"]
        )
        .catch((err) => {
          if (err?.code !== "ER_DUP_ENTRY") throw err;
        });
    }

    this.initialized = true;
  }

  async createUser(input: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<User> {
    await this.init();
    const role = input.role ?? "user";
    const result = await this.run(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [input.name, input.email.toLowerCase(), input.password, role]
    );
    const rows = await this.all<UserRow>(
      "SELECT * FROM users WHERE id = ?",
      [result.insertId]
    );
    return rowToUser(rows[0]);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    await this.init();
    const rows = await this.all<UserRow>(
      "SELECT * FROM users WHERE email = ?",
      [email.toLowerCase()]
    );
    return rows.length ? rowToUser(rows[0]) : undefined;
  }

  async findById(id: number): Promise<User | undefined> {
    await this.init();
    const rows = await this.all<UserRow>(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    return rows.length ? rowToUser(rows[0]) : undefined;
  }

  async updateProfile(
    id: number,
    input: { name?: string; image?: string | null }
  ): Promise<User | undefined> {
    await this.init();
    const fields: string[] = [];
    const values: unknown[] = [];
    if (input.name !== undefined) {
      fields.push("name = ?");
      values.push(input.name);
    }
    if (input.image !== undefined) {
      fields.push("image = ?");
      values.push(input.image || null);
    }
    if (fields.length === 0) return this.findById(id);
    values.push(id);
    await this.run(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    return this.findById(id);
  }

  async updatePassword(id: number, newPassword: string): Promise<void> {
    await this.init();
    await this.run("UPDATE users SET password = ? WHERE id = ?", [
      newPassword,
      id,
    ]);
  }

  async emailExists(email: string): Promise<boolean> {
    await this.init();
    const rows = await this.all<{ c: number }>(
      "SELECT COUNT(*) AS c FROM users WHERE email = ?",
      [email.toLowerCase()]
    );
    return rows[0]?.c > 0;
  }

  async getCart(userId: number): Promise<CartItemData[]> {
    await this.init();
    const rows = await this.all<CartRow>(
      "SELECT * FROM carts WHERE userId = ?",
      [userId]
    );
    return rows.length ? parseJsonArray<CartItemData>(rows[0].items) : [];
  }

  async saveCart(userId: number, items: CartItemData[]): Promise<void> {
    await this.init();
    const serialized = JSON.stringify(items);
    const existing = await this.all<{ c: number }>(
      "SELECT COUNT(*) AS c FROM carts WHERE userId = ?",
      [userId]
    );
    if (existing[0]?.c > 0) {
      await this.run(
        "UPDATE carts SET items = ? WHERE userId = ?",
        [serialized, userId]
      );
    } else {
      await this.run(
        "INSERT INTO carts (userId, items) VALUES (?, ?)",
        [userId, serialized]
      );
    }
  }

  async createOrder(input: {
    userId: number;
    orderId: string;
    total: number;
    items: Order["items"];
    status?: string;
  }): Promise<Order> {
    await this.init();
    const serialized = JSON.stringify(input.items);
    await this.run(
      `INSERT INTO orders (orderId, userId, status, total, items)
       VALUES (?, ?, ?, ?, ?)`,
      [
        input.orderId,
        input.userId,
        input.status ?? "processing",
        input.total,
        serialized,
      ]
    );
    const rows = await this.all<OrderRow>(
      "SELECT * FROM orders WHERE orderId = ?",
      [input.orderId]
    );
    return rowToOrder(rows[0]);
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    await this.init();
    const rows = await this.all<OrderRow>(
      "SELECT * FROM orders WHERE userId = ? ORDER BY id DESC",
      [userId]
    );
    return rows.map(rowToOrder);
  }
}

export const userDB = UserDB.getInstance();
