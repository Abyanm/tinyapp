const { name } = require("ejs");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookies = require("cookie-parser");
app.use(cookies());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "pink-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-greg"
  }
}

function generateRandomString() {
    const rand = Math.random().toString(16).substr(2, 8);
    return rand;
}


app.post("/urls", (req, res) => {
    console.log(req.body);  // Log the POST request body to the console
    // ADD req.body to the urlDatabase
    let shortURL = generateRandomString()
    urlDatabase[shortURL] = req.body.longURL
    console.log(urlDatabase);
    res.redirect(`/u/${shortURL}`)         // Respond with 'Ok' (we will replace this)
  });
  app.post("/urls/:shortURL/delete", (req, res) => {
    let shortURL = req.params.shortURL;
    console.log(urlDatabase)
    delete urlDatabase[shortURL]
    console.log(urlDatabase)

    res.redirect("/urls")
  })
  app.post("/urls/:id", (req, res) => {

  })

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
}); 

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase ,
      username: req.cookies['username'] };
    res.render("urls_index", templateVars);
  });

app.get("/urls/new", (req, res) => {

  const templateVars = {
    username: req.cookies['username']
  };
    res.render("urls_new",templateVars);
  });

app.get("/u/:shortURL", (req, res) => {
   res.send("ok")
  });

  app.get("/register", (req, res) => {
    res.render("urls_registration")
   });

app.post("/login", (req, res) => {
  let username = req.body.username
  res.cookie('username',username)
    res.redirect("/urls")
   });  

   app.post("/logout", (req, res) => {
    res.clearCookie('username')
    //   res.send("ok")
    res.redirect("/urls")
     });  
app.post("/register", (req, res) => {
  let email= req.body.email
  let password = req.body.password
  let id = generateRandomString()
      let userinfo = {
        email: email,
        password: password,
        id:id
      }
      users[id]= userinfo
      console.log(users)
      res.cookie('user_id', id)
      res.redirect("/urls")
});  

  app.get("/urls/:shortURL", (req, res) => {
    let parameterValue = req.params.shortURL
    let longURL;
    for(let url in urlDatabase){
        if(parameterValue) {
            console.log(urlDatabase[parameterValue])
            longURL = urlDatabase[parameterValue]
        } else {
            longURL = "doesn't exist"
        }
    }
    const templateVars = { shortURL: req.params.shortURL, longURL: longURL};
    res.render("urls_show", templateVars);
  });
  

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

