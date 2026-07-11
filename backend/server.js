import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let db;

// Initialize Database
async function initDB() {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      phone TEXT,
      password_hash TEXT,
      role TEXT
    );
    
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      category TEXT,
      capacity INTEGER,
      slotsLeft INTEGER,
      date TEXT,
      time TEXT,
      venue TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      activityId INTEGER,
      activity TEXT,
      date TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      posted_date TEXT
    );
  `);

  // Insert default admin if not exists
  const admin = await db.get('SELECT * FROM users WHERE email = ?', ['admin@admin.com']);
  if (!admin) {
    const adminHash = crypto.createHash('sha256').update('admin123').digest('hex');
    await db.run('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)', ['Admin', 'admin@admin.com', '123456', adminHash, 'admin']);
  }
}

initDB().catch(console.error);

// Health Check
app.get('/api/health', (req, res) => res.status(200).json({ status: 'success', message: 'Backend is running correctly!' }));

// AUTH ENDPOINTS (P1, P2)
app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });
  
  try {
    const existing = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ message: 'Email is already registered' });
    
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    
    const result = await db.run(
      'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, hash, 'user']
    );
    res.status(201).json({ message: 'Registration successful!', user: { id: result.lastID, name, role: 'user' } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const user = await db.get('SELECT * FROM users WHERE email = ? AND password_hash = ?', [email, hash]);
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    res.status(200).json({ message: 'Login successful!', user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ACTIVITY ENDPOINTS (P3, P4)
app.get('/api/activities', async (req, res) => {
  const activities = await db.all('SELECT * FROM activities');
  res.json(activities);
});

app.get('/api/activities/:id', async (req, res) => {
  const activity = await db.get('SELECT * FROM activities WHERE id = ?', [req.params.id]);
  if (!activity) return res.status(404).json({ message: 'Activity not found' });
  res.json(activity);
});

app.post('/api/activities', async (req, res) => {
  const { title, description, category, capacity, date, time, venue } = req.body;
  if (!title || !date || !time) return res.status(400).json({ message: 'Missing required fields' });
  
  const cap = parseInt(capacity) || 0;
  try {
    const result = await db.run(
      'INSERT INTO activities (title, description, category, capacity, slotsLeft, date, time, venue, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description || '', category || 'General', cap, cap, date, time, venue || 'TBA', 'Upcoming']
    );
    const newActivity = await db.get('SELECT * FROM activities WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Activity created', activity: newActivity });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/activities/:id', async (req, res) => {
  const current = await db.get('SELECT * FROM activities WHERE id = ?', [req.params.id]);
  if (!current) return res.status(404).json({ message: 'Activity not found' });
  
  const { title, description, category, capacity, date, time, venue, status } = req.body;
  
  const cap = capacity ? parseInt(capacity) : current.capacity;
  const slotsLeft = capacity ? parseInt(capacity) - (current.capacity - current.slotsLeft) : current.slotsLeft;

  await db.run(
    'UPDATE activities SET title = ?, description = ?, category = ?, capacity = ?, slotsLeft = ?, date = ?, time = ?, venue = ?, status = ? WHERE id = ?',
    [
      title || current.title,
      description || current.description,
      category || current.category,
      cap,
      slotsLeft,
      date || current.date,
      time || current.time,
      venue || current.venue,
      status || current.status,
      req.params.id
    ]
  );
  
  const updated = await db.get('SELECT * FROM activities WHERE id = ?', [req.params.id]);
  res.json({ message: 'Activity updated', activity: updated });
});

app.delete('/api/activities/:id', async (req, res) => {
  const result = await db.run('DELETE FROM activities WHERE id = ?', [req.params.id]);
  if (result.changes === 0) return res.status(404).json({ message: 'Activity not found' });
  res.json({ message: 'Activity deleted' });
});

// REGISTRATION ENDPOINTS (P4, P5)
app.post('/api/registrations', async (req, res) => {
  const { userId, activityId } = req.body;
  
  const activity = await db.get('SELECT * FROM activities WHERE id = ?', [activityId]);
  if (!activity) return res.status(404).json({ message: 'Activity not found' });
  if (activity.slotsLeft <= 0) return res.status(400).json({ message: 'Activity is full' });
  
  const existing = await db.get('SELECT * FROM registrations WHERE userId = ? AND activityId = ?', [userId, activityId]);
  if (existing) {
    return res.status(400).json({ message: 'You have already registered for this activity.' });
  }

  await db.run('UPDATE activities SET slotsLeft = slotsLeft - 1 WHERE id = ?', [activityId]);
  
  const dateStr = new Date().toISOString().split('T')[0];
  const result = await db.run(
    'INSERT INTO registrations (userId, activityId, activity, date, status) VALUES (?, ?, ?, ?, ?)',
    [userId, activityId, activity.title, dateStr, 'registered']
  );
  
  const reg = await db.get('SELECT * FROM registrations WHERE id = ?', [result.lastID]);
  res.status(201).json({ message: 'Registered successfully', registration: reg });
});

app.get('/api/users/:userId/registrations', async (req, res) => {
  const userRegs = await db.all('SELECT * FROM registrations WHERE userId = ?', [req.params.userId]);
  res.json(userRegs);
});

app.get('/api/registrations', async (req, res) => {
  const regs = await db.all(`
    SELECT r.*, u.name as userName, u.email as userEmail
    FROM registrations r
    LEFT JOIN users u ON r.userId = u.id
  `);
  res.json(regs);
});

// ANNOUNCEMENT ENDPOINTS (P6)
app.get('/api/announcements', async (req, res) => {
  const announcements = await db.all('SELECT * FROM announcements ORDER BY id DESC');
  res.json(announcements);
});

app.post('/api/announcements', async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ message: 'Title and content required' });
  
  const dateStr = new Date().toISOString().split('T')[0];
  const result = await db.run(
    'INSERT INTO announcements (title, content, posted_date) VALUES (?, ?, ?)',
    [title, content, dateStr]
  );
  
  const newAnn = await db.get('SELECT * FROM announcements WHERE id = ?', [result.lastID]);
  res.status(201).json({ message: 'Announcement posted', announcement: newAnn });
});

app.delete('/api/announcements/:id', async (req, res) => {
  const result = await db.run('DELETE FROM announcements WHERE id = ?', [req.params.id]);
  if (result.changes === 0) return res.status(404).json({ message: 'Announcement not found' });
  res.json({ message: 'Announcement deleted' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
