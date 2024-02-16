const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const uri = "mongodb+srv://degenhack:passw0rd@cluster0.tjwkbm5.mongodb.net/?retryWrites=true&w=majority";

const gamesRoutes = require("./routes/games");
const usersRoutes = require("./routes/users");

mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to database!");
  })
  .catch((err) => {
    console.log("Connection failed!");
    console.log(err);
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use('/api/games', gamesRoutes);
app.use('/api/users', usersRoutes);

module.exports = app;