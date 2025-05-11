import axios from "axios";

export const logoutUser = async () => {
	try {
		const refreshToken = localStorage.getItem("refresh_token");
		await axios.post("http://localhost:8080/api/auth/logout", { refreshToken });

        localStorage.clear();
		
		return true;
	} catch (error) {
		console.error("Logout failed:", error);
		return false;
	}
};
