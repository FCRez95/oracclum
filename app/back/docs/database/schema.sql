-- Oracclum Backend portfolio schema
-- MySQL 8.x / InnoDB / utf8mb4
--
-- Create any database name you prefer, select it, and then run this file:
--   mysql -u <user> -p <database_name> < docs/database/schema.sql

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS Users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  cpfcnpj VARCHAR(32) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  user_type VARCHAR(32) NOT NULL DEFAULT 'user',
  allow_clicks TINYINT(1) NOT NULL DEFAULT 1,
  access_token TEXT NULL,
  taboola_info TEXT NULL,
  taboola_access_token TEXT NULL,
  meta_access_token TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_access_token (access_token(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS campaigns (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_user BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  link TEXT NOT NULL,
  click_auth VARCHAR(255) NOT NULL,
  ad_provider VARCHAR(32) NULL,
  conversion_name VARCHAR(255) NULL,
  checkout_provider VARCHAR(64) NULL,
  sub_account VARCHAR(255) NULL,
  external_id VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_campaigns_click_auth (click_auth),
  KEY idx_campaigns_user (id_user),
  KEY idx_campaigns_provider_external (ad_provider, external_id),
  CONSTRAINT fk_campaigns_user
    FOREIGN KEY (id_user) REFERENCES Users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clicks_taboola (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_click VARCHAR(255) NOT NULL,
  id_campaign BIGINT UNSIGNED NOT NULL,
  id_campaign_taboola VARCHAR(255) NULL,
  id_ads_taboola VARCHAR(255) NULL,
  id_site VARCHAR(255) NULL,
  site VARCHAR(255) NULL,
  thumbnail TEXT NULL,
  title VARCHAR(500) NULL,
  step_1 TINYINT UNSIGNED NOT NULL DEFAULT 0,
  step_2 TINYINT UNSIGNED NOT NULL DEFAULT 0,
  step_3 TINYINT UNSIGNED NOT NULL DEFAULT 0,
  checkout TINYINT UNSIGNED NOT NULL DEFAULT 0,
  revenue DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  payment_type VARCHAR(64) NULL,
  id_order VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_clicks_taboola_id_click (id_click),
  KEY idx_clicks_taboola_campaign_date (id_campaign, created_at),
  KEY idx_clicks_taboola_campaign_site_date (id_campaign, id_site, created_at),
  KEY idx_clicks_taboola_ads_date (id_ads_taboola, created_at),
  KEY idx_clicks_taboola_external_campaign (id_campaign_taboola),
  KEY idx_clicks_taboola_order (id_order),
  CONSTRAINT fk_clicks_taboola_campaign
    FOREIGN KEY (id_campaign) REFERENCES campaigns (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clicks_meta (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_click VARCHAR(255) NOT NULL,
  id_campaign BIGINT UNSIGNED NOT NULL,
  id_campaign_meta VARCHAR(255) NULL,
  id_ad_set VARCHAR(255) NULL,
  id_ad_meta VARCHAR(255) NULL,
  step_1 TINYINT UNSIGNED NOT NULL DEFAULT 0,
  step_2 TINYINT UNSIGNED NOT NULL DEFAULT 0,
  step_3 TINYINT UNSIGNED NOT NULL DEFAULT 0,
  checkout TINYINT UNSIGNED NOT NULL DEFAULT 0,
  revenue DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  payment_type VARCHAR(64) NULL,
  id_order VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_clicks_meta_id_click (id_click),
  KEY idx_clicks_meta_campaign_date (id_campaign, created_at),
  KEY idx_clicks_meta_external_campaign (id_campaign_meta),
  KEY idx_clicks_meta_adset_date (id_ad_set, created_at),
  KEY idx_clicks_meta_ad_date (id_ad_meta, created_at),
  KEY idx_clicks_meta_order (id_order),
  CONSTRAINT fk_clicks_meta_campaign
    FOREIGN KEY (id_campaign) REFERENCES campaigns (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_consents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_user BIGINT UNSIGNED NOT NULL,
  contract_signed TINYINT(1) NOT NULL DEFAULT 0,
  signed_at DATETIME NULL,
  ip_address VARCHAR(45) NULL,
  subpaid TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_consents_user (id_user),
  CONSTRAINT fk_user_consents_user
    FOREIGN KEY (id_user) REFERENCES Users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS allowed_meta_account (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_user BIGINT UNSIGNED NOT NULL,
  account_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_allowed_meta_account_user_account (id_user, account_id),
  CONSTRAINT fk_allowed_meta_account_user
    FOREIGN KEY (id_user) REFERENCES Users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS used_meta_accounts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_user BIGINT UNSIGNED NOT NULL,
  meta_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_used_meta_accounts_meta_id (meta_id),
  KEY idx_used_meta_accounts_user (id_user),
  CONSTRAINT fk_used_meta_accounts_user
    FOREIGN KEY (id_user) REFERENCES Users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS used_taboola_accounts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_user BIGINT UNSIGNED NOT NULL,
  taboola_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_used_taboola_accounts_taboola_id (taboola_id),
  KEY idx_used_taboola_accounts_user (id_user),
  CONSTRAINT fk_used_taboola_accounts_user
    FOREIGN KEY (id_user) REFERENCES Users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS campaign_meta_access (
  id_campaign BIGINT UNSIGNED NOT NULL,
  access_token TEXT NOT NULL,
  pixel_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_campaign),
  CONSTRAINT fk_campaign_meta_access_campaign
    FOREIGN KEY (id_campaign) REFERENCES campaigns (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS integration_status (
  id_campaign BIGINT UNSIGNED NOT NULL,
  ad_provider TINYINT(1) NOT NULL DEFAULT 0,
  funnel TINYINT(1) NOT NULL DEFAULT 0,
  checkout TINYINT(1) NOT NULL DEFAULT 0,
  test TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_campaign),
  CONSTRAINT fk_integration_status_campaign
    FOREIGN KEY (id_campaign) REFERENCES campaigns (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wait_list (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  cel VARCHAR(32) NOT NULL,
  prom_code VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_wait_list_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  stack TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
