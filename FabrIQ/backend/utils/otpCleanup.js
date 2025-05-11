const db = require('../db');

const deleteExpiredOtps = async () => {
  try {
    const now = new Date();
    await db.query('DELETE FROM otp_tokens WHERE expires_at < ?', [now]);
    console.log("Expired OTPs cleaned up at", new Date().toLocaleTimeString());
  } catch (err) {
    console.error("Error cleaning up expired OTPs:", err);
  }
};

module.exports = deleteExpiredOtps;
