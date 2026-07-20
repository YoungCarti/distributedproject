# Smart Community Service Management System

A three-tier distributed web application for managing community activities, schedules,
registrations, participation history, and announcements.

## Final technology stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: Oracle MySQL 8.4 Community Server through `mysql2`
- Architecture: Three-tier client-server architecture

The original SQLite file is retained only as a legacy prototype. The running backend now uses
the relational `smart_community` database on Oracle MySQL 8.4.

## Database design

The implementation contains five related InnoDB tables:

- `users`
- `activities`
- `schedules`
- `registrations`
- `announcements`

Primary keys, foreign keys, unique constraints, indexes, and an ERD-aligned schema are defined
in `backend/schema.sql`. Registration capacity is calculated by the
`activity_availability` view. The registration endpoint uses a database transaction and row
lock to prevent overbooking during concurrent requests.

## Run locally with Oracle MySQL 8.4

### 1. Start Oracle MySQL

Install Oracle MySQL Community Server 8.4 and configure it as the `MySQL84` Windows service on
port `3306`. Start it from Windows Services when it is not already running.

Do not start the XAMPP **MySQL** button for this project. XAMPP provides MariaDB and would
conflict with the Oracle `MySQL84` service on port `3306`.

### 2. Configure and create the database

Open a terminal in `backend`:

```bash
npm install
```

Copy `.env.example` to `.env`. Before the first setup, connect as the MySQL root user and run
`backend/create-app-user.sql` to create the local demonstration account used by `.env`.

Create all tables and insert demonstration data:

```bash
npm run db:setup
```

Inspect the tables, foreign keys, and activity availability:

```bash
npm run db:inspect
```

Start the backend on port `5001`:

```bash
npm start
```

Confirm the Oracle MySQL connection at <http://localhost:5001/api/health>.

### 3. Start the frontend

Open another terminal in `frontend`, copy `.env.example` to `.env`, and run:

```bash
npm install
npm run dev
```

The frontend connects to `http://localhost:5001/api`.

## View the database

Use MySQL Workbench and create a local connection with host `127.0.0.1`, port `3306`, user
`community_app`, and the password from `backend/.env`. Open the `smart_community` schema to
browse tables, run SQL queries, and reverse-engineer the ERD.

Useful demonstration queries are available in `backend/demo-queries.sql`.

## Test accounts

- Admin: `admin@admin.com` / `admin123`
- Resident: `resident@example.com` / `resident123`

## REST API coverage

- Authentication: register and login
- Activities: list, details, create, update, delete
- Schedules: list, create, update, delete
- Registrations: capacity checking, duplicate prevention, participation history, admin report
- Announcements: list, create, delete

## Team responsibilities

- Requirement analysis and report: Terrell
- Frontend/backend foundation: Saabiresh
- Frontend UI: Aryan
- MySQL/MariaDB database: Ariharan and Zhi Le
- Demonstration: each member explains their contribution
