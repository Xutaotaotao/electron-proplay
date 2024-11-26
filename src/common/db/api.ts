import { app } from "electron";
import * as path from "path";
import * as sqlite3 from "sqlite3";

const userDataPath = app.getPath("userData");
const dbPath = path.join(userDataPath, "sqliteDatabase.db");

export interface queryParam {
  sql: string;
  params?: any[];
}

export interface insertParam {
  table: string;
  data: { [key: string]: any };
}

export interface updateParam {
  table: string;
  data: { [key: string]: any };
  condition: string;
}

export interface deleteParam {
  table: string;
  condition: string;
}

class Database {
  private static instance: Database;
  private db: sqlite3.Database;

  private constructor() {
    this.db = new sqlite3.Database(dbPath);
  }

  static async getInstance(): Promise<Database> {
    if (!Database.instance) {
      Database.instance = new Database();
      await Database.instance.open();
      await Database.instance.initializeSchema();
    }
    return Database.instance;
  }

  private open(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run("PRAGMA foreign_keys = ON", (err) => {
          if (err) {
            reject(err);
          } else {
            console.log("Connected to the database.");
            resolve();
          }
        });
      });
    });
  }

  private initializeSchema(): Promise<void> {
    return this.query({
      sql: `
      CREATE TABLE IF NOT EXISTS test (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        age INTEGER
      )
    `,
    }).then(() => {
      console.log("Database schema initialized.");
    }).catch((err) => {
      console.error("Error initializing database schema:", err);
    });
  }

  close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log("Database closed.");
          resolve();
        }
      });
    });
  }

  query(param: queryParam): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      this.db.all(param.sql, param.params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  insert(param: insertParam): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const keys = Object.keys(param.data);
      const values = Object.values(param.data);
      const placeholders = keys.map(() => "?").join(",");
      const sql = `INSERT INTO ${param.table} (${keys.join(
        ","
      )}) VALUES (${placeholders})`;

      this.db.run(sql, values, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  update(param: updateParam): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const entries = Object.entries(param.data)
        .map(([key, value]) => `${key} = ?`)
        .join(",");
      const params = Object.values(param.data);
      const sql = `UPDATE ${param.table} SET ${entries} WHERE ${param.condition}`;

      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  delete(param: deleteParam): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const sql = `DELETE FROM ${param.table} WHERE ${param.condition}`;

      this.db.run(sql, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

// Wrap database calls to ensure initialization
const getDatabase = async (): Promise<Database> => {
  return await Database.getInstance();
};

export const sqQuery = async (param: queryParam) => {
  const db = await getDatabase();
  return db.query(param);
};

export const sqInsert = async (param: insertParam) => {
  const db = await getDatabase();
  return db.insert(param);
};

export const sqUpdate = async (param: updateParam) => {
  const db = await getDatabase();
  return db.update(param);
};

export const sqDelete = async (param: deleteParam) => {
  const db = await getDatabase();
  return db.delete(param);
};
