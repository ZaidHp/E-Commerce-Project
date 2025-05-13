const db = require("../db");

async function createToken(user_id, token) {
  const query = "INSERT INTO tokens (user_id, token) VALUES (?, ?)";
  await db.query(query, [user_id, token]);
}

async function findTokenByUserId(user_id) {
  const [rows] = await db.query("SELECT * FROM tokens WHERE user_id = ?", [user_id]);
  return rows[0];
}

async function deleteToken(user_id) {
  await db.query("DELETE FROM tokens WHERE userId = ?", [user_id]);
}

module.exports = { createToken, findTokenByUserId, deleteToken };
