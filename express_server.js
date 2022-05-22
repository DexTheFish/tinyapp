const express = require("express");
const app = express();
const PORT = 3000; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { resolveInclude } = require("ejs");
const { isNewEmail, generateRandomString, getUserByEmail, getURLSbyUserId } = require("./helpers");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "zezima"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "zezima"
  }
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
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user };
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  const newUserId = generateRandomString(8);
  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;
  if (newUserEmail && newUserPassword && isNewEmail(newUserEmail, users)) {
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
  }
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/hello", (req, res) => { // example
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
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
  const user = users[req.cookies["user_id"]];
  if (user) {
    const userURLdatabase = getURLSbyUserId(user.id, urlDatabase);
    const templateVars = { urls: userURLdatabase, user };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    const shortURL = generateRandomString(6);
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = {
      longURL,
      userID: req.cookies["user_id"] //!!!!!!!!!!!!!!!
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
  if (userId && users[userId].password === enteredPassword) {
    res.cookie("user_id", userId);
    res.redirect("/urls");
  } else {
    res.status(400);
    res.send('Error 400 - invalid credentials');
  }
  // let user;
  // const templateVars = { user };
  // res.render("login", templateVars);
});

app.get('/login', (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user };
  res.render("login", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user && user.id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
  } else {
    res.status(403);
    res.send("Error - that is not yours to delete!");
  }
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; //req.params reads from the URL
  const longURL = req.body.longURL; // req.body reads from the FORM
  const user = users[req.cookies["user_id"]];
  if (user && user.id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[shortURL] = {
      longURL,
      userID: req.cookies["user_id"]   //reassigns shortURL to another website
    } 
    res.redirect("/urls");  
  } else {
    res.status(403);
    res.send("Error - this URL does not belong to you. Please login or switch accounts to modify URLs.");

  }

});

app.get("/urls/:shortURL", (req, res) => { // THIS MUST BE BENEATH THE OTHER APP.GET LINES that begin with /urls.
  const user = users[req.cookies["user_id"]];
  if (user && urlDatabase[req.params.shortURL] && user.id === urlDatabase[req.params.shortURL].userID) {
    const userURLdatabase = getURLSbyUserId(user.id, urlDatabase);
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user };
    res.render("urls_show", templateVars);
  } else {
    res.status(403);
    res.send("Error - this URL does not exist or does belong to you. Please login or switch accounts to modify URLs.");
  }
});