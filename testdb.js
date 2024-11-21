import sqlite3 from "sqlite3";
import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";
import fs from "fs";

function testSQLite3() {
  console.log("Testing SQLite3...");
  const db = new sqlite3.Database("mydatebase.db");

  db.serialize(() => {
    db.run("CREATE TABLE test (info TEXT)");

    console.time("SQLite3 Insert");
    db.run("BEGIN TRANSACTION");

    const stmt = db.prepare("INSERT INTO test VALUES (?)");
    for (let i = 0; i < 10000; i++) {
      stmt.run(`Data ${i}`);
    }
    stmt.finalize();

    db.run("COMMIT");
    console.timeEnd("SQLite3 Insert");

    console.time("SQLite3 Query");
    db.all("SELECT * FROM test", (err, rows) => {
      console.log(rows);
      if (err) throw err;
      console.timeEnd("SQLite3 Query");
    });

    db.close();
  });
}

function testLowdb() {
  console.log("Testing Lowdb...");
  const defaultData = { test: [] };
  const db = new LowSync(new JSONFileSync("test.json"), defaultData);
  const dataToInsert = Array.from({ length: 10000 }, (_, i) => `Data ${i}`);
  console.time("Lowdb Insert");
  db.update(({ test }) => test.push(...dataToInsert));
  console.timeEnd("Lowdb Insert");

  console.time("Lowdb Query");
  db.read();
  console.log(db.data.test);
  console.timeEnd("Lowdb Query");
}

function main() {
  // testSQLite3();
  testLowdb();
}

main();
