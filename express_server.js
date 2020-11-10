//Imports
const express = require('express');
const bodyParser = require('body-parser');

const app = express(); //Sets app as express
const PORT = 8080 //sets the PORT we are using

//Adds body parser as middleware
app.use(bodyParser.urlencoded({ extended: true }));

//Sets EJS to generate templates
app.set('view engine', 'ejs');

//Database object
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};


const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8)
};
//Post requests
//Requst from the form submitting link to be shortend 
app.post('/urls', (req, res) => {
  //Generate 6 char string for short URL
  const newShortUrl = generateRandomString();
  urlDatabase[newShortUrl] = req.body.longURL;
  //Check to see if the url contains http if not add http://
  if (!req.body.longURL.startsWith('http')) {
    urlDatabase[newShortUrl] = 'http://' + req.body.longURL;
  }
  console.log(urlDatabase)
  res.redirect(301, `/urls/${newShortUrl}`);
});

//Get requests
//Route for all of the urls in the database
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//Route for the page to add a new URL
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

//Route to go to a URL by ID
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL, longURL: urlDatabase[shortURL] };
  res.render('urls_show', templateVars);
});

//redirects /u/:shortURL to it's long version
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(301, longURL);
})

//Sets the PORT we are listening to
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});