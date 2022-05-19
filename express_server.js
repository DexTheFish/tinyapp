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

function generateRandomString() {
  const alphaNumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomString = ''
  for (let i = 0; i < 6; i++) {
    randomString += alphaNumeric[Math.floor(Math.random()*62)];
  }
  return randomString;
}

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  templateVars = { username: req.cookies["username"] }; // modified!!!!!!!!!!!!!!!!!!
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]}; // MAY19
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log("req.body:",req.body); 
  const shortURL = generateRandomString()
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/login', (req,res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
})

app.post("/logout", (req,res)=>{
  res.clearCookie("username");
  res.redirect("/urls") //CHANGE ??
})


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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// hello test