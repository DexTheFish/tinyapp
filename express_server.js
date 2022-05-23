const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { isNewEmail, generateRandomString, getUserByEmail, getURLSbyUserId } = require("./helpers");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(cookieSession({
  name: "session",
  keys: ["cats are cooler than dogs", "but i wont judge if you disagree"],
  maxAge: 24 * 60 * 60 * 1000 // 1 day
}));

const urlDatabase = { // declaring the structure of the database, for reference only.
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "zezima"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "zezima"
  }
};
const users = { // declaring the structure of the users, for reference only.
  "zezima": {
    id: "zezima",
    email: "goat@runescape.com",
    hashedPassword: "buying-gf$#Zd"
  },
  "kanyeWest": {
    id: "kanyeWest",
    email: "Ye@yeezy.com",
    hashedPassword: "scoopty-whoop&%#sBz"
  }
};
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/register", (req, res) => {
  // display the registration page
  const user = users[req.session.user_id];
  const templateVars = { user };
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  // register a new user
  const newUserId = generateRandomString(8);
  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(newUserPassword, 10);
  if (newUserEmail && newUserPassword && isNewEmail(newUserEmail, users)) {
    users[newUserId] = {
      id: newUserId,
      email: newUserEmail,
      hashedPassword
    };
    req.session.user_id = users[newUserId].id;
    res.redirect("/urls");
  } else {
    res.status(400);
    res.send('Error 400');
  }
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b>! You have found the TinyURL Easter Egg!</body></html>\n");
  console.log(users);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user };
  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.render("login", templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    const userURLdatabase = getURLSbyUserId(user.id, urlDatabase);
    const templateVars = { urls: userURLdatabase, user };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  if (req.session["user_id"]) {
    const shortURL = generateRandomString(6);
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = {
      longURL,
      userID: req.session["user_id"]
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(403);
    res.send('Error 403. Must be logged in to add a URL.');
  }
});

app.post('/login', (req, res) => {
  const enteredEmail = req.body.email;
  const enteredPassword = req.body.password;
  const userId = getUserByEmail(enteredEmail, users);
  if (userId && bcrypt.compareSync(enteredPassword, users[userId].hashedPassword)) {
    req.session.user_id = users[userId].id;
    res.redirect("/urls");
  } else {
    res.status(400);
    res.send('Error 400 - invalid credentials');
  }
});

app.get('/login', (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user };
  res.render("login", templateVars);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session.user_id];
  if (user && user.id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
  } else {
    res.status(403);
    res.send("Error - that is not yours to delete!");
  }
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const user = users[req.session.user_id];
  if (user && user.id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[shortURL] = {
      longURL,
      userID: req.session.user_id
    };
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send("Error - this URL does not belong to you. Please login or switch accounts to modify URLs.");

  }

});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  if (user && urlDatabase[req.params.shortURL] && user.id === urlDatabase[req.params.shortURL].userID) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user };
    res.render("urls_show", templateVars);
  } else {
    res.status(403);
    res.send("Error - this URL does not exist or does belong to you. Please login or switch accounts to modify URLs.");
  }
});