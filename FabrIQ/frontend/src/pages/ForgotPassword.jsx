import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

const ForgotPassword = () => {
	const [email, setEmail] = useState("");
	const [msg, setMsg] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const res = await axios.post("http://localhost:8080/api/users/forgot-password", { email });
			setMsg(res.data.message);
			navigate("/reset-password");
		} catch (err) {
			setError(err.response?.data.message || "Error sending OTP");
		}
	};

	return (
		<div className={styles.otp_container}>
			<form className={styles.form_container} onSubmit={handleSubmit}>
				<h1>Forgot Password</h1>
				<input
					type="email"
					placeholder="Enter your email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className={styles.input}
					required
				/>
				{error && <div className={styles.error_msg}>{error}</div>}
				{msg && <div className={styles.success_msg}>{msg}</div>}
				<button type="submit" className={styles.green_btn}>Send OTP</button>
			</form>
		</div>
	);
};

export default ForgotPassword;
