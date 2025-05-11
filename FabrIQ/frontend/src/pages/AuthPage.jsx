// import { useState } from "react";
// import axios from "axios";
// import { Link, useNavigate } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import 'react-toastify/dist/ReactToastify.css';
// import VerifyOtpModal from "../components/VerifyOtpModal";
// import PasswordResetModal from "../components/PasswordResetModal";

// import fashionImage from '../assets/fashion-auth.jpg';

// const AuthPage = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [data, setData] = useState({
//     first_name: "",
//     last_name: "",
//     email: "",
//     password: "",
//     user_type: "customer",
//     business_name: "",
//     license_image: null,
//   });
//   const navigate = useNavigate();

//   const [showVerifyOtp, setShowVerifyOtp] = useState(false);
//   const [showPasswordReset, setShowPasswordReset] = useState(false);
  
//   const [fileError, setFileError] = useState("");
//   const [fileName, setFileName] = useState("");
//   const [filePreview, setFilePreview] = useState(null);

//   const handleChange = ({ currentTarget: input }) => {
//     setData({ ...data, [input.name]: input.value });
//     if (input.name === "user_type") {
//       setFileError("");
//       setFileName("");
//       setFilePreview(null);
//     }
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
//       if (!validTypes.includes(file.type)) {
//         setFileError("Please upload an image (JPEG, PNG, GIF) or PDF file");
//         setFileName("");
//         setFilePreview(null);
//         return;
//       }
      
//       if (file.size > 5 * 1024 * 1024) {
//         setFileError("File size should be less than 5MB");
//         setFileName("");
//         setFilePreview(null);
//         return;
//       }
      
//       setFileError("");
//       setFileName(file.name);
//       setData({ ...data, license_image: file });
      
