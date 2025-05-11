import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ModalWrapper from "./ModalWrapper";

const ForgotPasswordModal = ({ isOpen, onClose, onSuccess }) => {
	const [email, setEmail] = useState("");
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const res = await axios.post("http://localhost:8080/api/users/forgot-password", { email });
			toast.success(res.data.message || "OTP Sent Successfully!");
			onSuccess(email);
		} catch (err) {
			toast.error(err.response?.data.message || "Error sending OTP");
		}
	};

	return (
		<ModalWrapper isOpen={isOpen} onClose={onClose}>
			<form className="space-y-4" onSubmit={handleSubmit}>
				<h1 className="text-2xl font-bold text-gray-800">Forgot Password</h1>
				<input
					type="email"
					placeholder="Enter your email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					required
				/>
				<button
					type="submit"
					className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
				>
					Send OTP
				</button>
			</form>
		</ModalWrapper>
	);
};

export default ForgotPasswordModal;
