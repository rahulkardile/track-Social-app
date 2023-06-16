//  requirements
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

// setUp

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: "never tell the secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//Database

mongoose.connect("mongodb://127.0.0.1:27017/userDB")

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Get Requests

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/register", (req, res) => {
    res.render("register")
})

app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets")
    } else {
        res.redirect("/login")
    }
})

app.get("/logout", (req, res) => {
    req.logOut((err) => {
        if(err){
            console.log(err);
        }else{
            res.redirect("/");
        }
    });
    
})

//  Post Requests

app.post("/register", (req, res) => {

    User.register({ username: req.body.username }, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets")
            })
        }
    })
})

app.post("/login", (req, res) => {
    const user = new User({
        username : req.body.username,
        password : req.body.password  
    })

    req.logIn(user, (err) => {
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req, res, ()=> {
                res.redirect("/secrets");
            })
        }
    })
})

//  server setUp

app.listen(3000, () => {
    console.log('Server is Running . . . .');
})