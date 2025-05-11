import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import VerifyOtpModal from "../VerifyOtpModal";
import ForgotPasswordModal from "../ForgotPasswordModal";
import ResetPasswordModal from "../ResetPasswordModal";

const Login = () => {
	const [data, setData] = useState({ email: "", password: "" });
	const navigate = useNavigate();

	const [showVerifyOtp, setShowVerifyOtp] = useState(false);
	const [showForgot, setShowForgot] = useState(false);
	const [showReset, setShowReset] = useState(false);
	const [resetEmail, setResetEmail] = useState("");

	const handleChange = ({ currentTarget: input }) => {
		setData({ ...data, [input.name]: input.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const url = "http://localhost:8080/api/auth";
			const { data: res } = await axios.post(url, data);

			localStorage.setItem("access_token", res.access_token);
			localStorage.setItem("refresh_token", res.refresh_token);

			localStorage.setItem("email", res.email);
			localStorage.setItem("user_id", res.user_id);
			localStorage.setItem("name", res.name);

			if (res.user_type === "business" && res.business_id) {
				localStorage.setItem("business_id", res.business_id);
				localStorage.setItem("has_ai_access", res.has_ai_access);
			}

			toast.success(res.message);

			if (res.user_type === "business") {
				navigate("/dashboard");
			} else {
				navigate("/");
			}
		} catch (error) {
			const errMsg = error?.response?.data?.message || "Something went wrong";
			console.error("Login error:", errMsg);

			if (errMsg === "Please verify your email using the OTP sent.") {
				localStorage.setItem("email", data.email);
				setShowVerifyOtp(true);
			}

			toast.error(errMsg);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl grid md:grid-cols-2">
				<div className="p-8">
					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<h1 className="text-3xl font-bold text-gray-800">Login to Your Account</h1>

						<input
							type="email"
							name="email"
							value={data.email}
							onChange={handleChange}
							placeholder="Email"
							className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>

						<input
							type="password"
							name="password"
							value={data.password}
							onChange={handleChange}
							placeholder="Password"
							className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>

						<p onClick={() => setShowForgot(true)} className="text-sm text-blue-500 cursor-pointer hover:underline">
							Forgot Password?
						</p>

						<button type="submit" className="bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition">
							Login
						</button>
					</form>
				</div>

				<div className="bg-blue-600 text-white p-8 flex flex-col justify-center rounded-b-2xl md:rounded-bl-none md:rounded-r-2xl">
					<h2 className="text-2xl font-semibold">New Here?</h2>
					<p className="mt-2 mb-4">Create an account and join the experience!</p>
					<Link to="/signup">
						<button className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-100 transition">
							Sign Up
						</button>
					</Link>
				</div>
			</div>

			<VerifyOtpModal isOpen={showVerifyOtp} onClose={() => setShowVerifyOtp(false)} email={data.email} />

			<ForgotPasswordModal
				isOpen={showForgot}
				onClose={() => setShowForgot(false)}
				onSuccess={(email) => {
					setResetEmail(email);
					setShowForgot(false);
					setShowReset(true);
				}}
			/>

			<ResetPasswordModal
				isOpen={showReset}
				onClose={() => setShowReset(false)}
				email={resetEmail}
			/>

			<ToastContainer position="top-right" autoClose={3000} hideProgressBar />
		</div>
	);
};

export default Login;
