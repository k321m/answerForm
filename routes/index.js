var express = require("express");
var router = express.Router();
const fs = require("fs");

var dbget = require("../db/get.js");
var dball = require("../db/all.js");
var dbdo = require("../db/exec.js");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", {
    title: "主観評価実験",
    participantID: req.session.participantID,
    evaluationJsonData: req.session.evaluationJsonData,
    imageJsonData: req.session.imageJsonData,
  });
});

router.post("/", function (req, res, next) {
  req.session.participantID = req.body.participantID;
  let jsonFileName = String(req.session.participantID).padStart(2, "0");
  req.session.evaluationJsonData = JSON.parse(
    fs.readFileSync(
      "./json/evaluationJson/participant_" + jsonFileName + ".json",
      "utf8"
    )
  );
  req.session.imageJsonData = JSON.parse(
    fs.readFileSync(
      "./json/imageJson/participant_" + jsonFileName + ".json",
      "utf8"
    )
  );
  res.redirect("/form?id=0");
});

router.post("/export", async function (req, res, next) {
  let participantID = req.body.participantID;
  let sql = "select * from experiment1 where participant_id=" + participantID;
  let record = await dball.getAllRows(sql);

  fs.writeFile(
    String(parseInt(participantID)).padStart(2, "0") + ".json",
    JSON.stringify(record),
    (err) => err && console.error(err)
  );
  res.redirect("/");
});

/* View answer form */
router.get("/form", async function (req, res, next) {
  if (req.session.participantID == undefined) {
    res.redirect("/");
    return;
  }
  let id = req.query.id;
  if (req.query.id == 105) {
    res.render("finish");
    return;
  }
  let evaluationKey = Object.keys(req.session.evaluationJsonData[id]);
  let imgName = "/images/" + req.session.imageJsonData[id];
  res.render("form", {
    id: id,
    img: imgName,
    evaluation: evaluationKey,
  });
});

router.post("/form", async function (req, res, next) {
  let id = req.query.id;
  let participantID = req.session.participantID;
  let imgName = req.session.imageJsonData[id];
  imgName = imgName.substring(imgName.indexOf("/") + 1, imgName.length - 4);

  let selectSql =
    "select * from experiment1 where participant_id=" +
    +participantID +
    " and img='" +
    imgName +
    "'";
  let record = await dbget.getRow(selectSql);
  let sql = "";
  if (record != undefined) {
    let setStr = "";
    for (key in req.body) {
      setStr += '"' + key + '"=' + req.body[key] + ",";
    }
    sql =
      "update experiment1 set " +
      setStr.slice(0, -1) +
      " where participant_id=" +
      +participantID +
      " and img='" +
      imgName +
      "'";
  } else {
    var keyStr = "";
    var values = "";
    for (key in req.body) {
      keyStr += '"' + key + '",';
      values += req.body[key] + ",";
    }
    sql =
      "insert into experiment1 (participant_id, id, img, " +
      keyStr.slice(0, -1) +
      ") values(" +
      participantID +
      "," +
      (parseInt(id) + 1) +
      ",'" +
      imgName +
      "'," +
      values.slice(0, -1) +
      ")";
  }
  await dbdo.exec(sql);
  console.log(sql);
  res.redirect("/form?id=" + (parseInt(id) + 1));
});

module.exports = router;
