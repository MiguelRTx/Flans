const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = process.env.DB_PATH || './database.sqlite';
const db = new DatabaseSync(path.resolve(DB_PATH));

function initializeDatabase() {
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT    NOT NULL UNIQUE,
      email         TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      role          TEXT    NOT NULL CHECK(role IN ('creator', 'follower')),
      created_at    TEXT    DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS creator_profiles (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      display_name  TEXT,
      bio           TEXT,
      profile_photo TEXT,
      banner        TEXT,
      updated_at    TEXT DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS support_goals (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title       TEXT    NOT NULL,
      description TEXT,
      created_at  TEXT    DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text        TEXT,
      image       TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text        TEXT    NOT NULL,
      created_at  TEXT    DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS donations (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      follower_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      creator_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      flanes       INTEGER NOT NULL CHECK(flanes > 0),
      support_type TEXT    NOT NULL DEFAULT 'flan',
      donated_at   TEXT    DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      creator_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at  TEXT    DEFAULT (datetime('now')),
      UNIQUE(follower_id, creator_id)
    )
  `);

  console.log('✅ Base de datos SQLite inicializada correctamente');
}

module.exports = { db, initializeDatabase };
