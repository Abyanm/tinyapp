const { name } = require("ejs");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookies = require("cookie-parser");
app.use(cookies());
const bcrypt = require('bcryptjs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

function urlsForUser(id) {
  let urls=[];
  for(let url in urlDatabase){
    let userID= urlDatabase[url].userID;
    let urlFound = urlDatabase[url].longURL
    if(userID == id){
      urls.push(urlFound)
    }
  }
  return urls;
}
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
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
  
    // ADD req.body to the urlDatabase
    let shortURL = generateRandomString()
    urlDatabase[shortURL] = { 
      longURL: req.body.longURL, user_id : req.cookies.user_id
    }
    res.redirect(`/urls/${shortURL}`)         // Respond with 'Ok' (we will replace this)
  });
  app.post("/urls/:shortURL/delete", (req, res) => {
    let shortURL = req.params.shortURL;
    // console.log(urlDatabase)
    // console.log(urlDatabase[shortURL])
    if(urlDatabase[shortURL].user_id === req.cookies.user_id){  // use user_is to refrence user id
      delete urlDatabase[shortURL] 
      res.redirect("/urls")
    } else {
      res.status(401).send("Please Login")
    }
  
  })

  app.post("/urls/:shortURL", (req, res) => {
    let shortURL = req.params.shortURL;
  
    if(urlDatabase[shortURL].user_id === req.cookies.user_id){  // use user_is to refrence user id
      urlDatabase[shortURL].longURL=req.body.newurl  // this is where i will add the edit 
      res.redirect("/urls")
    } else {
      res.status(401).send("Please Login")
    }
    
  })

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/login", (req, res) => {
    let id = req.cookies.user_id
    const templateVars = { 
      urls: urlDatabase ,
      user: users[id]
    };

res.render("urls_login", templateVars)

});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
}); 

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

app.get("/urls", (req, res) => {
  let id = req.cookies.user_id
    const templateVars = { 
      urls: urlDatabase ,
      user: users[id]
    };
    res.render("urls_index", templateVars);
  });

app.get("/urls/new", (req, res) => {
  let id = req.cookies.user_id
  const templateVars = {
    user: users[id]
  };

  if(users[id]){
    res.render("urls_new",templateVars);
  } else {
    console.log("Account must be logged in, Please log in first.")
    // res.status(403).send("User not logged in")
    res.redirect("/login")
    
  }
   
  });

// app.get("/u/:shortURL", (req, res) => {
//    res.redirect(urlDatabase[req.params.shortURL].longURL)
//   });

  app.get("/register", (req, res) => {
    let id = req.cookies.user_id
  const templateVars = {
    user: users[id]
  };
    res.render("urls_registration",templateVars)
   });

app.post("/login", (req, res) => {
    for(let user in users) {
      let userFound = users[user]
        if(userFound.email == req.body.email){
          // make the incoming password compare to the hashed password and come back to the incoming password
          const passwordFromDatabase = userFound.password // hashed password
          const passwordFromUser = req.body.password  // regular password
          const isPasswordsValid = bcrypt.compareSync(passwordFromUser, passwordFromDatabase)
          if(!isPasswordsValid ) {
            res.status(403).send("Invalid Password")
          } 
          res.cookie("user_id",userFound.id)
          res.redirect("/urls") 
          return 
          
        }
    }
    res.status(403).send("Invalid Email")
  });  

   app.post("/logout", (req, res) => {
    res.clearCookie('user_id')
    //   res.send("ok")
    res.redirect("/urls")
     });  
app.post("/register", (req, res) => {
  let email= req.body.email
  let password = req.body.password
  const hashedPassword = bcrypt.hashSync(password, 10);
  if(!email ) {
    res.status(400).send("Invalid Email")
  }
  if(!password ) {
    res.status(400).send("Invalid password")
  } 
  for ( user in users) {
    if(users[user].email == email) {
      res.status(400).send("Email already registered")
    }
  }
  
  
  let id = generateRandomString()
      let userinfo = {
        "email": email,
        "password": hashedPassword,
        "id":id
      }
      users[id]= userinfo
      res.cookie('user_id', id)
      res.redirect("/urls")
});  

  app.get("/urls/:shortURL", (req, res) => {
    let parameterValue = req.params.shortURL
    let longURL;
    for(let url in urlDatabase){
        if(parameterValue) {
            longURL = urlDatabase[parameterValue].longURL
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

