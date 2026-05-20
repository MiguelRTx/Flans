const { db } = require('../config/database');

const CreatorProfile = {

  findByUserId(userId) {
    return db.prepare('SELECT * FROM creator_profiles WHERE user_id = ?').get(userId);
  },

  findPublicById(creatorId) {
    return db.prepare(`
      SELECT u.id, u.username, u.created_at,
             cp.display_name, cp.bio, cp.profile_photo, cp.banner
      FROM users u
      LEFT JOIN creator_profiles cp ON cp.user_id = u.id
      WHERE u.id = ? AND u.role = 'creator'
    `).get(creatorId);
  },

  findAllAlphabetical() {
    return db.prepare(`
      SELECT u.id, u.username, u.created_at,
             cp.display_name, cp.bio, cp.profile_photo, cp.banner
      FROM users u
      LEFT JOIN creator_profiles cp ON cp.user_id = u.id
      WHERE u.role = 'creator'
      ORDER BY COALESCE(cp.display_name, u.username) COLLATE NOCASE ASC
    `).all();
  },

  search(term) {
    return db.prepare(`
      SELECT u.id, u.username, u.created_at,
             cp.display_name, cp.bio, cp.profile_photo, cp.banner
      FROM users u
      LEFT JOIN creator_profiles cp ON cp.user_id = u.id
      WHERE u.role = 'creator'
        AND (LOWER(u.username) LIKE LOWER(?) OR LOWER(cp.display_name) LIKE LOWER(?))
      ORDER BY COALESCE(cp.display_name, u.username) COLLATE NOCASE ASC
    `).all(`%${term}%`, `%${term}%`);
  },

 
  create(userId, displayName) {
    db.prepare(`
      INSERT INTO creator_profiles (user_id, display_name)
      VALUES (?, ?)
    `).run(userId, displayName);
  },

  update(userId, { display_name, bio }) {
    db.prepare(`
      UPDATE creator_profiles
      SET display_name = COALESCE(?, display_name),
          bio          = COALESCE(?, bio),
          updated_at   = datetime('now')
      WHERE user_id = ?
    `).run(display_name || null, bio || null, userId);
  },

  updatePhoto(userId, filePath) {
    db.prepare(`
      UPDATE creator_profiles
      SET profile_photo = ?, updated_at = datetime('now')
      WHERE user_id = ?
    `).run(filePath, userId);
  },


  updateBanner(userId, filePath) {
    db.prepare(`
      UPDATE creator_profiles
      SET banner = ?, updated_at = datetime('now')
      WHERE user_id = ?
    `).run(filePath, userId);
  },
};

module.exports = CreatorProfile;
