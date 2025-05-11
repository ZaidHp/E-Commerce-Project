import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

const ResetPassword = () => {
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [password, setPassword] = useState("");
	const [msg, setMsg] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const res = await axios.post("http://localhost:8080/api/users/reset-password", {
				email,
				otp,
				password,
			});
			setMsg(res.data.message);
			setTimeout(() => navigate("/login"), 1500);
		} catch (err) {
			setError(err.response?.data.message || "Failed to reset password");
		}
	};

	return (
		<div className={styles.otp_container}>
			<form className={styles.form_container} onSubmit={handleSubmit}>
				<h1>Reset Password</h1>
				<input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={styles.input} required />
				<input type="text" placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className={styles.input} required />
				<input type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.input} required />
				{error && <div className={styles.error_msg}>{error}</div>}
				{msg && <div className={styles.success_msg}>{msg}</div>}
				<button type="submit" className={styles.green_btn}>Reset Password</button>
			</form>
		</div>
	);
};

export default ResetPassword;
