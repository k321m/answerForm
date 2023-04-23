exports.exec = function (sql) {
  let sqlite3 = require("sqlite3").verbose();
  let db = new sqlite3.Database("answerForm.db");
  return new Promise((resolve, reject) => {
    db.exec(sql, (stat, err) => {
      console.log("err:" + err);
      if (err) {
        reject(err);
        console.error(err);
      }
      resolve(stat);
    });
  });
};
