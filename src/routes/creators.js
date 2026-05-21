const express = require('express');
const router = express.Router();
const creatorController = require('../controllers/creatorController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { uploadProfile, uploadBanner, uploadPost } = require('../middleware/upload');

const isCreator = [authenticate, requireRole('creator')];


router.get('/',creatorController.getAll);
router.get('/:id',creatorController.getById);
router.put('/profile',isCreator, creatorController.updateProfile);
router.post('/profile/photo',isCreator, uploadProfile.single('photo'),  creatorController.uploadPhoto);
router.post('/profile/banner',isCreator, uploadBanner.single('banner'),  creatorController.uploadBanner);
router.get('/goals/mine',isCreator, creatorController.getMyGoals);
router.post('/goals',isCreator, creatorController.createGoal);
router.put('/goals/:id',isCreator, creatorController.updateGoal);
router.delete('/goals/:id',isCreator, creatorController.deleteGoal);
router.get('/posts/mine',isCreator, creatorController.getMyPosts);
router.post('/posts',isCreator, uploadPost.single('image'), creatorController.createPost);
router.delete('/posts/:id',isCreator, creatorController.deletePost);
router.get('/income/report',isCreator, creatorController.getIncomeReport);

module.exports = router;
