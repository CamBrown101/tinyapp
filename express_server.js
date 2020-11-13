//Imports
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { doesShortUrlExist, getIdByEmail, generateRandomString, deleteUrl, doesEmailExist, isLoggedIn, getPasswordByEmail, getUrlById, doesLoggedInOwnUrl } = require('./helpers');

//Sets app as express
const app = express();

//sets the PORT we are using
const PORT = process.env.PORT || 8080;

//Sets EJS to generate templates
app.set('view engine', 'ejs');

//Middleware
//Allows us to use an external style sheet
app.use(express.static('public'));

//Parses our cookies
app.use(cookieSession({
  name: 'session',
  keys: ['TinyAppRules']
}));

//Adds body parser as middleware
app.use(bodyParser.urlencoded({ extended: true }));

//Database objects
//URL database
const urlDB = {
  i4BoGr: { longURL: "https://www.google.ca", userID: "1" },
  i3BoGr: { longURL: "https://www.gfdoogle.ca", userID: "1" }
};

//User database
const userDB = {
  "1": {
    userID: "1",
    email: "a@b.com",
    password: bcrypt.hashSync("1", 10)
  }
};

//Post requests
//Login and add a cookie with userID
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (doesEmailExist(email, userDB)) {
    if (bcrypt.compareSync(password, getPasswordByEmail(email, userDB))) {
      const userID = getIdByEmail(email, userDB);
      req.session.user_id = userID;
      return res.redirect('/urls');
    }
  }

  res.redirect('/loginError');
});

//Logout and remove cookie with user_id
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//Register the new user after validation
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  const userID = generateRandomString();

  //Check to see if the email or password fields are blank
  if (!email || !password) {
    return res.redirect('/emptyField')
  }
  if (doesEmailExist(email, userDB)) {
    return res.redirect('/emailExists');
  }

  userDB[userID] = { userID, email, password };
  req.session.user_id = userID;
  res.redirect('/urls');
});

//Requst from the form submitting link to be shortends
app.post('/urls', (req, res) => {
  if (!isLoggedIn(req)) {
    return res.redirect('/mustLogin');
  }

  //Generate 6 char string for short URL
  const newShortUrl = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.user_id;

  if (!req.body.longURL.startsWith('http')) {
    return res.redirect('urls/new');
  }

  urlDB[newShortUrl] = { longURL, userID };
  res.redirect(`/urls/${newShortUrl}`);
});

//Route to edit the longURL associacted with a shortURL
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const loggedInID = req.session.user_id;

  if (!isLoggedIn(req)) {
    return res.redirect('/mustLogin');
  }
  if (!doesLoggedInOwnUrl(shortURL, loggedInID, urlDB)) {
    return res.redirect('/mustLogin');
  }
  if (!longURL.startsWith('http')) {
    return res.redirect(`${shortURL}`);
  }

  urlDB[shortURL].longURL = longURL;
  res.redirect('/urls');
});

//Route to delete an object from the database
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const loggedInID = req.session.user_id;

  if (!isLoggedIn(req)) {
    return res.redirect('/mustLogin');
  }
  if (!doesLoggedInOwnUrl(shortURL, loggedInID, urlDB)) {
    return res.redirect('/mustLogin');
  }

  deleteUrl(shortURL, urlDB);
  return res.redirect('/urls');
});

//Get requests
//Route for the login page
app.get('/login', (req, res) => {
  const title = 'Login';
  const user = userDB[req.session.user_id];
  const templateVars = { urls: urlDB, user, title };

  if (isLoggedIn(req)) {
    return res.redirect('/urls');
  }

  res.render('login_page', templateVars);
});

//Route for an authorized login
app.get('/loginError', (req, res) => {
  const title = 'Login';
  const user = userDB[req.session.user_id];
  const templateVars = { urls: urlDB, user, title };

  if (isLoggedIn(req)) {
    return res.redirect('/urls');
  }

  res.render('login_error', templateVars);
});

//Route for Must login page
app.get('/mustLogin', (req, res) => {
  const title = 'Login';
  const user = userDB[req.session.user_id];
  const templateVars = { urls: urlDB, user, title };

  if (isLoggedIn(req)) {
    return res.redirect('/urls');
  }
  res.render('must_login', templateVars);
});

//Route for the register page
app.get('/register', (req, res) => {
  const title = 'Register';
  const user = userDB[req.session.user_id];
  const templateVars = { urls: urlDB, user, title };

  if (isLoggedIn(req)) {
    return res.redirect('/urls');
  }

  res.render('registration_page', templateVars);
});

//Route for Empty input page
app.get('/emptyField', (req, res) => {
  const title = 'Register';
  const user = userDB[req.session.user_id];
  const templateVars = { urls: urlDB, user, title };

  if (isLoggedIn(req)) {
    return res.redirect('/urls');
  }

  res.render('empty_field', templateVars);
});

//Route for email already exists page
app.get('/emailExists', (req, res) => {
  const title = 'Register';
  const user = userDB[req.session.user_id];
  const templateVars = { urls: urlDB, user, title };

  if (isLoggedIn(req)) {
    return res.redirect('/urls');
  }

  res.render('email_exists', templateVars);
});

//Route for all of the urls in the database
app.get('/urls', (req, res) => {
  if (!isLoggedIn(req)) {
    return res.redirect('/mustLogin');
  }

  const title = 'Urls';
  const user = userDB[req.session.user_id];
  const urls = getUrlById(user.userID, urlDB);
  const templateVars = { urls, user, title };
  res.render('urls_index', templateVars);
});

//Route for the page to add a new URL
app.get('/urls/new', (req, res) => {
  const title = 'New Url';
  const user = userDB[req.session.user_id];
  const templateVars = { user, title };

  if (!isLoggedIn(req)) {
    return res.redirect('/login');
  }

  res.render('urls_new', templateVars);
});

//Route to go to a URL by ID
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const loggedInID = req.session.user_id;

  if (!doesShortUrlExist(shortURL, urlDB)) {
    return res.status(404).send('Short URL not found!');
  }
  if (!isLoggedIn(req)) {
    return res.redirect('/mustLogin');
  }
  if (!doesLoggedInOwnUrl(shortURL, loggedInID, urlDB)) {
    res.status(401).send('That URL does not belong to you!');
  }

  const title = 'Short Url';
  const longURL = urlDB[shortURL].longURL;
  const user = userDB[req.session.user_id];
  const templateVars = { shortURL, longURL, user, title };
  res.render('urls_show', templateVars);
});

// /u/:shortURL to it's long version
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;

  if (!doesShortUrlExist(shortURL, urlDB)) {
    return res.status(404).send('Short URL not found!');
  }

  const longURL = urlDB[shortURL].longURL;
  res.redirect(longURL);
});

//Sets the PORT we are listening to
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});