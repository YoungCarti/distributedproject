USE smart_community;

-- 1. Show all five relational tables and the availability view.
SHOW FULL TABLES;

-- 2. Show activities with schedule information and calculated remaining slots.
SELECT id, title, category, date, time, venue, capacity, slotsLeft
FROM activity_availability
ORDER BY date, time;

-- 3. Show registrations by joining three related tables.
SELECT
  r.registration_id,
  u.name AS participant,
  u.email,
  a.title AS activity,
  r.registration_date,
  r.status
FROM registrations r
JOIN users u ON u.user_id = r.user_id
JOIN activities a ON a.activity_id = r.activity_id
ORDER BY r.registration_date DESC;

-- 4. Show the foreign keys that enforce table relationships.
SELECT
  TABLE_NAME AS child_table,
  COLUMN_NAME AS child_column,
  REFERENCED_TABLE_NAME AS parent_table,
  REFERENCED_COLUMN_NAME AS parent_column,
  CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'smart_community'
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME;
