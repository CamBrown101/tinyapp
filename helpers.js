//Functions
//Get ID by user name
const getIdByEmail = (email, database) => {
  for (let id in database) {
    if (database[id].email === email) {
      return id;
    }
  }
};

//Generates random 6 char string
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

//Deletes a URL
const deleteUrl = (urlID, database) => {
  delete database[urlID];
};

//Looks up if email is already in the database returns a boolean
const doesEmailExist = (email, database) => {
  for (let id in database) {
    if (email === database[id].email) {
      return true;
    }
  }
};

//Checks to see if a user is logged in and returns a boolean
const isLoggedIn = (req) => {
  if (!req.session.user_id) {
    return null;
  }
  return true;
};

//Get password by email
const getPasswordByEmail = (email, database) => {
  for (let id in database) {
    if (database[id].email === email) {
      return database[id].password;
    }
  }
};

//Get urls by ID returns an object of objects with the shortUrl as keys
const getUrlById = (id, database) => {
  const urlsById = {};
  for (let shortURL in database) {
    if (database[shortURL].userID === id) {
      urlsById[shortURL] = database[shortURL];
    }
  }
  return urlsById;
};

//Check to see if a user id matches the id on a url
const doesLoggedInOwnUrl = (shortURL, loggedInID, database) => {
  if (!loggedInID) {
    return false;
  }
  for (let keys in database) {
    if (keys === shortURL) {
      if (database[keys].userID === loggedInID)
        return true;
    }
  }
};

const doesShortUrlExist = (shortURL, database) => {
  for (let url in database) {
    if (shortURL === url) {
      return true;
    }
  }
};

module.exports = { doesShortUrlExist, getIdByEmail, generateRandomString, deleteUrl, doesEmailExist, isLoggedIn, getPasswordByEmail, getUrlById, doesLoggedInOwnUrl };