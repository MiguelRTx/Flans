const { db } = require('../config/database');

const Donation = {
 
  hasDonated(followerId, creatorId) {
    return !!db.prepare(`
      SELECT id FROM donations WHERE follower_id = ? AND creator_id = ?
    `).get(followerId, creatorId);
  },

  create({ follower_id, creator_id, flanes }) {
    const result = db.prepare(`
      INSERT INTO donations (follower_id, creator_id, flanes, support_type)
      VALUES (?, ?, ?, 'flan')
    `).run(follower_id, creator_id, flanes);
    return db.prepare('SELECT * FROM donations WHERE id = ?').get(result.lastInsertRowid);
  },


  getTotalByCreator(creatorId) {
    return db.prepare(`
      SELECT COALESCE(SUM(flanes), 0) AS total FROM donations WHERE creator_id = ?
    `).get(creatorId).total;
  },

  getByCreator(creatorId, { start_date, end_date } = {}) {
    let query = `
      SELECT d.id, d.flanes, d.support_type, d.donated_at,
             u.id AS follower_id, u.username AS follower_username
      FROM donations d
      JOIN users u ON u.id = d.follower_id
      WHERE d.creator_id = ?
    `;
    const params = [creatorId];

    if (start_date) { query += ` AND DATE(d.donated_at) >= DATE(?)`; params.push(start_date); }
    if (end_date)   { query += ` AND DATE(d.donated_at) <= DATE(?)`; params.push(end_date); }

    query += ` ORDER BY d.donated_at DESC`;
    return db.prepare(query).all(...params);
  },


  getByFollower(followerId, { start_date, end_date, creator_name } = {}) {
    let query = `
      SELECT d.id, d.flanes, d.support_type, d.donated_at,
             u.id AS creator_id, u.username AS creator_username,
             cp.display_name AS creator_display_name
      FROM donations d
      JOIN users u ON u.id = d.creator_id
      LEFT JOIN creator_profiles cp ON cp.user_id = u.id
      WHERE d.follower_id = ?
    `;
    const params = [followerId];

    if (start_date)   { query += ` AND DATE(d.donated_at) >= DATE(?)`; params.push(start_date); }
    if (end_date)     { query += ` AND DATE(d.donated_at) <= DATE(?)`; params.push(end_date); }
    if (creator_name) {
      query += ` AND (LOWER(u.username) LIKE LOWER(?) OR LOWER(cp.display_name) LIKE LOWER(?))`;
      params.push(`%${creator_name}%`, `%${creator_name}%`);
    }

    query += ` ORDER BY d.donated_at DESC`;
    return db.prepare(query).all(...params);
  },
};

module.exports = Donation;
