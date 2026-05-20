const path = require('path');
const CreatorProfile = require('../models/CreatorProfile');
const Goal = require('../models/Goal');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Donation = require('../models/Donation');
const Favorite = require('../models/Favorite');
const User = require('../models/User');

const FLAN_VALUE = parseInt(process.env.FLAN_VALUE || '10');

function buildUrl(req, folder, filePath) {
  if (!filePath) return null;
  return `${req.protocol}://${req.get('host')}/uploads/${folder}/${path.basename(filePath)}`;
}

const followerController = {

  searchCreators(req, res) {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'El parámetro de búsqueda "q" es requerido' });
    }

    const creators = CreatorProfile.search(q).map(c => ({
      ...c,
      profile_photo: buildUrl(req, 'profiles', c.profile_photo),
      banner:        buildUrl(req, 'banners', c.banner),
    }));

    return res.json({ creators, count: creators.length });
  },

  getCreatorProfile(req, res) {
    const creator = CreatorProfile.findPublicById(req.params.id);
    if (!creator) return res.status(404).json({ error: 'Creador no encontrado' });

    const goals = Goal.findByCreatorId(creator.id);
    const total_flanes = Donation.getTotalByCreator(creator.id);

    return res.json({
      creator: {
        ...creator,
        profile_photo: buildUrl(req, 'profiles', creator.profile_photo),
        banner:        buildUrl(req, 'banners', creator.banner),
        total_flanes,
      },
      goals,
    });
  },

  getCreatorPosts(req, res) {
    const creatorId = req.params.id;

    const creator = User.findById(creatorId);
    if (!creator || creator.role !== 'creator') {
      return res.status(404).json({ error: 'Creador no encontrado' });
    }


    if (!Donation.hasDonated(req.user.id, creatorId)) {
      return res.status(403).json({
        error: 'Debes enviar al menos un flan a este creador para ver sus publicaciones',
        requires_donation: true,
      });
    }

    const posts = Post.findByCreatorId(creatorId).map(post => ({
      ...post,
      image: buildUrl(req, 'posts', post.image),
    }));

    return res.json({ posts });
  },

  donate(req, res) {
    const { creator_id, flanes } = req.body;

    if (!creator_id || !flanes) {
      return res.status(400).json({ error: 'creator_id y flanes son requeridos' });
    }
    if (!Number.isInteger(Number(flanes)) || Number(flanes) < 1) {
      return res.status(400).json({ error: 'El número de flanes debe ser un entero positivo' });
    }

    const creator = User.findById(creator_id);
    if (!creator || creator.role !== 'creator') {
      return res.status(404).json({ error: 'Creador no encontrado' });
    }
    if (Number(creator_id) === req.user.id) {
      return res.status(400).json({ error: 'No puedes enviarte flanes a ti mismo' });
    }

    const donation = Donation.create({
      follower_id: req.user.id,
      creator_id: Number(creator_id),
      flanes: Number(flanes),
    });

    return res.status(201).json({
      message: `¡Enviaste ${flanes} flan(es) a ${creator.username}! 🍮`,
      donation,
      total_value: Number(flanes) * FLAN_VALUE,
      flan_value:  FLAN_VALUE,
      currency: 'Bs',
    });
  },

  getDonationHistory(req, res) {
    const { start_date, end_date, creator_name } = req.query;
    const donations = Donation.getByFollower(req.user.id, { start_date, end_date, creator_name });
    const total_flanes = donations.reduce((sum, d) => sum + d.flanes, 0);

    return res.json({
      donations,
      summary: {
        total_flanes,
        total_value: total_flanes * FLAN_VALUE,
        flan_value:  FLAN_VALUE,
        currency: 'Bs',
      },
      filters: { start_date, end_date, creator_name },
    });
  },

  createComment(req, res) {
    const { post_id, text } = req.body;

    if (!post_id || !text || text.trim() === '') {
      return res.status(400).json({ error: 'post_id y text son requeridos' });
    }

    const post = Post.findById(post_id);
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });

    if (!Donation.hasDonated(req.user.id, post.creator_id)) {
      return res.status(403).json({
        error: 'Debes enviar al menos un flan a este creador para comentar sus publicaciones',
      });
    }

    const comment = Comment.create({ post_id, follower_id: req.user.id, text: text.trim() });
    return res.status(201).json({ message: 'Comentario publicado', comment });
  },

  getFavorites(req, res) {
    const favorites = Favorite.findByFollower(req.user.id).map(c => ({
      ...c,
      profile_photo: buildUrl(req, 'profiles', c.profile_photo),
      banner:        buildUrl(req, 'banners', c.banner),
    }));
    return res.json({ favorites });
  },


  addFavorite(req, res) {
    const creatorId = req.params.creatorId;

    const creator = User.findById(creatorId);
    if (!creator || creator.role !== 'creator') {
      return res.status(404).json({ error: 'Creador no encontrado' });
    }
    if (Favorite.exists(req.user.id, creatorId)) {
      return res.status(409).json({ error: 'Este creador ya está en tus favoritos' });
    }

    Favorite.add(req.user.id, creatorId);
    return res.status(201).json({ message: 'Creador agregado a favoritos' });
  },

 
  removeFavorite(req, res) {
    const removed = Favorite.remove(req.user.id, req.params.creatorId);
    if (!removed) return res.status(404).json({ error: 'El creador no estaba en tus favoritos' });
    return res.json({ message: 'Creador eliminado de favoritos' });
  },

  getFeed(req, res) {
    const feed = Post.getFeed(req.user.id).map(post => ({
      ...post,
      image:        buildUrl(req, 'posts', post.image),
      creator_photo: buildUrl(req, 'profiles', post.creator_photo),
    }));
    return res.json({ feed, count: feed.length });
  },
};

module.exports = followerController;
