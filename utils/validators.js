const { body } = require('express-validator');
const User = require('../models/user');

exports.checkPost = [
  body('title').trim().isLength({ min: 5 }),
  body('content').trim().isLength({ min: 5 })
]

exports.checkSignUp = [
  body('email')
    .isEmail()
    .custom(value => {
      return User.findOne({ email: value })
        .then(user => {
          if (user) {
            return Promise.reject('Email address already exists');
          }
        });
    })
    .normalizeEmail(),
  body('password').trim().isLength({ min: 5 }),
  body('name').trim().not().isEmpty()
]