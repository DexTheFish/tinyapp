const isNewEmail = function(emailAddress, users) {
  for (const u in users) {
    if (users[u].email.toUpperCase() === emailAddress.toUpperCase()) {
      return false;
    }
  }
  return true;
};
const generateRandomString = function(stringLength) {
  const alphaNumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < stringLength; i++) {
    randomString += alphaNumeric[Math.floor(Math.random() * 62)];
  }
  return randomString;
};
const getUserByEmail = function(emailAddress, users) {
  for (let u in users) {
    if (users[u].email.toUpperCase() === emailAddress.toUpperCase()) {
      return u;
    }
  }
};


module.exports = { isNewEmail, generateRandomString, getUserByEmail};