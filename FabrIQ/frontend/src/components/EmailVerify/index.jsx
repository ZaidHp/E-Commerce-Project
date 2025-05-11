import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./styles.module.css";

const EmailVerify = () => {
	const [otp, setOtp] = useState("");
	const [msg, setMsg] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const email = localStorage.getItem("email");

	const handleVerify = async (e) => {
		e.preventDefault();
		try {
			const res = await axios.post("http://localhost:8080/api/users/verify", {
				email,
				otp,
			});
			setMsg(res.data.message);
			localStorage.removeItem("email");
			setTimeout(() => navigate("/login"), 1500);
		} catch (err) {
			setError(err.response?.data.message || "Invalid OTP");
		}
	};

	const handleResend = async () => {
		try {
			const res = await axios.post("http://localhost:8080/api/users/resend-otp", {
				email,
			});
			setMsg(res.data.message);
		} catch (err) {
			setError(err.response?.data.message || "Failed to resend OTP");
		}
	};

	return (
		<div className={styles.otp_container}>
			<form className={styles.form_container} onSubmit={handleVerify}>
				<h1>Enter OTP</h1>
				<input
					type="text"
					placeholder="Enter 6-digit OTP"
					value={otp}
					onChange={(e) => setOtp(e.target.value)}
					className={styles.input}
					required
				/>
				{error && <div className={styles.error_msg}>{error}</div>}
				{msg && <div className={styles.success_msg}>{msg}</div>}
				<button type="submit" className={styles.green_btn}>Verify</button>
				<button type="button" className={styles.white_btn} onClick={handleResend}>
					Resend OTP
				</button>
			</form>
		</div>
	);
};
export default EmailVerify;