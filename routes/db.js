var express = require("express");
var router = express.Router();

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("answerForm.db");

router.get("/", function (req, res, next) {
  let data = [];
  db.all("SELECT * FROM experiment1", (err, rows) => {
    let opt = {
      title: "Hello",
      data: rows,
    };
    res.render("db", opt);
  });
});

module.exports = router;
