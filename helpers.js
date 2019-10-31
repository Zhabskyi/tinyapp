const getUserByEmail = (email, database) => {
  for (const key in database) {
    if (database[key].email === email) {
      return database[key];
    }
  }
};

const isLoggin = userId => {
  if (userId) {
    return true;
  } else {
    return false;
  }
};

const userUrls = (userId, urlDatabase) => {
  let privateDatabase = {};
  if (userId) {
    for (const key in urlDatabase) {
      if (urlDatabase[key].userID === userId) {
        privateDatabase = Object.assign(privateDatabase, {
          [key]: urlDatabase[key]
        });
      }
    }
  }
  return privateDatabase;
};

const checkUrlHeader = (long, short, userId, db) => {
  if (long.startsWith("https://") || long.startsWith("http://")) {
    db[short] = {
      longURL: long,
      userID: userId
    };
  } else {
    db[short] = {
      longURL: `https://${long}`,
      userID: userId
    };
  }
};

const generateRandomString = () => {
  return Math.random()
    .toString(36)
    .substr(2, 6);
};

module.exports = {
  getUserByEmail,
  isLoggin,
  userUrls,
  checkUrlHeader,
  generateRandomString
};
