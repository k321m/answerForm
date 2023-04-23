var express = require("express");
var router = express.Router();
const fs = require("fs");

var dbdo = require("../db/exec.js");

var participantID = 0;
var evaluationJsonData = null;
var imageJsonData = null;

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "主観評価実験" });
});

router.post("/", function (req, res, next) {
  participantID = req.body.participantID;
  let jsonFileName = String(participantID).padStart(2, "0");
  evaluationJsonData = JSON.parse(
    fs.readFileSync(
      "./json/evaluationJson/participant_" + jsonFileName + ".json",
      "utf8"
    )
  );
  imageJsonData = JSON.parse(
    fs.readFileSync(
      "./json/imageJson/participant_" + jsonFileName + ".json",
      "utf8"
    )
  );
  res.redirect("/form?id=0");
});

/* View answer form */
router.get("/form", async function (req, res, next) {
  let id = req.query.id;
  let imgName = "/images/" + imageJsonData[id];
  let evaluationKey = Object.keys(evaluationJsonData[id]);
  res.render("form", {
    id: id,
    img: imgName,
    evaluation: evaluationKey,
  });
});

router.post("/form", async function (req, res, next) {
  let id = req.query.id;
  var intId = parseInt(id, 10);
  let answerData = req.body;
  var keyStr = "";
  var values = "";
  console.log(Object.keys(req.body).length);

    for (key in req.body) {
      keyStr += '"' + key + '",';
      values += req.body[key] + ",";
    }
  let sql =
    "insert into experiment1 (participant_id, img_num, " +
    keyStr.slice(0, -1) +
    ") values(" +
    participantID +
    "," +
    id +
    "," +
    values.slice(0, -1) +
    ")";
  console.log(sql);
  await dbdo.exec(sql);

  res.redirect("/form?id=" + (intId + 1));
});

module.exports = router;
