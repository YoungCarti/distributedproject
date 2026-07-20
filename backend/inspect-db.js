import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const database = process.env.DB_NAME || 'smart_community';
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database
});

try {
  const [[version]] = await connection.query('SELECT VERSION() AS version');
  const [tables] = await connection.query(
    `SELECT TABLE_NAME AS tableName, TABLE_ROWS AS estimatedRows
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'
     ORDER BY TABLE_NAME`,
    [database]
  );
  const [foreignKeys] = await connection.query(
    `SELECT
       TABLE_NAME AS childTable,
       COLUMN_NAME AS childColumn,
       REFERENCED_TABLE_NAME AS parentTable,
       REFERENCED_COLUMN_NAME AS parentColumn,
       CONSTRAINT_NAME AS constraintName
     FROM information_schema.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL
     ORDER BY TABLE_NAME, COLUMN_NAME`,
    [database]
  );
  const [activities] = await connection.query(
    'SELECT id, title, date, time, venue, capacity, slotsLeft FROM activity_availability'
  );

  console.log(`Connected to ${version.version}; database: ${database}`);
  console.log('\nTables');
  console.table(tables);
  console.log('\nForeign keys');
  console.table(foreignKeys);
  console.log('\nActivity availability');
  console.table(activities);
} finally {
  await connection.end();
}
