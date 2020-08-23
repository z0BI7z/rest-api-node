const { expect } = require('chai');
const { stub } = require('sinon');
const mongoose = require('mongoose');
const User = require('../models/user');
const Post = require('../models/post');
const feedController = require('../controllers/feed');
const io = require('../io');

const _id = '5f4160d3d69d4df0c3f8b9d6';

describe('Feed Controller - Create Post', () => {
  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/node_complete_guide-rest--test');
    await User.deleteMany({});
    const newUser = new User({
      email: 'test@test.com',
      password: 'testing',
      name: 'test',
      _id
    });
    await newUser.save();
    await Post.deleteMany({});
  });

  it('should increase user\'s posts count by 1', async () => {
    stub(io, 'getIo');
    io.getIo.returns({
      emit() { }
    });
    const req = {
      file: {
        path: 'foo/bar'
      },
      body: {
        title: 'A dummy title',
        content: 'A dummy post.'
      },
      userId: _id
    }
    const res = {
      status() {
        return this;
      },
      json() { }
    }
    await feedController.postPost(req, res, () => { });
    const user = await User.findById(_id);
    expect(user).to.have.property('posts');
    expect(user.posts).to.have.length(1);
    io.getIo.restore();
  });

  after(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
    await mongoose.connection.close();
  });
});