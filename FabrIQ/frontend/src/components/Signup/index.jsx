import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import VerifyOtpModal from "../VerifyOtpModal";

const Signup = () => {
    const [data, setData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        user_type: "customer",
        business_name: "",
        license_image: null,
    });

    const [showVerifyOtp, setShowVerifyOtp] = useState(false);
    const [fileError, setFileError] = useState("");
    const [fileName, setFileName] = useState("");
    const [filePreview, setFilePreview] = useState(null);

    const handleChange = ({ currentTarget: input }) => {
        setData({ ...data, [input.name]: input.value });
        if (input.name === "user_type") {
            setFileError("");
            setFileName("");
            setFilePreview(null);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                setFileError("Please upload an image (JPEG, PNG, GIF) or PDF file");
                setFileName("");
                setFilePreview(null);
                return;
            }
            
            // Validate file size (e.g., 5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setFileError("File size should be less than 5MB");
                setFileName("");
                setFilePreview(null);
                return;
            }
            
            setFileError("");
            setFileName(file.name);
            setData({ ...data, license_image: file });
            
            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                    setFilePreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setFilePreview(null);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (data.user_type === "business") {
            if (!data.business_name) {
                toast.error("Business name is required");
                return;
            }
            if (!data.license_image) {
                toast.error("License document is required for business accounts");
                return;
            }
        }

        try {
            const formData = new FormData();
            formData.append("first_name", data.first_name);
            formData.append("last_name", data.last_name);
            formData.append("email", data.email);
            formData.append("password", data.password);
            formData.append("user_type", data.user_type);

            if (data.user_type === "business") {
                formData.append("business_name", data.business_name);
                formData.append("license_image", data.license_image);
            }

            const { data: res } = await axios.post("http://localhost:8080/api/users", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success(res.message);
            localStorage.setItem("email", data.email);
            setShowVerifyOtp(true);
        } catch (error) {
            const msg = error?.response?.data?.message || "Something went wrong";
            toast.error(msg);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl grid md:grid-cols-2 overflow-hidden">
                {/* Left Panel */}
                <div className="bg-blue-600 text-white p-8 flex flex-col justify-center">
                    <h2 className="text-2xl font-semibold">Already have an account?</h2>
                    <p className="mt-2 mb-4">Login to access your dashboard.</p>
                    <Link to="/login">
                        <button className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-100 transition">
                            Login
                        </button>
                    </Link>
                </div>

                {/* Signup Form */}
                <div className="p-8">
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>

                        <select 
                            name="user_type" 
                            value={data.user_type} 
                            onChange={handleChange}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="customer">Customer</option>
                            <option value="business">Business</option>
                        </select>

                        <input 
                            type="text" 
                            placeholder="First Name" 
                            name="first_name" 
                            value={data.first_name}
                            onChange={handleChange} 
                            required
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />

                        <input 
                            type="text" 
                            placeholder="Last Name" 
                            name="last_name" 
                            value={data.last_name}
                            onChange={handleChange} 
                            required
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />

                        <input 
                            type="email" 
                            placeholder="Email" 
                            name="email" 
                            value={data.email}
                            onChange={handleChange} 
                            required
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />

                        <input 
                            type="password" 
                            placeholder="Password" 
                            name="password" 
                            value={data.password}
                            onChange={handleChange} 
                            required
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />

                        {data.user_type === "business" && (
                            <>
                                <input 
                                    type="text" 
                                    placeholder="Business Name" 
                                    name="business_name"
                                    value={data.business_name} 
                                    onChange={handleChange} 
                                    required
                                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Business License Document *
                                    </label>
                                    <div className="flex flex-col gap-2">
                                        <label className="cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-md border border-blue-200 transition w-fit">
                                            Choose File
                                            <input 
                                                type="file" 
                                                name="license_image" 
                                                accept="image/*,.pdf" 
                                                onChange={handleFileChange} 
                                                required={data.user_type === "business"}
                                                className="hidden"
                                            />
                                        </label>
                                        {fileName && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600">
                                                    {fileName}
                                                </span>
                                            </div>
                                        )}
                                        {filePreview && data.license_image?.type.startsWith('image/') && (
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500 mb-1">Preview:</p>
                                                <img 
                                                    src={filePreview} 
                                                    alt="License preview" 
                                                    className="max-w-[200px] max-h-[200px] border rounded-md"
                                                />
                                            </div>
                                        )}
                                        {fileName && data.license_image?.type === 'application/pdf' && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-sm">PDF Document</span>
                                            </div>
                                        )}
                                    </div>
                                    {fileError && (
                                        <p className="text-sm text-red-600">{fileError}</p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        Upload your business license (JPEG, PNG, GIF, or PDF, max 5MB)
                                    </p>
                                </div>
                            </>
                        )}

                        <button 
                            type="submit"
                            className="bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition mt-4"
                        >
                            Sign Up
                        </button>
                    </form>
                </div>
            </div>

            <VerifyOtpModal isOpen={showVerifyOtp} onClose={() => setShowVerifyOtp(false)} email={data.email} />
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </div>
    );
};

export default Signup;