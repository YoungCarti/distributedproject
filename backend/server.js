import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5001);

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_community',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

const activityOrder = "ORDER BY (`date` IS NULL), `date`, `time`, id";

async function getActivity(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM activity_availability WHERE id = ?',
    [id]
  );
  return rows[0];
}

async function getRegistration(id, connection = pool) {
  const [rows] = await connection.execute(
    `SELECT
       r.registration_id AS id,
       r.user_id AS userId,
       r.activity_id AS activityId,
       a.title AS activity,
       DATE_FORMAT(r.registration_date, '%Y-%m-%d') AS date,
       r.status
     FROM registrations r
     JOIN activities a ON a.activity_id = r.activity_id
     WHERE r.registration_id = ?`,
    [id]
  );
  return rows[0];
}

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT VERSION() AS databaseVersion');
    res.json({
      status: 'success',
      message: 'Backend and Oracle MySQL are connected!',
      database: process.env.DB_NAME || 'smart_community',
      databaseVersion: rows[0].databaseVersion
    });
  } catch (error) {
    res.status(503).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Authentication
app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES (?, ?, ?, ?, 'user')`,
      [name.trim(), email.trim().toLowerCase(), phone || null, hash]
    );
    res.status(201).json({
      message: 'Registration successful!',
      user: { id: result.insertId, name: name.trim(), role: 'user' }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email is already registered' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const [rows] = await pool.execute(
      `SELECT user_id AS id, name, role
       FROM users
       WHERE email = ? AND password_hash = ?`,
      [email.trim().toLowerCase(), hash]
    );
    if (!rows[0]) return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ message: 'Login successful!', user: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Activities and their first scheduled session
app.get('/api/activities', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM activity_availability ${activityOrder}`);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load activities' });
  }
});

app.get('/api/activities/:id', async (req, res) => {
  try {
    const activity = await getActivity(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    res.json(activity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load activity' });
  }
});

app.post('/api/activities', async (req, res) => {
  const { title, description, category, capacity, date, time, endTime, venue, createdBy } = req.body;
  const cap = Number(capacity);
  if (!title || !date || !time || !Number.isInteger(cap) || cap <= 0) {
    return res.status(400).json({ message: 'Title, date, time, and a positive capacity are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [activityResult] = await connection.execute(
      `INSERT INTO activities
         (title, description, category, capacity, status, created_by)
       VALUES (?, ?, ?, ?, 'Upcoming', ?)`,
      [title.trim(), description || null, category || 'General', cap, createdBy || 1]
    );
    await connection.execute(
      `INSERT INTO schedules (activity_id, session_date, start_time, end_time, venue)
       VALUES (?, ?, ?, ?, ?)`,
      [activityResult.insertId, date, time, endTime || null, venue || 'TBA']
    );
    await connection.commit();
    res.status(201).json({
      message: 'Activity created',
      activity: await getActivity(activityResult.insertId)
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Unable to create activity' });
  } finally {
    connection.release();
  }
});

app.put('/api/activities/:id', async (req, res) => {
  const { title, description, category, capacity, date, time, endTime, venue, status } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [currentRows] = await connection.execute(
      'SELECT * FROM activities WHERE activity_id = ? FOR UPDATE',
      [req.params.id]
    );
    const current = currentRows[0];
    if (!current) {
      await connection.rollback();
      return res.status(404).json({ message: 'Activity not found' });
    }

    const cap = capacity === undefined ? current.capacity : Number(capacity);
    if (!Number.isInteger(cap) || cap <= 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Capacity must be a positive integer' });
    }

    const [[registrationCount]] = await connection.execute(
      "SELECT COUNT(*) AS total FROM registrations WHERE activity_id = ? AND status = 'registered'",
      [req.params.id]
    );
    if (cap < registrationCount.total) {
      await connection.rollback();
      return res.status(400).json({ message: 'Capacity cannot be lower than current registrations' });
    }

    await connection.execute(
      `UPDATE activities
       SET title = ?, description = ?, category = ?, capacity = ?, status = ?
       WHERE activity_id = ?`,
      [
        title ?? current.title,
        description ?? current.description,
        category ?? current.category,
        cap,
        status ?? current.status,
        req.params.id
      ]
    );

    const [scheduleRows] = await connection.execute(
      `SELECT schedule_id FROM schedules
       WHERE activity_id = ?
       ORDER BY session_date, start_time, schedule_id
       LIMIT 1`,
      [req.params.id]
    );
    if (scheduleRows[0]) {
      await connection.execute(
        `UPDATE schedules
         SET session_date = COALESCE(?, session_date),
             start_time = COALESCE(?, start_time),
             end_time = ?,
             venue = COALESCE(?, venue)
         WHERE schedule_id = ?`,
        [date || null, time || null, endTime || null, venue || null, scheduleRows[0].schedule_id]
      );
    } else if (date && time) {
      await connection.execute(
        `INSERT INTO schedules (activity_id, session_date, start_time, end_time, venue)
         VALUES (?, ?, ?, ?, ?)`,
        [req.params.id, date, time, endTime || null, venue || 'TBA']
      );
    }

    await connection.commit();
    res.json({ message: 'Activity updated', activity: await getActivity(req.params.id) });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Unable to update activity' });
  } finally {
    connection.release();
  }
});

app.delete('/api/activities/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM activities WHERE activity_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Activity not found' });
    res.json({ message: 'Activity deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to delete activity' });
  }
});

