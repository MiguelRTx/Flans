const path = require('path');
const CreatorProfile = require('../models/CreatorProfile');
const Goal = require('../models/Goal');
const Post = require('../models/Post');
const Donation = require('../models/Donation');

const FLAN_VALUE = parseInt(process.env.FLAN_VALUE || '10');

function buildUrl(req, folder, filePath) {
  if (!filePath) return null;
  return `${req.protocol}://${req.get('host')}/uploads/${folder}/${path.basename(filePath)}`;
}

const creatorController = {

  getAll(req, res) {
    const creators = CreatorProfile.findAllAlphabetical().map(c => ({
      ...c,
      profile_photo: buildUrl(req, 'profiles', c.profile_photo),
      banner:        buildUrl(req, 'banners', c.banner),
    }));
    return res.json({ creators });
  },

  getById(req, res) {
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

  updateProfile(req, res) {
    const { display_name, bio } = req.body;
    CreatorProfile.update(req.user.id, { display_name, bio });
    const profile = CreatorProfile.findByUserId(req.user.id);
    return res.json({ message: 'Perfil actualizado', profile });
  },


  uploadPhoto(req, res) {
    if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    CreatorProfile.updatePhoto(req.user.id, req.file.path);
    return res.json({
      message: 'Foto de perfil actualizada',
      url: buildUrl(req, 'profiles', req.file.path),
    });
  },


  uploadBanner(req, res) {
    if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    CreatorProfile.updateBanner(req.user.id, req.file.path);
    return res.json({
      message: 'Banner actualizado',
      url: buildUrl(req, 'banners', req.file.path),
    });
  },

  getMyGoals(req, res) {
    const goals = Goal.findByCreatorId(req.user.id);
    return res.json({ goals });
  },

  createGoal(req, res) {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'El título de la meta es requerido' });

    const goal = Goal.create({ creator_id: req.user.id, title, description });
    return res.status(201).json({ message: 'Meta creada exitosamente', goal });
  },

  updateGoal(req, res) {
    const goal = Goal.findByIdAndCreator(req.params.id, req.user.id);
    if (!goal) return res.status(404).json({ error: 'Meta no encontrada o no te pertenece' });

    const updated = Goal.update(req.params.id, req.body);
    return res.json({ message: 'Meta actualizada', goal: updated });
  },


  deleteGoal(req, res) {
    const goal = Goal.findByIdAndCreator(req.params.id, req.user.id);
    if (!goal) return res.status(404).json({ error: 'Meta no encontrada o no te pertenece' });

    Goal.delete(req.params.id);
    return res.json({ message: 'Meta eliminada' });
  },

  getMyPosts(req, res) {
    const posts = Post.findByCreatorWithComments(req.user.id).map(post => ({
      ...post,
      image: buildUrl(req, 'posts', post.image),
    }));
    return res.json({ posts });
  },
  createPost(req, res) {
    const { text } = req.body;
    const imagePath = req.file ? req.file.path : null;

    if (!text && !imagePath) {
      return res.status(400).json({ error: 'El post debe tener al menos texto o imagen' });
    }

    const post = Post.create({ creator_id: req.user.id, text, image: imagePath });
    return res.status(201).json({
      message: 'Post publicado exitosamente',
      post: { ...post, image: buildUrl(req, 'posts', post.image) },
    });
  },


  deletePost(req, res) {
    const post = Post.findByIdAndCreator(req.params.id, req.user.id);
    if (!post) return res.status(404).json({ error: 'Post no encontrado o no te pertenece' });

    Post.delete(req.params.id);
    return res.json({ message: 'Post eliminado' });
  },

  getIncomeReport(req, res) {
    const { start_date, end_date } = req.query;
    const donations = Donation.getByCreator(req.user.id, { start_date, end_date });
    const total_flanes = donations.reduce((sum, d) => sum + d.flanes, 0);

    return res.json({
      report: {
        start_date: start_date || null,
        end_date:   end_date   || null,
        total_flanes,
        total_value: total_flanes * FLAN_VALUE,
        flan_value:  FLAN_VALUE,
        currency: 'Bs',
        donations,
      },
    });
  },
};

module.exports = creatorController;
