const { assert } = require('chai');

const { getIdByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getIdByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getIdByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput, `${user} === ${expectedOutput}`);
  });
  it('should return undefined for an email that does not exist', function() {
    const user = getIdByEmail("user123@example.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput, `${user} === ${expectedOutput}`);
  });
});