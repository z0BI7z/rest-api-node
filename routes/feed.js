const express = require('express');
const feedController = require('../controllers/feed');
const { checkPost } = require('../utils/validators');
const { uploadPost } = require('../utils/uploads');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/post', isAuth, feedController.getPosts);

router.post('/post', isAuth, uploadPost(), checkPost, feedController.postPost);

router.get('/post/:postId', isAuth, feedController.getPostById);

router.put('/post/:postId', isAuth, uploadPost(), checkPost, feedController.updatePost);

router.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = router;