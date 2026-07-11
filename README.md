# Smart Community Service Management System

## Overview
This is a web-based Distributed Application designed for a local community centre to manage community service activities, registrations, and announcements. The project utilizes a modern 3-tier architecture: Presentation (React), Application (Node.js/Express), and Data (SQLite currently, migrating to MySQL/Firebase).

## Current Project Status
The core foundation of the project has been fully implemented, covering **all Functional and Non-Functional Requirements** specified in the assignment brief. 

### Completed Features:
- **Authentication:** Registration and Login flows with role-based access control (Admin vs. Normal User). Passwords are securely hashed using SHA-256 (`crypto` module).
- **User Dashboard:** 
  - Browse available volunteer programmes and events.
  - Register for activities with capacity checking.
  - View personal participation history.
  - View upcoming schedules and centre announcements.
- **Admin Dashboard (SPA Tabs):**
  - **Manage Activities:** Full CRUD functionality to create, edit, and delete activities. Date, time, and venue are handled directly in the activity creation form.
  - **View Registrations:** Track all resident registrations and export the data to a CSV report.
  - **Manage Announcements:** Post center-wide notices to keep the community informed.
- **Backend Infrastructure:** A complete Node.js/Express REST API serving the frontend.
- **Testing Database:** A temporary **SQLite** database (`database.sqlite`) is actively being used for local testing to ensure all API endpoints and data persistence requirements work seamlessly.

---

## Team Roles & Upcoming Adjustments

### 🧑‍💻 Saabiresh (Core Frontend & Backend)
- **Status:** **Completed (Backend) +  Completed Halfway (Frontend).** 
- **Work done:** Built the full React SPA structure, setup Node.js/Express APIs, integrated temporary SQLite database for testing, and ensured alignment with the required navigation flows.

### 🎨 Aryan (Frontend UI/UX Polish)
- **Status:** **Pending / In Progress.**
- **Task:** Take the existing functional Tailwind CSS interface and upgrade it to a premium look. 
- **Upcoming Adjustments:** Add glassmorphism, refined color palettes, smooth hover interactions, and ensure high-quality responsiveness across mobile and desktop devices. 

### 🗄️ Ariharan & Zhi Le (Database Migration)
- **Status:** **Pending Lecturer Confirmation.**
- **Task:** Migrate the temporary SQLite database to the final production database (MySQL or Firebase) as required by the tech stack rubric.
- **Important Note (Firebase vs MySQL):** The assignment rubric explicitly mentions including *Primary Keys and Foreign Keys*. Since Firebase is a NoSQL database (uses Document IDs/References), we are currently waiting for a reply from the lecturer to confirm if using Firebase will result in a deduction of marks. Once confirmed, swap the SQLite queries in `server.js` with the corresponding SDK calls.

---

## How to Run the Project Locally

You will need two separate terminal windows to run the frontend and backend servers simultaneously.

### 1. Start the Backend Server
```bash
cd backend
npm install
npm start
```
*Note: This will start the API server on port `5001`. It will automatically create the `database.sqlite` file if it doesn't exist.*

### 2. Start the Frontend Server
```bash
cd frontend
npm install
```
**CRITICAL STEP:** You must copy the environment variables file for the frontend to know how to connect to the backend API.
*   Duplicate the `.env.example` file located in the `frontend/` folder.
*   Rename the duplicated file to exactly `.env`.

Once the `.env` file is created, you can start the server:
```bash
npm run dev
```
*Note: This will start the Vite React server (usually on `http://localhost:5173`).*

### Test Accounts
- **Admin:** `admin@admin.com` / `admin123`
- **User:** Register a new account via the UI, or look in the SQLite database for test accounts.

---

## 🛠️ Troubleshooting

**"Port 5001 is already in use" / Server won't start:**
Sometimes when you stop the backend server using `Ctrl + C`, the node process doesn't close completely and port 5001 remains open in the background. If you try to run `npm start` again, you will get an error like this:

```bash
> smart-community-backend@1.0.0 start
> node server.js

node:events:486
      throw er; // Unhandled 'error' event
      ^

Error: listen EADDRINUSE: address already in use :::5001
...
```

If you receive this `EADDRINUSE` error, it means the port is stuck. To completely kill the background process and free up port 5001, run the following command:

```bash
kill -9 $(lsof -t -i:5001)
```

After running that command, the port will be completely cleared. You can then run `npm start` again and it will successfully start up:
```bash
> smart-community-backend@1.0.0 start
> node server.js

Server running on port 5001
```
# distributedproject
