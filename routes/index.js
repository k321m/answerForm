var express = require("express");
var router = express.Router();
const fs = require("fs");

var dbdo = require("../db/exec.js");

// 被験者番号 [実行前に変更]
const PARTICIPANT_NUM = 1;

var jsonFileName = String(PARTICIPANT_NUM).padStart(2, "0");

const evaluationJsonData = JSON.parse(
  fs.readFileSync(
    "./json/evaluationJson/participant_" + jsonFileName + ".json",
    "utf8"
  )
);
const imageJsonData = JSON.parse(
  fs.readFileSync(
    "./json/imageJson/participant_" + jsonFileName + ".json",
    "utf8"
  )
);

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/* View answer form */
router.get("/form", async function (req, res, next) {
  let id = req.query.id;
  let imgName = "/images/" + imageJsonData[id];
  let evaluationKey = Object.keys(evaluationJsonData[id]);
  res.render("form", {
    title: "answer form",
    id: id,
    img: imgName,
    evaluation: evaluationKey,
  });
});

router.post("/form", async function (req, res, next) {
  let id = req.query.id;
  var intId = parseInt(id, 10);
  if (intId != -1) {
    console.log(req.body);
    console.log(Object.keys(req.body));
    var keyStr = "";
    var values = "";
    for (key in req.body) {
      keyStr += '"' + key + '",';
      values += req.body[key] + ",";
    }
    let sql =
      "insert into experiment1 (participant_id, img_num, " +
      keyStr.slice(0, -1) +
      ") values(1," +
      id +
      "," +
      values.slice(0, -1) +
      ")";
    console.log(sql);
    await dbdo.exec(sql);
  }
  res.redirect("/form?id=" + (intId + 1));
});

module.exports = router;
