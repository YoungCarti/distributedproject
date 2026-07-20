CREATE DATABASE IF NOT EXISTS smart_community
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

CREATE USER IF NOT EXISTS 'community_app'@'localhost'
  IDENTIFIED BY 'CommunityApp2026!';
CREATE USER IF NOT EXISTS 'community_app'@'127.0.0.1'
  IDENTIFIED BY 'CommunityApp2026!';

ALTER USER 'community_app'@'localhost'
  IDENTIFIED BY 'CommunityApp2026!';
ALTER USER 'community_app'@'127.0.0.1'
  IDENTIFIED BY 'CommunityApp2026!';

GRANT ALL PRIVILEGES ON smart_community.*
  TO 'community_app'@'localhost';
GRANT ALL PRIVILEGES ON smart_community.*
  TO 'community_app'@'127.0.0.1';

FLUSH PRIVILEGES;
