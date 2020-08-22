const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const { email, password, name } = req.body;
  bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email,
        password: hashedPassword,
        name
      });
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'User created.',
        userId: result._id
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  let loadedUser;
  User.findOne({ email })
    .then(user => {
      if (!user) {
        const error = new Error('No user with email found.');
        error.statusCode = 404;
        throw error;
      }
      loadedUser = user;

      return bcrypt.compare(password, user.password);
    })
    .then(match => {
      if (!match) {
        const error = new Error('Password invalid.');
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign({
        email,
        userId: loadedUser._id.toString()
      },
        'secret',
        {
          expiresIn: '1h'
        });
      res.status(200).json({
        token,
        userId: loadedUser._id.toString()
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

exports.getStatus = (req, res, next) => {
  User.findById(req.userId)
    .then(user => {
      if (!user) {
        const error = new Error('No valid user found.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        status: user.status
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

exports.updateStatus = (req, res, next) => {
  const newStatus = req.body.status;
  User.findById(req.userId)
    .then(user => {
      if (!user) {
        const error = new Error('No valid user found.');
        error.statusCode = 404;
        throw error;
      }
      user.status = newStatus;
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'Status updated.'
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}