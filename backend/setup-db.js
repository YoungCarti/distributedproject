import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
});

try {
  const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
  const seed = await readFile(new URL('./seed.sql', import.meta.url), 'utf8');
  await connection.query(schema);
  await connection.query(seed);

  const database = process.env.DB_NAME || 'smart_community';
  const [tables] = await connection.query(
    `SELECT TABLE_NAME, TABLE_TYPE
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ?
     ORDER BY TABLE_TYPE, TABLE_NAME`,
    [database]
  );

  console.log(`Database '${database}' is ready.`);
  console.table(tables);
  console.log('Run "npm run db:inspect" to view row counts and foreign keys.');
} finally {
  await connection.end();
}
