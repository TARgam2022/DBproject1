import mysql, { Pool, RowDataPacket, ResultSetHeader } from "mysql2/promise";

let pool: Pool | null = null;

type URLConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: { rejectUnauthorized: boolean };
};

function parseDatabaseUrl(raw: string): URLConfig {
  const u = new URL(raw);
  return {
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
    ssl:
      u.searchParams.get("ssl") === "true"
        ? { rejectUnauthorized: false }
        : undefined,
  };
}

export function getPool(): Pool {
  if (pool) return pool;

  const fromUrl = process.env.DATABASE_URL
    ? parseDatabaseUrl(process.env.DATABASE_URL)
    : null;

  const config: mysql.PoolOptions = {
    host: fromUrl?.host ?? process.env.DB_HOST,
    port: fromUrl?.port ?? (process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined),
    user: fromUrl?.user ?? process.env.DB_USER,
    password: fromUrl?.password ?? process.env.DB_PASSWORD,
    database: fromUrl?.database ?? process.env.DB_NAME,
    connectionLimit: Number(process.env.DB_POOL_LIMIT || 5),
    waitForConnections: true,
    queueLimit: 0,
  };

  const needSsl = fromUrl?.ssl != null || process.env.DB_SSL === "true";
  if (needSsl) {
    config.ssl = { rejectUnauthorized: false };
  }

  if (process.env.NODE_ENV === "production" && !config.host) {
    throw new Error(
      "DATABASE_URL (o DB_HOST/DB_USER/DB_PASSWORD/DB_NAME) es obligatorio en producción."
    );
  }

  pool = mysql.createPool(config);
  return pool;
}

export async function query<T = RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params: any[] = []
): Promise<T> {
  const [rows] = await getPool().query(sql, params);
  return rows as T;
}

export async function execute<T = RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params: any[] = []
): Promise<T> {
  const [rows] = await getPool().execute(sql, params);
  return rows as T;
}

export async function ping(): Promise<void> {
  const conn = await getPool().getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
}
