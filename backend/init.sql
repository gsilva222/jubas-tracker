-- Creates the database user and database
-- Run this once manually in psql or via Docker

CREATE TYPE cooldown_type AS ENUM (
  '20h',
  '7d',
  '31d',
  '181d',
  '364d'
);

CREATE TABLE IF NOT EXISTS accounts (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  jubas        BOOLEAN DEFAULT false,
  cooldown     cooldown_type,              -- which cooldown was selected
  jubas_until  TIMESTAMPTZ,               -- exact UTC moment it expires
  created_at   TIMESTAMPTZ DEFAULT NOW()
);