// Registration uses a transaction and row lock to prevent overbooking.
app.post('/api/registrations', async (req, res) => {
  const { userId, activityId } = req.body;
  if (!userId || !activityId) {
    return res.status(400).json({ message: 'User and activity are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [activityRows] = await connection.execute(
      'SELECT activity_id, capacity, status FROM activities WHERE activity_id = ? FOR UPDATE',
      [activityId]
    );
    const activity = activityRows[0];
    if (!activity) {
      await connection.rollback();
      return res.status(404).json({ message: 'Activity not found' });
    }
    if (activity.status !== 'Upcoming') {
      await connection.rollback();
      return res.status(400).json({ message: 'This activity is not open for registration' });
    }

    const [[countRow]] = await connection.execute(
      "SELECT COUNT(*) AS total FROM registrations WHERE activity_id = ? AND status = 'registered'",
      [activityId]
    );
    if (countRow.total >= activity.capacity) {
      await connection.rollback();
      return res.status(400).json({ message: 'Activity is full' });
    }

    const [result] = await connection.execute(
      `INSERT INTO registrations (user_id, activity_id, status)
       VALUES (?, ?, 'registered')`,
      [userId, activityId]
    );
    await connection.commit();
    res.status(201).json({
      message: 'Registered successfully',
      registration: await getRegistration(result.insertId)
    });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'You have already registered for this activity.' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ message: 'The selected user or activity does not exist' });
    }
    console.error(error);
    res.status(500).json({ message: 'Unable to register for activity' });
  } finally {
    connection.release();
  }
});

app.get('/api/users/:userId/registrations', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
         r.registration_id AS id,
         r.activity_id AS activityId,
         a.title AS activity,
         DATE_FORMAT(r.registration_date, '%Y-%m-%d') AS date,
         r.status
       FROM registrations r
       JOIN activities a ON a.activity_id = r.activity_id
       WHERE r.user_id = ?
       ORDER BY r.registration_date DESC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load participation history' });
  }
});

app.get('/api/registrations', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         r.registration_id AS id,
         r.activity_id AS activityId,
         a.title AS activity,
         u.name AS userName,
         u.email AS userEmail,
         DATE_FORMAT(r.registration_date, '%Y-%m-%d') AS date,
         r.status
       FROM registrations r
       JOIN users u ON u.user_id = r.user_id
       JOIN activities a ON a.activity_id = r.activity_id
       ORDER BY r.registration_date DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load registrations' });
  }
});

