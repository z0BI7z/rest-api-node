"use strict;"

const { expect } = require('chai');
const { stub } = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const authController = require('../controllers/auth');

describe('Auth Controller - Login', () => {
  before(async () => {
    await mongoose.connect('mongodb://localhost:27017/node_complete_guide-rest--test');
    await User.deleteMany({});
    const _id = '5f4160d3d69d4df0c3f8b9d6';
    const newUser = new User({
      email: 'test@test.com',
      password: 'testing',
      name: 'test',
      _id
    });
    await newUser.save();
  });

  it('should throw error with code 500 if access database fails', done => {
    stub(User, 'findOne');
    User.findOne.throws();

    const req = {
      body: {
        email: 'test@test.com',
        password: 'testing'
      }
    }
    authController.login(req, {}, () => { })
      .then(result => {
        expect(result).to.be.an('error');
        expect(result).to.have.property('statusCode', 500);
        done();
      });
    User.findOne.restore();
  });

  it('should respond with a valid user status for an existing user', async () => {
    const req = {
      userId: '5f4160d3d69d4df0c3f8b9d6'
    }
    const res = {
      statusCode: 500,
      userStatus: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.userStatus = data.status;
      }
    }
    await authController.getStatus(req, res, () => { });

    expect(res.statusCode).to.be.equal(200);
    expect(res.userStatus).to.be.equal('I am new.');
  });

  after(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });
})