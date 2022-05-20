const express = require("express");
const app = express();
const PORT = 3000; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { resolveInclude } = require("ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "zezima": {
    id: "zezima", 
    email: "goat@runescape.com", 
    password: "buying-gf"
  },
 "kanyeWest": {
    id: "kanyeWest", 
    email: "Ye@yeezy.com", 
    password: "scoopty-whoop"
  }
};

function isNewEmail(emailAddress) {
  for (const u in users) {
    if (users[u].email.toUpperCase() === emailAddress.toUpperCase()) {
      return false;
    }
  }
  return true;
};

function generateRandomString(stringLength) {
  const alphaNumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomString = ''
  for (let i = 0; i < stringLength; i++) {
    randomString += alphaNumeric[Math.floor(Math.random()*62)];
  }
  return randomString;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  templateVars = { user };
    //templateVars = { username: req.cookies["username"] };
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  const newUserId = generateRandomString(8);
  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;
  if (newUserEmail && newUserPassword && isNewEmail(newUserEmail)) {
    users[newUserId] = {
      id: newUserId,
      email: newUserEmail,
      password: newUserPassword
    };
    res.cookie("user_id", newUserId);
    res.redirect("/urls");
  } else {
    res.status(400);
    res.send('Error 400');
  };
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/hello", (req, res) => { // example
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  templateVars = { user };
  //templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/login', (req, res) => {
  //res.cookie("user_id", req.body.email);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; //req.params reads from the URL
  const longURL = req.body.longURL; // req.body reads from the FORM
  urlDatabase[shortURL] = longURL; //reassign vx2Bz1 to another website
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => { // THIS MUST BE BENEATH THE OTHER APP.GET LINES that begin with /urls.
  const user = users[req.cookies["user_id"]];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user }; // MODIFIED!!!!!!
  res.render("urls_show", templateVars);
});