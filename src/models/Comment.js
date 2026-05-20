const { db } = require('../config/database');

const Comment = {

  findByPostId(postId) {
    return db.prepare(`
      SELECT c.id, c.text, c.created_at,
             u.id AS follower_id, u.username AS follower_username
      FROM comments c
      JOIN users u ON u.id = c.follower_id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `).all(postId);
  },

 
  create({ post_id, follower_id, text }) {
    const result = db.prepare(`
      INSERT INTO comments (post_id, follower_id, text)
      VALUES (?, ?, ?)
    `).run(post_id, follower_id, text);
    return db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid);
  },
};

module.exports = Comment;
