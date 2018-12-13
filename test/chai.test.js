const expect = require('chai').expect;

describe('chai expect demo', () => {
  it('expect equal', () => {
    expect(1 + 1).to.equal(2);
    expect(1 + 1).to.equal(3);
  });
});