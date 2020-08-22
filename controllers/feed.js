const { validationResult } = require('express-validator');
const Post = require('../models/post');
const User = require('../models/user');
const fs = require('fs');
const path = require('path');
const user = require('../models/user');

exports.getPosts = (req, res, next) => {
  const page = req.query.page || 1;
  const perPage = 2;
  let totalItems;

  Post.find()
    .countDocuments()
    .then(count => {
      totalItems = count;
      return Post.find()
        .skip((page - 1) * perPage)
        .limit(perPage)
        .populate('creator')
    })
    .then(posts => {
      if (!posts) {
        const error = Error('No posts found.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: 'Posts fetched.',
        posts,
        totalItems
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });;
}

exports.getPostById = (req, res, next) => {
  Post.findById(req.params.postId)
    .then(post => {
      if (!post) {
        const error = Error('No post found.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: 'Post fetched.',
        post
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

exports.postPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(402).json({
      message: 'Validation failed.',
      errors: errors.array()
    });
    return;
  }
  if (!req.file) {
    const error = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }

  let creator;
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title,
    content,
    imageUrl,
    creator: req.userId
  })
  post.save()
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      user.posts.push(post);
      creator = user;
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'Post added',
        post,
        creator
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error('No file picked.');
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('No post found.');
        error.statusCode = 404;
        throw error;
      }
      if (!(post.creator.toString() === req.userId)) {
        const error = new Error('User does not have access.');
        error.statusCode = 403;
        throw error;
      }

      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }

      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then(result => {
      res.status(200).json({
        message: 'Post updated.',
        post: result
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('No post found.');
        error.statusCode = 404;
        throw error;
      }
      if (!(post.creator.toString() === req.userId)) {
        const error = new Error('User does not have access.');
        error.statusCode = 403;
        throw error;
      }

      clearImage(post.imageUrl);
      return post.remove()
    })
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      user.posts.pull(postId);
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'Post deleted.',
        result
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => {
    if (err) {
      console.log(err)
    }
  });
}