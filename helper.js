//Functions
//Get ID by user name
const getIdByEmail = (email, database) => {
  for (let id in database) {
    if (database[id].email === email) {
      return id
    }
  }
};
//Generates random 6 char string
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

//Deletes a URL
const deleteUrl = (urlID) => {
  delete urlDB[urlID]
};

//Looks up if email is already in the database returns a boolean
const doesEmailExist = (email) => {
  for (let id in userDB) {
    if (email === userDB[id].email) {
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
const getPasswordByEmail = (email) => {
  for (let id in userDB) {
    if (userDB[id].email === email) {
      return userDB[id].password;
    }
  }
};
//Get urls by ID returns an object of objects with the shortUrl as keys
const getUrlById = (id) => {
  const urlsById = {};
  for (let shortURL in urlDB) {
    if (urlDB[shortURL].userID === id) {
      urlsById[shortURL] = urlDB[shortURL]
    }
  }
  return urlsById;
};
//Check to see if a user id matches the id on a url
const doesLoggedInOwnUrl = (shortURL, loggedInID) => {
  if (!loggedInID) {
    return false;
  };
  for (let keys in urlDB) {
    if (keys === shortURL) {
      if (urlDB[keys].userID === loggedInID)
        return true;
    }
  };
};

module.exports = { getIdByEmail, generateRandomString, deleteUrl, doesEmailExist, isLoggedIn, getPasswordByEmail, getUrlById, doesLoggedInOwnUrl };