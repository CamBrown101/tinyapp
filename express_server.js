//Imports
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express(); //Sets app as express
const PORT = 8080; //sets the PORT we are using

//Middleware
//Allows us to use an external style sheet
app.use(express.static('public'))
//Parses our cookies
app.use(cookieParser());
//Adds body parser as middleware
app.use(bodyParser.urlencoded({ extended: true }));

//Sets EJS to generate templates
app.set('view engine', 'ejs');

//Database objects
//URL database
const urlDB = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
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
  }
}

//Functions
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
  for (id in userDB) {
    if (email === userDB[id].email) {
      return true;
    }
  }
  return false;
};

//Post requests
//Requst from the form submitting link to be shortends
app.post('/urls', (req, res) => {
  //Generate 6 char string for short URL
  const newShortUrl = generateRandomString();
  const longURL = req.body.longURL;

  //Check to see if the url contains http if not add http://
  if (!req.body.longURL.startsWith('http')) {
    res.redirect('urls/new');
    return
  };

  urlDB[newShortUrl] = longURL;
  res.redirect(`/urls/${newShortUrl}`);
});
//Login and add a cookie with username
app.post('/login', (req, res) => {

  res.cookie('username', req.body.username);
  res.redirect('/urls');
})
//Logout and remove cookie with username
app.post('/logout', (req, res) => {

  res.clearCookie('username');
  res.redirect('/urls');
})
app.post('/register', (req, res) => {
  //Check to see if the email or password fields are blank
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('No email or password entered!');
  }
  //checks to see if the email is already in the database
  if (doesEmailExist(req.body.email)) {
    return res.status(400).send('Email Already Exists!');
  }
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  userDB[userID] = { userID, email, password };
  res.cookie('user_id', userID);
  res.redirect('/urls');
})

//Route to edit the longURL associacted with a shortURL
app.post('/urls/:shortURL/edit', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;

  if (longURL.startsWith('http')) {
    urlDB[shortURL] = longURL;
  };

  res.redirect(`/urls/${shortURL}`);
});
//Route to delete an object from the database
app.post('/urls/:shortURL/delete', (req, res) => {
  deleteUrl(req.params.shortURL)
  res.redirect('/urls');
});

//Get requests
app.get('/register', (req, res) => {
  const user = userDB[req.cookies['user_id']];
  const templateVars = { urls: urlDB, user };
  res.render('registration_page', templateVars)
});
//Route for all of the urls in the database
app.get('/urls', (req, res) => {
  const user = userDB[req.cookies['user_id']];
  const templateVars = { urls: urlDB, user };
  res.render('urls_index', templateVars);
});

//Route for the page to add a new URL
app.get('/urls/new', (req, res) => {
  const user = userDB[req.cookies['user_id']];
  const templateVars = { user };
  res.render('urls_new', templateVars);
});

//Route to go to a URL by ID
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDB[shortURL];
  const user = userDB[req.cookies['user_id']];
  const templateVars = { shortURL, longURL, user };

  res.render('urls_show', templateVars);
});

//redirects /u/:shortURL to it's long version
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDB[shortURL];
  res.redirect(longURL);
});

//Sets the PORT we are listening to
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});