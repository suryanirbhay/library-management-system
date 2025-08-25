const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const ejs = require('ejs');
const pdf = require('html-pdf');
const path = require('path');
const homeRoute = require('./routes/homeRoute')
const adminlogin = require('./routes/adminLogin');
const managebooks = require('./routes/manageBooks')
const manageUsers = require("./routes/manageUsers");
const adminLogs = require("./routes/adminLogs");
const issueBook = require("./routes/issueBook");


const app = express();
app.use(flash());

app.use(
  session({
    secret: "secretkey",
    resave: true,
    saveUninitialized: true,
  })
);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


const port = process.env.PORT || 4000;


// handling routes of student login ----------------
app.use("/",homeRoute);

// handling routes of admin login ------------------
app.use("/",adminlogin);

// handling routes of manage Books -----------------
app.use("/",managebooks);

// routes to handle admin dashboard ----------------
app.use("/",manageUsers);

// routes to handle admin logs ---------------------
app.use("/",adminLogs);

// routes to issue book ----------------------------
app.use("/",issueBook);







app.listen(4000, () => {
  console.log(`Server running on https://localhost:${port} `);
});
