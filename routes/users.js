var express = require("express");
var router = express.Router();

var dbget = require("../db/get.js");

/* Login */
router.get("/login", function (req, res, next) {
  res.render("login", {
    title: "ログイン",
    login: req.session.login,
  });
});

router.post("/login", async function (req, res, next) {
  let account = req.body.account;
  let password = req.body.password;

  let sql =
    "select * from users where account='" +
    account +
    "' and password='" +
    password +
    "'";
  console.log(sql);
  let record = await dbget.getRow(sql);
  if (record != undefined) {
    req.session.login = record;
  }
  res.redirect("/");
});

/* Logout */
router.get("/logout", function (req, res, next) {
  req.session.login = undefined;
  res.redirect("/users/login");
});

module.exports = router;
