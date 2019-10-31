const bcrypt = require("bcrypt");

const password1 = bcrypt.hashSync("purple-monkey-dinosaur", 10);
const password2 = bcrypt.hashSync("123456", 10);

let urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user2RandomID", views: 0 },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID", views: 0 }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: password1
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: password2
  }
};

module.exports = {
  urlDatabase,
  users
}