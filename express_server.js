//Imports
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { getIdByEmail, generateRandomString, deleteUrl, doesEmailExist, isLoggedIn, getPasswordByEmail, getUrlById, doesLoggedInOwnUrl } = require('./helper')

//Sets app as express
const app = express();

//sets the PORT we are using
const PORT = process.env.PORT || 8080;

//Sets EJS to generate templates
app.set('view engine', 'ejs');

//Middleware
//Allows us to use an external style sheet
app.use(express.static('public'))

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

  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ3dlW" },
  b6UTxQ: { longURL: "https://wwwa.tsn.ca", userID: "aJ3flW" },
  b6UTxQ: { longURL: "https://wwwa.tsn.ca", userID: "aJ38lW" },
  b6UTxQ: { longURL: "https://www.tssn.ca", userID: "aJ48lW" },
  i4BoGr: { longURL: "https://www.google.ca", userID: "1" },
  i3BoGr: { longURL: "https://www.gfdoogle.ca", userID: "1" }
};

//User database
const userDB = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "1": {
    id: "1",
    email: "a@b.com",
    password: bcrypt.hashSync("1", 10)
  }
};

//Post requests
//Requst from the form submitting link to be shortends
app.post('/urls', (req, res) => {
  //Generate 6 char string for short URL
  const newShortUrl = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.user_id;

  //Check to see if the url contains http if not add http://
  if (!req.body.longURL.startsWith('http')) {
    return res.redirect('urls/new');
  };

  urlDB[newShortUrl] = { longURL, userID };
  res.redirect(`/urls/${newShortUrl}`);
});

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
  res.status(403).send('Email or password was incorrect!')
})

//Logout and remove cookie with user_id
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
})

//Register the new user after validation
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  const userID = generateRandomString();
  //Check to see if the email or password fields are blank
  if (!email || !password) {
    return res.status(400).send('No email or password entered!');
  };
  //checks to see if the email is already in the database
  if (doesEmailExist(email, userDB)) {
    return res.status(400).send('Email Already Exists!');
  };

  userDB[userID] = { userID, email, password };
  res.cookie('user_id', userID);
  res.redirect('/urls');
})

//Route to edit the longURL associacted with a shortURL
app.post('/urls/:shortURL/edit', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const loggedInID = req.session.user_id;
  // const [short, long] = fn(req)
  if (doesLoggedInOwnUrl(shortURL, loggedInID, userDB)) {
    if (longURL.startsWith('http')) {
      urlDB[shortURL].longURL = longURL;
      return res.redirect(`/urls/${shortURL}`);
    }
  };
  res.status(401).send('You must be logged in!')
  // return res.redirect('/login');
});

//Route to delete an object from the database
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const loggedInID = req.session.user_id;
  if (doesLoggedInOwnUrl(shortURL, loggedInID, userDB)) {
    deleteUrl(shortURL, urlDB)
    return res.redirect('/urls');
  };
  res.status(401).send('You must be logged in!')
  // return res.redirect('/login');
});

//Get requests
//Route for the login page
app.get('/login', (req, res) => {
  const title = 'Login';
  const user = userDB[req.session.user_id];
  const templateVars = { urls: urlDB, user, title };
  res.render('login_page', templateVars);
});

//Route for the register page
app.get('/register', (req, res) => {
  const title = 'Register';
  const user = userDB[req.session.user_id];
  const templateVars = { urls: urlDB, user, title };
  res.render('registration_page', templateVars);
});

//Route for all of the urls in the database
app.get('/urls', (req, res) => {
  if (!isLoggedIn(req)) {
    return res.redirect('/login')
  };
  const title = 'Urls';
  const user = userDB[req.session.user_id];
  const urls = getUrlById(user.id, userDB);
  const templateVars = { urls, user, title };

  res.render('urls_index', templateVars);
});

//Route for the page to add a new URL
app.get('/urls/new', (req, res) => {
  const title = 'New Url';
  const user = userDB[req.session.user_id];
  const templateVars = { user, title };
  // console.log(isLoggedIn(req))
  if (!isLoggedIn(req)) {
    return res.redirect('/login')
  };
  res.render('urls_new', templateVars);

});

//Route to go to a URL by ID
app.get('/urls/:shortURL', (req, res) => {
  const title = 'Short Url'
  const shortURL = req.params.shortURL;
  const longURL = urlDB[shortURL].longURL;
  const user = userDB[req.session.user_id];
  const templateVars = { shortURL, longURL, user, title };
  res.render('urls_show', templateVars);
});

//redirects /u/:shortURL to it's long version
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDB[shortURL].longURL;
  res.redirect(longURL);
});

//Sets the PORT we are listening to
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});