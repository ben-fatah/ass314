const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.db');


const authentication = async ({ username, password }) => {
  const db = await dbinit();
  const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  return new Promise((resolve, reject) =>
    db.all(sql, [], (err, rows) => {
      db.close();
      if (err) {
        return reject(err);
      }
      // no user found
      if (rows.length === 0) {
        return resolve([]);
      }
      return resolve(rows);
    }
    )
  )
};

const signup = async ({ username, password }) => {
  const db = await dbinit();
  // add the user and password to the database
  const sql = `INSERT INTO users (username, password) VALUES ('${username}', '${password}')`;
  try {
    db.run(sql);
    db.close();
    return true;
  }
  catch (err) {
    console.log(err);
    throw err;
  }
};

const dbinit = async () => {
  try {
    const db = await new sqlite3.Database(dbPath);
    const sql = `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      salt TEXT,
      twoFactorSecret TEXT
    )`;
    db.run(sql);
    return db;
  }
  catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = {
  authenticate: authentication,
  signup: signup
};

