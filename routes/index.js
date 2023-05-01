var express = require("express");
var router = express.Router();
const fs = require("fs");

var dbget = require("../db/get.js");
var dball = require("../db/all.js");
var dbdo = require("../db/exec.js");

/* GET home page. */
router.get("/", function (req, res, next) {
  if (req.session.login == undefined) {
    res.redirect("/users/login");
    return;
  }
  res.render("index", {
    title: "色付きマスクの主観評価実験",
    message: "実験する被験者番号を入力してください。",
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

router.get("/export", async function (req, res, next) {
  if (req.session.login == undefined) {
    res.redirect("/users/login");
    return;
  }
  res.render("export", {
    title: "データ書き出し",
    message: "書き出したいデータの被験者番号を入力してください．",
  });
});

router.post("/export", async function (req, res, next) {
  let participantID = req.body.participantID;
  let sql = "select * from experiment1 where participant_id=" + participantID;
  let record = await dball.getAllRows(sql);

  let fileName =
    "jsonData/" + String(parseInt(participantID)).padStart(2, "0") + ".json";

  fs.writeFileSync(
    fileName,
    JSON.stringify(record),
    (err) => err && console.error(err)
  );
  res.download(fileName);
});

router.get("/start", async function (req, res, next) {
  if (req.session.login == undefined) {
    res.redirect("/users/login");
    return;
  }
  if (req.session.participantID == undefined) {
    res.redirect("/");
    return;
  }
  res.render("start");
});

/* View answer form */
router.get("/form", async function (req, res, next) {
  if (req.session.login == undefined) {
    res.redirect("/users/login");
    return;
  }
  if (req.session.participantID == undefined) {
    res.redirect("/");
    return;
  }
  if (req.query.id == 0) {
    sampleData = JSON.parse(
      fs.readFileSync("./json/evaluationJson/sample.json", "utf8")
    );
    res.render("sample", {
      img: "/images/face3/face3_31_w0.png",
      evaluation: Object.keys(sampleData[0]),
    });
    return;
  }
  if (req.query.id > 105) {
    res.render("finish");
    return;
  }
  let id = parseInt(req.query.id) - 1;
  let evaluationKey = Object.keys(req.session.evaluationJsonData[id]);
  let imgName = "/images/" + req.session.imageJsonData[id];
  res.render("form", {
    id: id + 1,
    img: imgName,
    evaluation: evaluationKey,
  });
});

router.post("/form", async function (req, res, next) {
  console.log("req.query.id:" + req.query.id);
  let id = parseInt(req.query.id) - 1;
  console.log("id:" + id);
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
  res.redirect("/form?id=" + (parseInt(req.query.id) + 1));
});

module.exports = router;
