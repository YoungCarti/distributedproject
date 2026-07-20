CREATE DATABASE IF NOT EXISTS smart_community
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE smart_community;

CREATE TABLE IF NOT EXISTS users (
  user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS activities (
  activity_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'General',
  capacity INT UNSIGNED NOT NULL,
  status ENUM('Upcoming', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Upcoming',
  created_by INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (activity_id),
  KEY idx_activities_status (status),
  CONSTRAINT chk_activities_capacity CHECK (capacity > 0),
  CONSTRAINT fk_activities_created_by
    FOREIGN KEY (created_by) REFERENCES users (user_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS schedules (
  schedule_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  activity_id INT UNSIGNED NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NULL,
  venue VARCHAR(150) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (schedule_id),
  UNIQUE KEY uq_schedule_session (activity_id, session_date, start_time),
  KEY idx_schedules_date (session_date, start_time),
  CONSTRAINT fk_schedules_activity
    FOREIGN KEY (activity_id) REFERENCES activities (activity_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS registrations (
  registration_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  activity_id INT UNSIGNED NOT NULL,
  registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('registered', 'attended', 'cancelled') NOT NULL DEFAULT 'registered',
  PRIMARY KEY (registration_id),
  UNIQUE KEY uq_registration_user_activity (user_id, activity_id),
  KEY idx_registrations_activity_status (activity_id, status),
  CONSTRAINT fk_registrations_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_registrations_activity
    FOREIGN KEY (activity_id) REFERENCES activities (activity_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS announcements (
  announcement_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  posted_by INT UNSIGNED NULL,
  title VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  posted_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (announcement_id),
  KEY idx_announcements_posted_date (posted_date),
  CONSTRAINT fk_announcements_posted_by
    FOREIGN KEY (posted_by) REFERENCES users (user_id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE OR REPLACE VIEW activity_availability AS
SELECT
  a.activity_id AS id,
  a.title,
  a.description,
  a.category,
  a.capacity,
  a.status,
  a.created_by AS createdBy,
  a.created_at AS createdAt,
  s.schedule_id AS scheduleId,
  DATE_FORMAT(s.session_date, '%Y-%m-%d') AS `date`,
  TIME_FORMAT(s.start_time, '%H:%i') AS `time`,
  TIME_FORMAT(s.end_time, '%H:%i') AS endTime,
  s.venue,
  GREATEST(
    a.capacity - SUM(CASE WHEN r.status = 'registered' THEN 1 ELSE 0 END),
    0
  ) AS slotsLeft
FROM activities a
LEFT JOIN schedules s
  ON s.schedule_id = (
    SELECT s2.schedule_id
    FROM schedules s2
    WHERE s2.activity_id = a.activity_id
    ORDER BY s2.session_date, s2.start_time, s2.schedule_id
    LIMIT 1
  )
LEFT JOIN registrations r ON r.activity_id = a.activity_id
GROUP BY
  a.activity_id, a.title, a.description, a.category, a.capacity, a.status,
  a.created_by, a.created_at, s.schedule_id, s.session_date, s.start_time,
  s.end_time, s.venue;
