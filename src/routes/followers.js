const express = require('express');
const router = express.Router();
const followerController = require('../controllers/followerController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const isFollower = [authenticate, requireRole('follower')];

router.get('/search',              followerController.searchCreators);
router.get('/creators/:id',        followerController.getCreatorProfile);
router.get('/creators/:id/posts',  ...isFollower, followerController.getCreatorPosts);
router.post('/donate',             ...isFollower, followerController.donate);
router.get('/donations',           ...isFollower, followerController.getDonationHistory);

router.post('/comments',           ...isFollower, followerController.createComment);
router.get('/favorites',                ...isFollower, followerController.getFavorites);
router.post('/favorites/:creatorId',    ...isFollower, followerController.addFavorite);
router.delete('/favorites/:creatorId',  ...isFollower, followerController.removeFavorite);
router.get('/feed',                ...isFollower, followerController.getFeed);

module.exports = router;
