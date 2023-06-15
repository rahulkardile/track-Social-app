require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

// setUp

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Database

mongoose.connect("mongodb://127.0.0.1:27017/userDB")

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

const secret = "thisisnewSecrets."
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

//Get Routes

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/register", (req, res) => {
    res.render("register")
})

// Post Routes

app.post("/login", (req, res) => {
    const userName = req.body.username
    const password = req.body.password

    User.findOne({ email: userName }, (err, foundUser) => {
        if (err) {
            console.log(err);
            console.log("Error Found");
        } else {
            if(foundUser) {
                if (foundUser.password === password){
                    res.render("secrets")
                }
            }
        }
    })

})

app.post("/register", (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    })

    newUser.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.render("secrets");
        }
    })
})

app.listen(3000, () => {
    console.log("server is running . . .");
})