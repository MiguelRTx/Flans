const { db } = require('../config/database');

const Favorite = {

  findByFollower(followerId) {
    return db.prepare(`
      SELECT u.id, u.username, u.created_at,
             cp.display_name, cp.bio, cp.profile_photo, cp.banner,
             f.created_at AS added_at
      FROM favorites f
      JOIN users u ON u.id = f.creator_id
      LEFT JOIN creator_profiles cp ON cp.user_id = u.id
      WHERE f.follower_id = ?
      ORDER BY COALESCE(cp.display_name, u.username) COLLATE NOCASE ASC
    `).all(followerId);
  },

 
  exists(followerId, creatorId) {
    return !!db.prepare(`
      SELECT id FROM favorites WHERE follower_id = ? AND creator_id = ?
    `).get(followerId, creatorId);
  },

  add(followerId, creatorId) {
    db.prepare(`
      INSERT INTO favorites (follower_id, creator_id) VALUES (?, ?)
    `).run(followerId, creatorId);
  },


  remove(followerId, creatorId) {
    const result = db.prepare(`
      DELETE FROM favorites WHERE follower_id = ? AND creator_id = ?
    `).run(followerId, creatorId);
    return result.changes > 0;
  },
};

module.exports = Favorite;
