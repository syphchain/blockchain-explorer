const request = require('supertest');
const expect = require('chai').expect;
const app = require('../app.js');

describe('user_api', () => {
  it('getUser', (done) => {
    request(app.listen())
      .get('/api/users/getUser?id=1')
      .expect(200)
      .end((err, res) => {
        console.log(res.body);
        expect(res.body.data).to.be.an('object');
      
        done();
      });
  })
})