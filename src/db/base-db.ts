import { readFileSync } from "node:fs";
import { execute, query } from "./mysql";
import { ResultSetHeader } from "mysql2/promise";

type CountRow = { c: number };

export abstract class BaseDB {
  protected abstract tableName: string;

  protected async run(sql: string, params: unknown[] = []): Promise<ResultSetHeader> {
    return execute<ResultSetHeader>(sql, params);
  }

  protected async all<T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = []
  ): Promise<T[]> {
    return execute<T[]>(sql, params);
  }

  protected async ddl(sql: string): Promise<void> {
    await query(sql);
  }

  protected getColumnType(): string {
    return "TEXT";
  }

  protected async columnExists(
    table: string,
    column: string
  ): Promise<boolean> {
    const rows = await query<any[]>(
      "SELECT COLUMN_NAME AS name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
      [table, column]
    );
    return rows.length > 0;
  }

  protected async count(table: string): Promise<number> {
    const rows = await execute<CountRow[]>(`SELECT COUNT(*) AS c FROM ${table}`);
    return Number(rows[0]?.c ?? 0);
  }

  protected async seedFromFile(
    table: string,
    seedPath: string
  ): Promise<void> {
    await this.runWithLock(table, seedPath);
  }

  private async runWithLock(table: string, seedPath: string): Promise<void> {
    const conn = await (await import("./mysql")).getPool().getConnection();
    try {
      await conn.query("SELECT GET_LOCK(?, 10)", [`seed_${table}`]);
      const [current] = await conn.query(
        `SELECT COUNT(*) AS c FROM ${table} LIMIT 1`
      );
      const count = Number((current as CountRow[])[0]?.c ?? 0);
      if (count === 0) {
        const sql = readFileSync(seedPath, "utf-8");
        const statements = sql
          .split(";")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        for (const stmt of statements) {
          await conn.query(stmt + ";");
        }
      }
    } finally {
      await conn.query("SELECT RELEASE_LOCK(?)", [`seed_${table}`]).catch(() => {});
      conn.release();
    }
  }
}
