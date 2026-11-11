-- JnS CRM hardening migration (MySQL / MariaDB)
-- Apply once against the application database:
--   mysql -u <user> -p <database> < db/migrations/001_hardening.sql
-- Safe to re-run guards are noted per statement where possible.

-- ---------------------------------------------------------------------------
-- Durable refresh-token revocation
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS revoked_tokens (
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (token_hash),
  KEY idx_revoked_tokens_expires_at (expires_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Append-only audit trail for privileged / destructive actions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  actor_id BIGINT NULL,
  actor_email VARCHAR(254) NULL,
  actor_role VARCHAR(32) NULL,
  action VARCHAR(64) NOT NULL,
  entity VARCHAR(64) NULL,
  entity_id VARCHAR(128) NULL,
  metadata JSON NULL,
  ip_address VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_logs_actor (actor_id),
  KEY idx_audit_logs_action (action),
  KEY idx_audit_logs_created_at (created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Query performance indexes (only create if they do not already exist)
-- ---------------------------------------------------------------------------
SET @db := DATABASE();

SET @sql := (SELECT IF(
  EXISTS(SELECT 1 FROM information_schema.statistics
         WHERE table_schema = @db AND table_name = 'leads' AND index_name = 'idx_leads_status_created'),
  'SELECT 1',
  'ALTER TABLE leads ADD INDEX idx_leads_status_created (status, created_at)'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF(
  EXISTS(SELECT 1 FROM information_schema.statistics
         WHERE table_schema = @db AND table_name = 'leads' AND index_name = 'idx_leads_form_type'),
  'SELECT 1',
  'ALTER TABLE leads ADD INDEX idx_leads_form_type (form_type)'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF(
  EXISTS(SELECT 1 FROM information_schema.statistics
         WHERE table_schema = @db AND table_name = 'leads' AND index_name = 'idx_leads_created_at'),
  'SELECT 1',
  'ALTER TABLE leads ADD INDEX idx_leads_created_at (created_at)'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF(
  EXISTS(SELECT 1 FROM information_schema.statistics
         WHERE table_schema = @db AND table_name = 'blogs' AND index_name = 'idx_blogs_status_created'),
  'SELECT 1',
  'ALTER TABLE blogs ADD INDEX idx_blogs_status_created (status, created_at)'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF(
  EXISTS(SELECT 1 FROM information_schema.statistics
         WHERE table_schema = @db AND table_name = 'blogs' AND index_name = 'idx_blogs_slug'),
  'SELECT 1',
  'ALTER TABLE blogs ADD INDEX idx_blogs_slug (slug)'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF(
  EXISTS(SELECT 1 FROM information_schema.statistics
         WHERE table_schema = @db AND table_name = 'pages' AND index_name = 'idx_pages_slug'),
  'SELECT 1',
  'ALTER TABLE pages ADD INDEX idx_pages_slug (slug)'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF(
  EXISTS(SELECT 1 FROM information_schema.statistics
         WHERE table_schema = @db AND table_name = 'users' AND index_name = 'idx_users_email'),
  'SELECT 1',
  'ALTER TABLE users ADD INDEX idx_users_email (email)'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF(
  EXISTS(SELECT 1 FROM information_schema.statistics
         WHERE table_schema = @db AND table_name = 'users' AND index_name = 'idx_users_status_role'),
  'SELECT 1',
  'ALTER TABLE users ADD INDEX idx_users_status_role (status, role)'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
