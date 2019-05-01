const express = require("express");
const router = express.Router();
const User = require("../models/user");

const bcrypt = require("bcrypt");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const bcryptSalt = 10;
// const hash1 = bcrypt.hashSync(plainPassword1, salt);

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

//Get Signup Page
router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

//Post to Signup Page
router.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(password, salt);

  //User creation
  User.create({
    username,
    password: hashPass
  })
    .then(() => {
      res.redirect("/");
    })
    .catch(error => {
      console.log(error);
    });
});

//Get Login Page
router.get("/login", (req, res, next) => {
  res.render("auth/login");
});

//Post to Login Page
router.post("/login", (req, res, next) => {
  const theUsername = req.body.username;
  const thePassword = req.body.password;

  if (theUsername === "" || thePassword === "") {
    res.render("auth/login", {
      errorMessage: "Please enter both, username and password to sign up."
    });
    return;
  }

  //Find the User Account
  User.findOne({ username: theUsername })
    .then(user => {
      if (!user) {
        res.render("auth/login", {
          errorMessage: "The username doesn't exist."
        });
        return;
      }
      if (bcrypt.compareSync(thePassword, user.password)) {
        // Save the login in the session!
        req.session.currentUser = user;
        res.redirect("/");
      } else {
        res.render("auth/login", {
          errorMessage: "Incorrect password"
        });
      }
    })
    .catch(error => {
      next(error);
    });
});

//Private Page Route
router.use((req, res, next) => {
  if (req.session.currentUser) {
    // <== if there's user in the session (user is logged in)
    next(); // ==> go to the next route ---
  } else {
    //    |
    res.redirect("/login"); //    |
  } //    |
}); // ------------------------------------
//     |
//     V
router.get("/private", (req, res, next) => {
  res.render("private");
});

//Logout Page Route
router.get("/logout", (req, res, next) => {
  req.session.destroy(err => {
    // can't access session here
    res.redirect("/login");
  });
});

module.exports = router;
