const express = require("express");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const helpers = require("./helpers");

const password1 = bcrypt.hashSync("purple-monkey-dinosaur", 10);
const password2 = bcrypt.hashSync("123456", 10);
const app = express();
const PORT = 8080;

let isLoggin = false;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cookieParser()); // don't need it if we use cookieSession
app.use(
  cookieSession({
    name: "session",
    keys: ["mykey1", "mykey2"]
  })
);
//app.use(morgan('dev'));
// app.use(express.static('public'));

app.set("view engine", "ejs");

const generateRandomString = () => {
  return Math.random()
    .toString(36)
    .substr(2, 6);
};

let urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user2RandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: password1
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: password2
  }
};

app.get("/", (req, res) => {
  res.send("Our tiny web app is going to grow!");
});

app.get("/urls", (req, res) => {
  let privateDatabase = {};
  if (req.session.user_id) {
    for (const key in urlDatabase) {
      if (urlDatabase[key].userID === req.session.user_id) {
        privateDatabase = Object.assign(privateDatabase, {
          [key]: urlDatabase[key]
        });
      }
    }
  }

  const templateVars = {
    user: users[req.session.user_id],
    urls: privateDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  console.log(req.params);
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (isLoggin) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  if (isLoggin) {
    urlDatabase[req.params.shortURL] = {
      longURL: req.body.longURL,
      userID: req.cookies["user_id"]
    };
  }
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const randomID = "id" + generateRandomString();

  if (helpers.getUserByEmail(req.body.email, users)) {
    res.status(400).send("<h1>User email already exist!</h1>");
  } else if (req.body.email && req.body.password) {
    users[randomID] = {};
    const { email, password } = req.body;
    const hashedUserPassword = bcrypt.hashSync(password, 10);
    users[randomID]["id"] = randomID;
    users[randomID]["email"] = email;
    users[randomID]["password"] = hashedUserPassword;
    req.session.user_id = randomID;
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

  const user = helpers.getUserByEmail(email, users);

  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      isLoggin = true;
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res.status(403).send("<h1>Password does not match!</h1>");
    }
  } else {
    res.status(403).send("<h1>Email can not be found!</h1>");
  }
});

app.post("/logout", (req, res) => {
  isLoggin = false;
  req.session = null;
  res.redirect("/urls");
});

// app.get("*", (req, res) => {
//   const userId = req.session.user_id;
//   if (!userId) {
//     res.redirect("/login");
//   }
//   const user = users[userId];
//   if (!user) {
//     res.redirect("/register");
//   }
// const templeVars = {user}
// res.render('protected', templeVars)
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
