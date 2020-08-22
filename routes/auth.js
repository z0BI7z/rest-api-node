const express = require('express');
const authController = require('../controllers/auth');
const { checkSignUp } = require('../utils/validators');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.put('/signup', checkSignUp, authController.signup);

router.post('/login', authController.login);

router.get('/status', isAuth, authController.getStatus);

router.patch('/status', isAuth, authController.updateStatus);

module.exports = router;