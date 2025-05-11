import { useNavigate } from "react-router-dom";
import { logoutUser } from "../utility/logoutUser";
import { useEffect, useRef, useState } from "react";

const Navbar = () => {
	const navigate = useNavigate();
	const [showDropdown, setShowDropdown] = useState(false);
	const [userInitial, setUserInitial] = useState("");

	const dropdownRef = useRef(null);

	useEffect(() => {
		const name = localStorage.getItem("name");
		// const userType = localStorage.getItem("user_type");

		// if (userType !== "business") {
		// 	return;
		// }

		if (name) {
			setUserInitial(name.charAt(0).toUpperCase());
		}
	}, []);

	const handleLogout = async () => {
		const success = await logoutUser();
		if (success) {
			navigate("/auth");
		}
	};

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setShowDropdown(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<nav className="fixed top-0 left-0 w-full h-16 bg-white shadow z-50 flex items-center justify-between px-6">
			<div className="text-xl font-bold text-blue-600">fabrIQ</div>

			<div className="relative" ref={dropdownRef}>
				<button
					onClick={() => setShowDropdown((prev) => !prev)}
					className="w-10 h-10 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center hover:bg-blue-700 transition"
				>
					{userInitial}
				</button>

				{showDropdown && (
					<div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg py-2 z-50">
						<button
							onClick={handleLogout}
							className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
						>
							Logout
						</button>
					</div>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
