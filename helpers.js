const getUserByEmail = (email, database) => {
  for (const key in database) {
    if (database[key].email === email) {
      return database[key];
    }
  }
};

const isLoggin = (userId) => {
 if (userId) {
  return true;
 } else {
   return false;
 }
}

module.exports = {
  getUserByEmail,
  isLoggin
};
