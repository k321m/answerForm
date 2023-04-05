// 被験者番号 [実行前に変更]
const PARTICIPANT_NUM = 1;
const fs = require("fs");
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

var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/* View answer form */
router.get("/form", async function (req, res, next) {
  let id = req.query.id;
  let imgName = "./img/" + imageJsonData[id];
  let evaluationKey = Object.keys(evaluationJsonData[id]);
  res.render("form", {
    title: "answer form",
    img: imgName,
    evaluation: evaluationKey,
  });
});

module.exports = router;
