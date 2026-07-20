USE smart_community;

INSERT INTO users (user_id, name, email, phone, password_hash, role)
VALUES
  (1, 'System Admin', 'admin@admin.com', '0123456789', SHA2('admin123', 256), 'admin'),
  (2, 'Demo Resident', 'resident@example.com', '0198765432', SHA2('resident123', 256), 'user')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  phone = VALUES(phone),
  password_hash = VALUES(password_hash),
  role = VALUES(role);

INSERT INTO activities
  (activity_id, title, description, category, capacity, status, created_by)
VALUES
  (1, 'Community Cleanup Day', 'Help clean and beautify the neighbourhood park.', 'Volunteer', 30, 'Upcoming', 1),
  (2, 'Basic First Aid Workshop', 'Learn essential first aid skills from trained facilitators.', 'Education', 25, 'Upcoming', 1),
  (3, 'Health Screening Campaign', 'Free basic health checks for community residents.', 'Health', 40, 'Upcoming', 1),
  (4, 'Cultural Night', 'An evening of community performances, food and cultural sharing.', 'Social', 60, 'Upcoming', 1)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  category = VALUES(category),
  capacity = VALUES(capacity),
  status = VALUES(status),
  created_by = VALUES(created_by);

INSERT INTO schedules
  (schedule_id, activity_id, session_date, start_time, end_time, venue)
VALUES
  (1, 1, '2026-07-25', '08:00:00', '11:00:00', 'Community Park'),
  (2, 2, '2026-07-26', '09:00:00', '12:00:00', 'Training Room A'),
  (3, 3, '2026-08-01', '09:00:00', '15:00:00', 'Community Main Hall'),
  (4, 4, '2026-08-08', '18:30:00', '22:00:00', 'Community Main Hall')
ON DUPLICATE KEY UPDATE
  activity_id = VALUES(activity_id),
  session_date = VALUES(session_date),
  start_time = VALUES(start_time),
  end_time = VALUES(end_time),
  venue = VALUES(venue);

INSERT INTO announcements
  (announcement_id, posted_by, title, content, posted_date)
VALUES
  (1, 1, 'Welcome to the Community Portal', 'Residents can now browse and register for upcoming community activities online.', '2026-07-17 09:00:00'),
  (2, 1, 'Bring Water for Cleanup Day', 'Participants are encouraged to bring a reusable water bottle and wear comfortable shoes.', '2026-07-17 10:00:00')
ON DUPLICATE KEY UPDATE
  posted_by = VALUES(posted_by),
  title = VALUES(title),
  content = VALUES(content),
  posted_date = VALUES(posted_date);

INSERT INTO registrations
  (registration_id, user_id, activity_id, registration_date, status)
VALUES
  (1, 2, 1, '2026-07-17 10:30:00', 'registered')
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id),
  activity_id = VALUES(activity_id),
  registration_date = VALUES(registration_date),
  status = VALUES(status);
