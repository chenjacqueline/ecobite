const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

// SIGN UP WITH EMAIL ADDRESS
router.get("/signup", (req, res, next) => {
  res.render("signup");
});

router.post("/signup", (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    res.render("signup.hbs", {
      errorMessage: "Email cannot be empty"
    });
    return;
  }
  if (password.length < 8) {
    res.render("signup.hbs", {
      errorMessage: "Password must be at least 8 characters."
    });
    return;
  }

  // User.findOne({ email });
  User.findOne({ email: email })
    .then(user => {
      if (user) {
        res.render("signup.hbs", {
          errorMessage: "Email already taken"
        });
        return;
      }

      bcrypt
        .hash(password, 10)
        .then(hash => {
          return User.create({ email: email, password: hash });
        })
        .then(createdUser => {
          // req.user = createdUser;
          req.login(createdUser, err => {
            if (err) {
              next(err);
              return;
            }
            res.redirect("/");
          });
        });
    })
    .catch(err => {
      next(err);
    });
});

// LOG IN WITH EMAIL ADDRESS

router.get("/login", (req, res) => {
  res.render("login", { errorMessage: req.flash("error") });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  })
);

// FACEBOOK OAUTH
router.get("/auth/facebook", passport.authenticate("facebook"));

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/login",
    successRedirect: "/"
  })
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/facebook/callback/`
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ facebookId: profile.id })
        .then(userDocument => {
          if (userDocument) {
            done(null, userDocument);
          } else {
            return User.create({ facebookId: profile.id }).then(createdUser => {
              done(null, createdUser);
            });
          }
        })
        .catch(err => {
          done(err);
        });
    }
  )
);

// GOOGLE OAUTH
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback route
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "/"
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`
    },
    (accessToken, refreshToken, profile, done) => {
      //
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`
    },
    (accessToken, refreshToken, profile, done) => {
      console.log(profile);

      User.findOne({ googleId: profile.id })
        .then(found => {
          if (found) {
            done(null, found); // Found is referring to the user
          } else {
            User.create({
              googleId: profile.id,
              displayName: profile.displayName
            }).then(createdUser => {
              done(null, createdUser);
            });
          }
        })
        .catch(err => {
          console.log(err);
          done(err);
        });
    }
  )
);

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: `${process.env.BASE_URL}/auth/google/callback`
//     },
//     (accessToken, refreshToken, profile, done) => {
//       console.log(profile);
//       // If user found with googleId, then log in:
//       User.findOne({ googleId: profile.id })
//         .then(found => {
//           if (found) {
//             done(null, found); // Found is referring to the user
//             // If googleId isn't found, create a new user:
//             // Catch: only if email isn't found either
//             // If email is found (user signed up with only email previously), then just add Google id to User document:
//           } else {
//             // If a User already has the @gmail account used,
//             User.findOne({email: profile.email})
//             .then(found => {
//               // Then update that User document with the Google ID:
//               User.updateOne({ googleId: profile.id });
//               done(null, found);
//             })

//             User.create({
//               googleId: profile.id,
//               displayName: profile.displayName
//             }).then(createdUser => {
//               done(null, createdUser);
//             });
//           }
//         })
//         .catch(err => {
//           done(err);
//         });
//     }
//   )
// );

// LOG OUT
router.get("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
