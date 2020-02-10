require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const favicon = require("serve-favicon");
const hbs = require("hbs");
const mongoose = require("mongoose");
const logger = require("morgan");
const path = require("path");
const User = require("./models/User");

mongoose
  .connect("mongodb://localhost/ecobite", { useNewUrlParser: true })
  .then(x => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });

const app_name = require("./package.json").name;
const debug = require("debug")(
  `${app_name}:${path.basename(__filename).split(".")[0]}`
);

const app = express();

// Middleware Setup
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(
  require("node-sass-middleware")({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public"),
    sourceMap: true
  })
);

app.use(
  session({
    cookie: {
      maxAge: 24 * 60 * 60 * 1000
    },
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // The following is from connect-mongo
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);

// PASSPORT
const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy;

app.use(passport.initialize());
app.use(passport.session());

const flash = require("connect-flash");
app.use(flash());

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(userDocument => {
      done(null, userDocument);
    })
    .catch(err => {
      done(err);
    });
});

// PASSPORT: LOCAL STRATEGY FOR EMAIL SIGNUP / LOGIN
passport.use(
  new LocalStrategy((email, password, done) => {
    User.findOne({ email: email })
      .then(userDocument => {
        console.log(userDocument);
        if (!userDocument) {
          done(null, false, { message: "Incorrect credentials" });
          return;
        }
        bcrypt.compare(password, userDocument.password).then(match => {
          if (!match) {
            done(null, false, { message: "Incorrect credentials" });
            return;
          }
          done(null, userDocument);
        });
      })
      .catch(err => {
        done(err);
      });
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

// default value for title local
app.locals.title = "ecobite";

const index = require("./routes/index");
app.use("/", index);

const restaurantRoutes = require("./routes/restaurants");
app.use("/", restaurantRoutes);

const authRoutes = require("./routes/auth");
app.use("/", authRoutes);

module.exports = app;
