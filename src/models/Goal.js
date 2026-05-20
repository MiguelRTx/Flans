const { db } = require('../config/database');

const Goal = {
 
  findByCreatorId(creatorId) {
    return db.prepare(`
      SELECT * FROM support_goals
      WHERE creator_id = ?
      ORDER BY created_at DESC
    `).all(creatorId);
  },

  
  findByIdAndCreator(id, creatorId) {
    return db.prepare(`
      SELECT * FROM support_goals WHERE id = ? AND creator_id = ?
    `).get(id, creatorId);
  },

  create({ creator_id, title, description }) {
    const result = db.prepare(`
      INSERT INTO support_goals (creator_id, title, description)
      VALUES (?, ?, ?)
    `).run(creator_id, title, description || null);
    return db.prepare('SELECT * FROM support_goals WHERE id = ?').get(result.lastInsertRowid);
  },

 
  update(id, { title, description }) {
    db.prepare(`
      UPDATE support_goals
      SET title       = COALESCE(?, title),
          description = COALESCE(?, description)
      WHERE id = ?
    `).run(title || null, description || null, id);
    return db.prepare('SELECT * FROM support_goals WHERE id = ?').get(id);
  },

  delete(id) {
    db.prepare('DELETE FROM support_goals WHERE id = ?').run(id);
  },
};

module.exports = Goal;
