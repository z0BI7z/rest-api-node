const { expect } = require('chai');
const { stub } = require('sinon');
const isAuth = require('../middleware/is-auth');
const jwt = require('jsonwebtoken');

describe('isAuth middleware', () => {
  it('should throw error if no header', () => {
    const req = {
      get: headerName => null
    }
    expect(() => isAuth(req, {}, () => { })).to.throw('Not authenticated.');
  });

  it('should yield userId after decoding token', () => {
    stub(jwt, 'verify');
    jwt.verify.returns({ userId: 'test' });
    const req = {
      get: headerName => 'Bearer test'
    }
    isAuth(req, {}, () => { });
    expect(req).to.have.property('userId');
    expect(req).to.have.property('userId', 'test');
    expect(jwt.verify.called).to.be.true;
    jwt.verify.restore();
  });
});