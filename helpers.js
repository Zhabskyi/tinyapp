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

const checkUrlHeader = (longUrl, shortUrl, userId, db) => {
  if (longUrl.startsWith("https://") || longUrl.startsWith("http://")) {
    db[shortUrl] = {
      longURL: longUrl,
      userID: userId,
      views: 0
    };
  } else {
    db[shortUrl] = {
      longURL: `https://${longUrl}`,
      userID: userId,
      views: 0
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
