const { db } = require('../config/database');

const Post = {

  findByCreatorWithComments(creatorId) {
    const posts = db.prepare(`
      SELECT * FROM posts WHERE creator_id = ? ORDER BY created_at DESC
    `).all(creatorId);

    return posts.map(post => {
      const comments = db.prepare(`
        SELECT c.id, c.text, c.created_at,
               u.id AS follower_id, u.username AS follower_username
        FROM comments c
        JOIN users u ON u.id = c.follower_id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
      `).all(post.id);
      return { ...post, comments };
    });
  },


  findByCreatorId(creatorId) {
    return db.prepare(`
      SELECT * FROM posts WHERE creator_id = ? ORDER BY created_at DESC
    `).all(creatorId);
  },

 
  findById(id) {
    return db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  },

 
  findByIdAndCreator(id, creatorId) {
    return db.prepare('SELECT * FROM posts WHERE id = ? AND creator_id = ?').get(id, creatorId);
  },

  create({ creator_id, text, image }) {
    const result = db.prepare(`
      INSERT INTO posts (creator_id, text, image)
      VALUES (?, ?, ?)
    `).run(creator_id, text || null, image || null);
    return db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
  },


  delete(id) {
    db.prepare('DELETE FROM posts WHERE id = ?').run(id);
  },

 
  getFeed(followerId) {
    return db.prepare(`
      SELECT p.id, p.text, p.image, p.created_at,
             u.id   AS creator_id,
             u.username AS creator_username,
             cp.display_name AS creator_display_name,
             cp.profile_photo AS creator_photo
      FROM posts p
      JOIN users u ON u.id = p.creator_id
      LEFT JOIN creator_profiles cp ON cp.user_id = u.id
      WHERE p.creator_id IN (
        SELECT DISTINCT creator_id FROM donations WHERE follower_id = ?
      )
      ORDER BY p.created_at DESC
    `).all(followerId);
  },
};

module.exports = Post;
