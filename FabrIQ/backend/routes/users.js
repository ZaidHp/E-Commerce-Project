const router = require("express").Router();
const pool = require("../db");
const { validateUser } = require("../models/user");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const multer = require("multer");
const path = require("path");

const generateOTP = () => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};


const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/licenses");
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname);
		const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
		cb(null, uniqueName);
	},
});

const upload = multer({ storage });




router.post("/", upload.single("license_image"), async (req, res) => {
	try {
		const { first_name, last_name, email, password, user_type, business_name } = req.body;
		const license_image_url = req.file ? `/uploads/licenses/${req.file.filename}` : null;

		const { error } = validateUser({ ...req.body, license_image_url });
		if (error) return res.status(400).send({ message: error.details[0].message });

		const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
		if (existingUser.length)
			return res.status(409).send({ message: "User with given email already exists!" });

		const salt = await bcrypt.genSalt(Number(process.env.SALT));
		const hashedPassword = await bcrypt.hash(password, salt);

		const [result] = await pool.query(
			"INSERT INTO users (first_name, last_name, email, password, user_type, verified) VALUES (?, ?, ?, ?, ?, ?)",
			[first_name, last_name, email, hashedPassword, user_type, false]
		);

		const userId = result.insertId;

		if (user_type === "business") {
			if (!business_name || !license_image_url) {
				return res.status(400).send({ message: "Missing business details." });
			}

			await pool.query(
				"INSERT INTO businesses (user_id, business_name, license_image_url) VALUES (?, ?, ?)",
				[userId, business_name, license_image_url]
			);
		}

		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
		await pool.query("INSERT INTO otp_tokens (user_id, otp, expires_at) VALUES (?, ?, ?)", [userId, otp, expiresAt]);
		await sendEmail(email, "Verify your email", `Your OTP is: ${otp}`);

		res.status(201).send({ message: "OTP sent to your email for verification." });
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: "Internal Server Error" });
	}
});


router.post("/verify", async (req, res) => {
    const { email, otp } = req.body;

    try {
        const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (!users.length) return res.status(400).send({ message: "Invalid email" });

        const user = users[0];

        const [otps] = await pool.query("SELECT * FROM otp_tokens WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", [user.user_id]);
        if (!otps.length || String(otps[0].otp) !== String(otp)){
            return res.status(400).send({ message: "Invalid or expired OTP" });
        }

		if (new Date(otp.expires_at) < new Date()) {
			await db.query("DELETE FROM otp_tokens WHERE user_id = ?", [user.user_id]);
			return res.status(400).json({ message: 'OTP expired' });
		  }

        await pool.query("UPDATE users SET verified = true WHERE user_id = ?", [user.user_id]);
        await pool.query("DELETE FROM otp_tokens WHERE user_id = ?", [user.user_id]);

        res.status(200).send({ message: "Email verified successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

router.post("/resend-otp", async (req, res) => {
	const { email } = req.body;
  
	const [user] = await pool.execute("SELECT user_id FROM users WHERE email = ?", [email]);
	if (!user.length) return res.status(400).send({ message: "User not found" });
  
	const otp = generateOTP();
	const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
	await pool.execute("INSERT INTO otp_tokens (user_id, otp, expires_at) VALUES (?, ?, ?)", [user.user_id, otp, expiresAt]);
	await sendEmail(email, "Your new OTP", `Your new OTP is ${otp}`);
  
	res.send({ message: "OTP resent successfully" });
  });

router.post("/forgot-password", async (req, res) => {
	const { email } = req.body;
	const [user] = await pool.execute("SELECT user_id FROM users WHERE email = ?", [email]);
	if (!user.length) return res.status(400).send({ message: "User not found" });
  
	const otp = generateOTP();
	const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
	await pool.execute("INSERT INTO otp_tokens (user_id, otp, expires_at) VALUES (?, ?, ?)", [user[0].user_id, otp, expiresAt]);
	await sendEmail(email, "Reset Password OTP", `Your OTP to reset password is ${otp}`);
  
	res.send({ message: "OTP sent to your email" });
  });
  
router.post("/reset-password", async (req, res) => {
	const { email, otp, password } = req.body;
	const [user] = await pool.execute("SELECT user_id FROM users WHERE email = ?", [email]);
	if (!user.length) return res.status(400).send({ message: "User not found" });
  
	const [otpRecord] = await pool.execute(
	  "SELECT * FROM otp_tokens WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
	  [user[0].user_id]
	);
	if (!otpRecord.length || String(otpRecord[0].otp) !== String(otp))
	  return res.status(400).send({ message: "Invalid or expired OTP" });
	
	if (new Date(otp.expires_at) < new Date()) {
		await db.query("DELETE FROM otp_tokens WHERE user_id = ?", [user.user_id]);
		return res.status(400).json({ message: 'OTP expired' });
	  }

	const hashedPassword = await bcrypt.hash(password, 10);
	await pool.execute("UPDATE users SET password = ? WHERE user_id = ?", [hashedPassword, user[0].user_id]);
	await pool.execute("DELETE FROM otp_tokens WHERE user_id = ?", [user[0].user_id]);
  
	res.send({ message: "Password reset successful" });
  });
  

module.exports = router;
