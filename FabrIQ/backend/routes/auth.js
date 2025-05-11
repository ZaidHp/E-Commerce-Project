const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const { generateAuthToken, generateRefreshToken } = require("../models/user");
const Joi = require("joi");

const validate = (data) => {
	const schema = Joi.object({
		email: Joi.string().email().required().label("Email"),
		password: Joi.string().required().label("Password"),
	});
	return schema.validate(data);
};

router.post("/", async (req, res) => {
	try {
		const { error } = validate(req.body);
		if (error) return res.status(400).send({ message: error.details[0].message });

		const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [req.body.email]);
		if (!users.length)
			return res.status(401).send({ message: "Invalid Email or Password" });

		const user = users[0];
		const validPassword = await bcrypt.compare(req.body.password, user.password);
		if (!validPassword)
			return res.status(401).send({ message: "Invalid Email or Password" });

		if (!user.verified)
			return res.status(400).send({ message: "Please verify your email using the OTP sent." });

		const accessToken = generateAuthToken(user.user_id);
		const refreshToken = await generateRefreshToken(user.user_id);

		await pool.query(
			"INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))",
			[user.user_id, refreshToken]
		);

		let responseData = {
			access_token: accessToken,
			refresh_token: refreshToken,
			user_type: user.user_type,
			email: user.email,
			user_id: user.user_id,
			name: user.first_name,
			message: "Logged in successfully",
		};

		if (user.user_type === "business") {
			const [businessRows] = await pool.query(
				"SELECT business_id, has_ai_access FROM businesses WHERE user_id = ?",
				[user.user_id]
			);
		
			console.log(businessRows);
			if (businessRows.length > 0) {
    			responseData.business_id = businessRows[0].business_id;
    			responseData.has_ai_access = businessRows[0].has_ai_access === 1;
				}
		}

		res.status(200).send(responseData);
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: "Internal Server Error" });
	}
});


router.post("/logout", async (req, res) => {
	try {
		const { refreshToken } = req.body;
		if (!refreshToken) return res.status(400).json({ message: "No token provided" });

		await pool.query("DELETE FROM refresh_tokens WHERE token = ?", [refreshToken]);

		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.error("Logout error:", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
});

module.exports = router;
