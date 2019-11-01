const { assert } = require("chai");

const { getUserByEmail, userUrls, checkUrlHeader } = require("../helpers.js");
const { urlDatabase } = require("../config");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe("getUserByEmail", function() {
  it("should return a user data with valid email", function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(user, expectedOutput);
  });
  it("should return undefined with not valid email", function() {
    const user = getUserByEmail("user@ex.com", testUsers);
    const expectedOutput = undefined;
    assert.deepEqual(user, expectedOutput);
  });
});

describe("userUrls", function() {
  it("should return only URLs which belong to the user", function() {
    const data = userUrls("user2RandomID", urlDatabase);
    const expectedOutput = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "user2RandomID",
        views: 0
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "user2RandomID",
        views: 0
      }
    };
    assert.deepEqual(data, expectedOutput);
  });
  it("should return empty object if user does not have URLs in datatbase", function() {
    const data = userUrls("userRandomID", urlDatabase);
    const expectedOutput = {};
    assert.deepEqual(data, expectedOutput);
  });
});

describe("checkUrlHeader", function() {
  it("should return URL with 'https://' header if it does not have it", function() {
    checkUrlHeader(
      "www.cnn.com",
      "shortUrl",
      "userId",
      urlDatabase
    );
    const expectedOutput = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "user2RandomID",
        views: 0
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "user2RandomID",
        views: 0
      },
      shortUrl: {
        longURL: "https://www.cnn.com",
        userID: "userId",
        views: 0
      }
    };
    assert.deepEqual(urlDatabase, expectedOutput);
  });
});
