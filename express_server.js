const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const password1 = bcrypt.hashSync("purple-monkey-dinosaur", 10);
const password2 = bcrypt.hashSync("123456", 10);
const cookieSession = require('cookie-session')
const PORT = 8080;

let isLoggin = false;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser()); // don't need it if we use cookieSession
// app.use(cookieSession({
//   name: 'session',
//   keys: ['key1', 'key2']
// }));
//app.use(morgan('dev'));
// app.use(express.static('public'));

app.set("view engine", "ejs");

const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
}

const isEmailExist = (object, email) => {
  for (const key in object) {
     if (Object.values(object[key]).indexOf(email) > -1) {
       return true;
     }
  }
}

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
let urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user2RandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};


const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: password1
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password:  password2
  },
}

app.get("/", (req, res) => {
  res.send("Our tiny web app is going to grow!");
});

app.get("/urls", (req, res) => {  
  let privateDatabase = {};
  if (req.cookies["user_id"]) {
    for (const key in urlDatabase) {
      if (urlDatabase[key].userID === req.cookies["user_id"]) { 
        privateDatabase = Object
        .assign(privateDatabase,{ [key]: urlDatabase[key]});
      }
    }
    //console.log(privateDatabase)
  }
  
  templateVars = {
    user: users[req.cookies["user_id"]],
    urls: privateDatabase
    };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect('/login');
  } else {
    templateVars = {
      user: users[req.cookies["user_id"]]
      };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  templateVars = {
    user: users[req.cookies["user_id"]],
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
  templateVars = {
    user: users[req.cookies["user_id"]],
    };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  templateVars = {
    user: users[req.cookies["user_id"]],
    };
  res.render("login", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] =  {longURL: req.body.longURL, userID: req.cookies["user_id"]};
  res.redirect(`/urls/${shortURL}`)
});


app.post("/urls/:shortURL/delete", (req, res) => {
  if (isLoggin) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect('/urls');
});

app.post("/urls/:shortURL", (req, res) => {
  if (isLoggin) {
    urlDatabase[req.params.shortURL] = {longURL: req.body.longURL, userID: req.cookies["user_id"]};
  }
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const randomID = "id" + generateRandomString();
  if (isEmailExist(users, req.body.email)) {
    res.status(400).send("<h1>User email already exist!</h1>");
  } else if (req.body.email && req.body.password) {
    users[randomID] = {};
    const { email, password } = req.body;
    const hashedUserPassword = bcrypt.hashSync(password, 10);
    users[randomID]["id"] = randomID;
    users[randomID]["email"] = email;
    users[randomID]["password"] = hashedUserPassword;
    res.cookie('user_id',randomID);
    res.redirect('/urls');
  } else {
    res.status(400).send("<h1>Opps! Something went wrong</h1><h3>Please fill up all information!</h3>");
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
    
  for (const userId in users) {
    const user = users[userId];
      if (bcrypt.compareSync(password, user.password)  
          && user.email === email) {
        //log user 
        //res.cookie('userId', userId);
        //req.session.userId = userId;
        isLoggin = true;
        res.cookie('user_id',user.id);
        res.redirect('/urls');
      }
  }
  
  if (!isEmailExist(users, email)) {
    res.status(403).send("<h1>Email can not be found!</h1>");
  } else if (!isLoggin && isEmailExist(users, email)) {
    res.status(403).send("<h1>Password does not match!</h1>");
  }
});

app.post("/logout", (req, res) => {
  isLoggin = false;
  res.clearCookie('user_id');
  res.redirect('/urls')
});
// app.post('\logout', (req, res) => {
  //   res.
  // })

// app.get('*', (req, res) => {
//   const userId = req.session.userId;
//   if (!userId) {
//    res.redirect('/login')
//   }
//   const user = users[userId]
//     if (!user) {
//    res.redirect('/register')
//   }
//   const templeVars = {user}
//   res.render('protected', templeVars)
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});