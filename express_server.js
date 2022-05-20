const express = require("express");
const app = express();
const PORT = 3000; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser())

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
}

function generateRandomString(stringLength) {
  const alphaNumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomString = ''
  for (let i = 0; i < stringLength; i++) {
    randomString += alphaNumeric[Math.floor(Math.random()*62)];
  }
  return randomString;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/register", (req, res) => { // NEW
  templateVars = { username: req.cookies["username"] };
  res.render("registration", templateVars);
});

app.post("/register", (req, res) => {
  const newUserId = generateRandomString(8);
  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;
  users[newUserId] = {
    id: newUserId,
    email: newUserEmail,
    password: newUserPassword
  };
res.cookie("user_id", newUserId);
console.log(users);
res.redirect("/urls");
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/hello", (req, res) => { // example
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log("req.body:",req.body); 
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/login', (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log('testing the database:', urlDatabase);
  console.log('param: ', req.params);
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
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] }; // MODIFIED!!!!!!
  res.render("urls_show", templateVars);
});



// hello test