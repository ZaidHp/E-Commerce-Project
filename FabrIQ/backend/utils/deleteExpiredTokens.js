const db = require('../db');

const deleteExpiredTokens = async () => {
  try {
    const now = new Date();
    await db.query('DELETE FROM refresh_tokens WHERE expires_at < ?', [now]);
    console.log("Expired Refresh Tokens cleaned up at", new Date().toLocaleTimeString());
  } catch (err) {
    console.error("Error cleaning up expired refresh tokens:", err);
  }
};

module.exports = deleteExpiredTokens;