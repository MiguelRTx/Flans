const { db } = require('../config/database');

const User = {
 
  findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  
  findById(id) {
    return db.prepare(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?'
    ).get(id);
  },

  
  findByEmailOrUsername(email, username) {
    return db.prepare(
      'SELECT id FROM users WHERE email = ? OR username = ?'
    ).get(email, username);
  },

  create({ username, email, password_hash, role }) {
    const result = db.prepare(`
      INSERT INTO users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `).run(username, email, password_hash, role);
    return result.lastInsertRowid;
  },
};

module.exports = User;
