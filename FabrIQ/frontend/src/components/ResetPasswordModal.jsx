import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ModalWrapper from "./ModalWrapper";

const ResetPasswordModal = ({ isOpen, onClose, email }) => {
	const [otp, setOtp] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const res = await axios.post("http://localhost:8080/api/users/reset-password", {
				email,
				otp,
				password,
			});
			toast.success(res.data.message || "Password Reset Successful!");
			setTimeout(() => onClose(), 1500);
		} catch (err) {
			toast.error(err.response?.data.message || "Password Reset Failed");
		}
	};

	return (
		<ModalWrapper isOpen={isOpen} onClose={onClose}>
			<form className="space-y-4" onSubmit={handleSubmit}>
				<h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
				<input
					type="text"
					placeholder="OTP"
					value={otp}
					onChange={(e) => setOtp(e.target.value)}
					className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					required
				/>
				<input
					type="password"
					placeholder="New Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					required
				/>
				<button
					type="submit"
					className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
				>
					Reset Password
				</button>
			</form>
		</ModalWrapper>
	);
};

export default ResetPasswordModal;