// Schedules
app.get('/api/schedules', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         s.schedule_id AS id,
         s.activity_id AS activityId,
         a.title AS activity,
         DATE_FORMAT(s.session_date, '%Y-%m-%d') AS date,
         TIME_FORMAT(s.start_time, '%H:%i') AS time,
         TIME_FORMAT(s.end_time, '%H:%i') AS endTime,
         s.venue
       FROM schedules s
       JOIN activities a ON a.activity_id = s.activity_id
       ORDER BY s.session_date, s.start_time, s.schedule_id`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load schedules' });
  }
});

app.post('/api/schedules', async (req, res) => {
  const { activityId, date, time, endTime, venue } = req.body;
  if (!activityId || !date || !time || !venue) {
    return res.status(400).json({ message: 'Activity, date, time, and venue are required' });
  }
  try {
    const [result] = await pool.execute(
      `INSERT INTO schedules (activity_id, session_date, start_time, end_time, venue)
       VALUES (?, ?, ?, ?, ?)`,
      [activityId, date, time, endTime || null, venue]
    );
    const [rows] = await pool.execute(
      `SELECT schedule_id AS id, activity_id AS activityId,
              DATE_FORMAT(session_date, '%Y-%m-%d') AS date,
              TIME_FORMAT(start_time, '%H:%i') AS time,
              TIME_FORMAT(end_time, '%H:%i') AS endTime, venue
       FROM schedules WHERE schedule_id = ?`,
      [result.insertId]
    );
    res.status(201).json({ message: 'Schedule created', schedule: rows[0] });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'This schedule session already exists' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ message: 'Activity does not exist' });
    }
    console.error(error);
    res.status(500).json({ message: 'Unable to create schedule' });
  }
});

app.put('/api/schedules/:id', async (req, res) => {
  const { activityId, date, time, endTime, venue } = req.body;
  try {
    const [result] = await pool.execute(
      `UPDATE schedules
       SET activity_id = COALESCE(?, activity_id),
           session_date = COALESCE(?, session_date),
           start_time = COALESCE(?, start_time),
           end_time = ?,
           venue = COALESCE(?, venue)
       WHERE schedule_id = ?`,
      [activityId || null, date || null, time || null, endTime || null, venue || null, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Schedule not found' });
    res.json({ message: 'Schedule updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to update schedule' });
  }
});

app.delete('/api/schedules/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM schedules WHERE schedule_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Schedule not found' });
    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to delete schedule' });
  }
});

// Announcements
app.get('/api/announcements', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT announcement_id AS id, title, content,
              DATE_FORMAT(posted_date, '%Y-%m-%d') AS posted_date
       FROM announcements
       ORDER BY posted_date DESC, announcement_id DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load announcements' });
  }
});

app.post('/api/announcements', async (req, res) => {
  const { title, content, postedBy } = req.body;
  if (!title || !content) return res.status(400).json({ message: 'Title and content required' });
  try {
    const [result] = await pool.execute(
      'INSERT INTO announcements (posted_by, title, content) VALUES (?, ?, ?)',
      [postedBy || 1, title.trim(), content.trim()]
    );
    const [rows] = await pool.execute(
      `SELECT announcement_id AS id, title, content,
              DATE_FORMAT(posted_date, '%Y-%m-%d') AS posted_date
       FROM announcements WHERE announcement_id = ?`,
      [result.insertId]
    );
    res.status(201).json({ message: 'Announcement posted', announcement: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to post announcement' });
  }
});

app.delete('/api/announcements/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM announcements WHERE announcement_id = ?',
      [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Announcement not found' });
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to delete announcement' });
  }
});

async function startServer() {
  await pool.query('SELECT 1');
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Connected to Oracle MySQL database: ${process.env.DB_NAME || 'smart_community'}`);
  });
}

startServer().catch((error) => {
  console.error('Unable to start backend. Check Oracle MySQL and backend/.env.');
  console.error(error.message);
  process.exit(1);
});
