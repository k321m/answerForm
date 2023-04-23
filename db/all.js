exports.getAllRows = function (sql) {
  let sqlite3 = require("sqlite3").verbose();
  let db = new sqlite3.Database("answerForm.db");

  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      resolve(rows);
    });
  });
};