//       if (file.type.startsWith('image/')) {
//         const reader = new FileReader();
//         reader.onload = () => {
//           setFilePreview(reader.result);
//         };
//         reader.readAsDataURL(file);
//       } else {
//         setFilePreview(null);
//       }
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     try {
//       const url = "http://localhost:8080/api/auth";
//       const { data: res } = await axios.post(url, {
//         email: data.email,
//         password: data.password
//       });

//       localStorage.setItem("access_token", res.access_token);
//       localStorage.setItem("refresh_token", res.refresh_token);
//       localStorage.setItem("email", res.email);
//       localStorage.setItem("user_id", res.user_id);
//       localStorage.setItem("name", res.name);

//       if (res.user_type === "business" && res.business_id) {
//         localStorage.setItem("business_id", res.business_id);
//         localStorage.setItem("has_ai_access", res.has_ai_access);
//       }

//       toast.success(res.message);

//       if (res.user_type === "business") {
//         navigate("/dashboard");
//       } else {
//         navigate("/");
//       }
//     } catch (error) {
//       const errMsg = error?.response?.data?.message || "Something went wrong";
//       console.error("Login error:", errMsg);

//       if (errMsg === "Please verify your email using the OTP sent.") {
//         localStorage.setItem("email", data.email);
//         setShowVerifyOtp(true);
//       }

//       toast.error(errMsg);
//     }
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();

//     if (data.user_type === "business") {
//       if (!data.business_name) {
//         toast.error("Business name is required");
//         return;
//       }
//       if (!data.license_image) {
//         toast.error("License document is required for business accounts");
//         return;
//       }
//     }

//     try {
//       const formData = new FormData();
//       formData.append("first_name", data.first_name);
//       formData.append("last_name", data.last_name);
//       formData.append("email", data.email);
//       formData.append("password", data.password);
//       formData.append("user_type", data.user_type);

//       if (data.user_type === "business") {
//         formData.append("business_name", data.business_name);
//         formData.append("license_image", data.license_image);
//       }

//       const { data: res } = await axios.post("http://localhost:8080/api/users", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       toast.success(res.message);
//       localStorage.setItem("email", data.email);
//       setShowVerifyOtp(true);
//     } catch (error) {
//       const msg = error?.response?.data?.message || "Something went wrong";
//       toast.error(msg);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
//       <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden">
//         <div className="grid md:grid-cols-2">
//           {/* Brand Side */}
//           <div className="relative bg-indigo-600 p-10 text-white flex flex-col justify-center">
//             <div className="absolute inset-0 bg-indigo-900/70">
//               <img 
//                 src={fashionImage} 
//                 alt="Fashion model" 
//                 className="w-full h-full object-cover"
//               />
//             </div>
            
//             <div className="relative z-10 text-center">
//               <h1 className="text-4xl font-bold mb-2">fabrIQ</h1>
//               <p className="text-xl mb-6 font-light">Craft Your Signature Style</p>
              
//               <div className="flex justify-center mb-8">
//                 <div className="w-24 h-1 bg-white/50 rounded-full"></div>
//               </div>
              
//               <p className="text-sm opacity-90 max-w-md mx-auto">
//                 {isLogin 
//                   ? "Welcome back to your personalized fashion journey with fabrIQ." 
//                   : "Join fabrIQ to discover curated fashion that tells your unique story. "}
//               </p>

//               <div className="mt-10 flex justify-center space-x-4">
//                 <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center">
//                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
//                   </svg>
//                 </button>
//                 <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center">
//                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
//                   </svg>
//                 </button>
//                 <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center">
//                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
//                   </svg>
//                 </button>
//               </div>

//             </div>
//           </div>

//           {/* Form Side */}
//           <div className="p-10">
//             <div className="flex justify-between items-center mb-8">
//               <h2 className="text-2xl font-bold text-gray-800">
//                 {isLogin ? "Welcome Back" : "Join fabrIQ"}
//               </h2>
//             </div>

//             {isLogin ? (
//               <form onSubmit={handleLogin} className="space-y-5">
//                 <div>
//                   <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                     Email
//                   </label>
//                   <input
//                     type="email"
//                     id="email"
//                     name="email"
//                     value={data.email}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <div className="flex justify-between items-center mb-1">
//                     <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                       Password
//                     </label>
//                     <button
//                       type="button"
//                       onClick={() => setShowPasswordReset(true)}
//                       className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
//                     >
//                       Forgot password?
//                     </button>
//                   </div>
//                   <input
//                     type="password"
//                     id="password"
//                     name="password"
//                     value={data.password}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
//                     required
//                   />
//                 </div>

//                 <button
//                   type="submit"
//                   className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md"
//                 >
//                   Login
//                 </button>

//                 <div className="flex items-center my-4">
//                   <div className="flex-grow border-t border-gray-300"></div>
//                   <span className="mx-4 text-sm text-gray-500">or</span>
//                   <div className="flex-grow border-t border-gray-300"></div>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() => setIsLogin(!isLogin)}
//                   className="w-full bg-white text-indigo-600 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-md border border-gray-200"
//                 >
//                   Create New Account
//                 </button>
//               </form>
//             ) : (
//               <form onSubmit={handleSignup} className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
//                       First Name
//                     </label>
//                     <input
//                       type="text"
//                       id="first_name"
//                       name="first_name"
//                       value={data.first_name}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
//                       Last Name
//                     </label>
//                     <input
//                       type="text"
//                       id="last_name"
//                       name="last_name"
//                       value={data.last_name}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                     Email
//                   </label>
//                   <input
//                     type="email"
//                     id="email"
//                     name="email"
//                     value={data.email}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//                     Password
//                   </label>
//                   <input
//                     type="password"
//                     id="password"
//                     name="password"
//                     value={data.password}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="user_type" className="block text-sm font-medium text-gray-700 mb-1">
//                     Account Type
//                   </label>
//                   <select
//                     id="user_type"
//                     name="user_type"
//                     value={data.user_type}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
//                   >
//                     <option value="customer">Customer</option>
//                     <option value="business">Business</option>
//                   </select>
//                 </div>

//                 {data.user_type === "business" && (
//                   <>
//                     <div>
//                       <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-1">
//                         Business Name
//                       </label>
//                       <input
//                         type="text"
//                         id="business_name"
//                         name="business_name"
//                         value={data.business_name}
//                         onChange={handleChange}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Business License
//                       </label>
//                       <div className="flex flex-col gap-2">
//                         <label className="cursor-pointer bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-lg border border-indigo-200 transition w-fit text-sm">
//                           Upload License
//                           <input
//                             type="file"
//                             name="license_image"
//                             accept="image/*,.pdf"
//                             onChange={handleFileChange}
//                             required
//                             className="hidden"
//                           />
//                         </label>
//                         {fileName && (
//                           <div className="flex items-center gap-2 text-sm text-gray-600">
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                             </svg>
//                             {fileName}
//                           </div>
//                         )}
//                         {filePreview && data.license_image?.type.startsWith('image/') && (
//                           <div className="mt-2">
//                             <img 
//                               src={filePreview} 
//                               alt="License preview" 
//                               className="max-w-[150px] max-h-[150px] border rounded-md"
//                             />
//                           </div>
//                         )}
//                         {fileError && (
//                           <p className="text-sm text-red-600">{fileError}</p>
//                         )}
//                         <p className="text-xs text-gray-500">
//                           Upload your business license (JPEG, PNG, GIF, or PDF, max 5MB)
//                         </p>
//                       </div>
//                     </div>
//                   </>
//                 )}

//                 <button
//                   type="submit"
//                   className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md mt-4"
//                 >
//                   Create Account
//                 </button>

//                 <button
//                   onClick={() => setIsLogin(!isLogin)}
//                   className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
//                 >
//                   Already have an account?
//                 </button>

//                 <p className="text-xs text-gray-500 mt-4">
//                   By creating an account, you agree to our <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>.
//                 </p>
//               </form>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Modals */}
//       <VerifyOtpModal 
//         isOpen={showVerifyOtp}
//         onClose={() => {
//           setShowVerifyOtp(false);
//           if (!isLogin) {
//             setIsLogin(true); // Switch to login view after successful verification
//           }
//         }}
//         email={data.email}
//       />
      
//       <PasswordResetModal 
//         isOpen={showPasswordReset} 
//         onClose={() => setShowPasswordReset(false)} 
//       />

//       <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
//     </div>
//   );
// };

// export default AuthPage;

import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import VerifyOtpModal from "../components/VerifyOtpModal";
import PasswordResetModal from "../components/PasswordResetModal";

import fashionImage from '../assets/fashion-auth.jpg';

const AuthPage = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [data, setData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    user_type: "customer",
    business_name: "",
    license_image: null,
  });
  const navigate = useNavigate();

  const [showVerifyOtp, setShowVerifyOtp] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  
  const [fileError, setFileError] = useState("");
  const [fileName, setFileName] = useState("");
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => {
    // Check if the current path is /auth/signup
    if (location.pathname === '/auth/signup') {
      setIsLogin(false);
    }
  }, [location.pathname]);

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
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setFileError("Please upload an image (JPEG, PNG, GIF) or PDF file");
        setFileName("");
        setFilePreview(null);
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setFileError("File size should be less than 5MB");
        setFileName("");
        setFilePreview(null);
        return;
      }
      
      setFileError("");
      setFileName(file.name);
      setData({ ...data, license_image: file });
      
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

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const url = "http://localhost:8080/api/auth";
      const { data: res } = await axios.post(url, {
        email: data.email,
        password: data.password
      });

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

  const handleSignup = async (e) => {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Brand Side */}
          <div className="relative bg-indigo-600 p-10 text-white flex flex-col justify-center">
            <div className="absolute inset-0 bg-indigo-900/70">
              <img 
                src={fashionImage} 
                alt="Fashion model" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="relative z-10 text-center">
              <h1 className="text-4xl font-bold mb-2">fabrIQ</h1>
              <p className="text-xl mb-6 font-light">Craft Your Signature Style</p>
              
              <div className="flex justify-center mb-8">
                <div className="w-24 h-1 bg-white/50 rounded-full"></div>
              </div>
              
              <p className="text-sm opacity-90 max-w-md mx-auto">
                {isLogin 
                  ? "Welcome back to your personalized fashion journey with fabrIQ." 
                  : "Join fabrIQ to discover curated fashion that tells your unique story. "}
              </p>

              <div className="mt-10 flex justify-center space-x-4">
                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </button>
                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
                  </svg>
                </button>
                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </button>
              </div>

            </div>
          </div>

          {/* Form Side */}
          <div className="p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                {isLogin ? "Welcome Back" : "Join fabrIQ"}
              </h2>
            </div>

            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={data.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPasswordReset(true)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={data.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md"
                >
                  Login
                </button>

                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="mx-4 text-sm text-gray-500">or</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="w-full bg-white text-indigo-600 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-md border border-gray-200"
                >
                  Create New Account
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={data.first_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={data.last_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={data.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={data.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="user_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <select
                    id="user_type"
                    name="user_type"
                    value={data.user_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  >
                    <option value="customer">Customer</option>
                    <option value="business">Business</option>
                  </select>
                </div>

                {data.user_type === "business" && (
                  <>
                    <div>
                      <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Business Name
                      </label>
                      <input
                        type="text"
                        id="business_name"
                        name="business_name"
                        value={data.business_name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business License
                      </label>
                      <div className="flex flex-col gap-2">
                        <label className="cursor-pointer bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-lg border border-indigo-200 transition w-fit text-sm">
                          Upload License
                          <input
                            type="file"
                            name="license_image"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            required
                            className="hidden"
                          />
                        </label>
                        {fileName && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {fileName}
                          </div>
                        )}
                        {filePreview && data.license_image?.type.startsWith('image/') && (
                          <div className="mt-2">
                            <img 
                              src={filePreview} 
                              alt="License preview" 
                              className="max-w-[150px] max-h-[150px] border rounded-md"
                            />
                          </div>
                        )}
                        {fileError && (
                          <p className="text-sm text-red-600">{fileError}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Upload your business license (JPEG, PNG, GIF, or PDF, max 5MB)
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md mt-4"
                >
                  Create Account
                </button>

                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  Already have an account?
                </button>

                <p className="text-xs text-gray-500 mt-4">
                  By creating an account, you agree to our <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <VerifyOtpModal 
        isOpen={showVerifyOtp}
        onClose={() => {
          setShowVerifyOtp(false);
          if (!isLogin) {
            setIsLogin(true); // Switch to login view after successful verification
          }
        }}
        email={data.email}
      />
      
      <PasswordResetModal 
        isOpen={showPasswordReset} 
        onClose={() => setShowPasswordReset(false)} 
      />

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default AuthPage;