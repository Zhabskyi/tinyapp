const express = require("express");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const {
  getUserByEmail,
  isLoggin,
  userUrls,
  checkUrlHeader,
  generateRandomString
} = require("./helpers");
const { urlDatabase, users } = require("./config");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["mykey1", "mykey2"]
  })
);

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session.userId],
    urls: userUrls(req.session.userId, urlDatabase)
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.userId) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.session.userId]
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  // this check if user enter unvalid shortURL manualy in browser
  if (!urlDatabase[req.params.shortURL]) {
    res.render("index");
  } else {
    const templateVars = {
      user: users[req.session.userId],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.userId]
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.userId]
  };
  res.render("login", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userId = req.session.userId;

  checkUrlHeader(longURL, shortURL, userId, urlDatabase);

  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (isLoggin(req.session.userId)) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  if (isLoggin(req.session.userId)) {
    urlDatabase[req.params.shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.userId
    };
  }
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const randomID = "id" + generateRandomString();

  if (getUserByEmail(req.body.email, users)) {
    res.status(400).send("<h1>User email already exist!</h1>");
  } else if (req.body.email && req.body.password) {
    users[randomID] = {};
    const { email, password } = req.body;
    const hashedUserPassword = bcrypt.hashSync(password, 10);
    users[randomID]["id"] = randomID;
    users[randomID]["email"] = email;
    users[randomID]["password"] = hashedUserPassword;
    req.session.userId = randomID;
    res.redirect("/urls");
  } else {
    res
      .status(400)
      .send(
        "<h1>Opps! Something went wrong</h1><h3>Please fill up all information!</h3>"
      );
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = getUserByEmail(email, users);

  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      req.session.userId = user.id;
      res.redirect("/urls");
    } else {
      res.status(403).send("<h1>Password does not match!</h1>");
    }
  } else {
    res.status(403).send("<h1>Email can not be found!</h1>");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("*", (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.redirect("/login");
  }
  const user = users[userId];
  if (!user) {
    res.redirect("/register");
  }
  res.render("index");
});

app.listen(PORT, () => {
  console.log(`TinyApp app listening on port ${PORT}!`);
});
