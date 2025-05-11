import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ModalWrapper from "./ModalWrapper";

const PasswordResetModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1); // 1: email, 2: OTP and password
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [resending, setResending] = useState(false);

  // Timer for OTP resend
  useEffect(() => {
    let interval;
    if (isOpen && step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, step, timer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:8080/api/users/forgot-password", { email });
      toast.success(res.data.message || "OTP sent to your email");
      setStep(2);
      setTimer(30); // Reset timer when OTP is sent
    } catch (err) {
      toast.error(err.response?.data.message || "Error sending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      const res = await axios.post("http://localhost:8080/api/users/forgot-password", { email });
      setTimer(30);
      toast.success(res.data.message || "New OTP sent to your email");
    } catch (err) {
      toast.error(err.response?.data.message || "Error resending OTP");
    } finally {
      setResending(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:8080/api/users/reset-password", {
        email,
        otp,
        password,
      });
      toast.success(res.data.message || "Password reset successful!");
      setTimeout(() => {
        onClose();
        // Reset form
        setStep(1);
        setEmail("");
        setOtp("");
        setPassword("");
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data.message || "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={() => {
      onClose();
      // Reset form when closing
      setStep(1);
      setEmail("");
      setOtp("");
      setPassword("");
      setTimer(30);
    }}>
      <div className="max-w-md mx-auto p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {step === 1 ? "Reset Your Password" : "Create New Password"}
          </h2>
          <p className="text-gray-500 mt-2">
            {step === 1 
              ? "Enter your email to receive a verification code"
              : `Enter the OTP sent to ${email} and your new password`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Verification Code'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="otp"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setOtp(value.slice(0, 6));
                  }}
                  className="w-full px-4 py-3 text-center text-xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  required
                  autoFocus
                />
                {timer > 0 ? (
                  <p className="absolute -bottom-5 right-0 text-xs text-gray-500">
                    Resend in {timer}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="absolute -bottom-5 right-0 text-xs text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                  >
                    {resending ? 'Sending...' : 'Resend Code'}
                  </button>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className={`w-full bg-indigo-600 text-white py-3 rounded-lg font-medium transition-colors shadow-md ${
                isLoading || otp.length !== 6 ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-indigo-600 hover:text-indigo-800 text-center w-full mt-2"
            >
              Back to email entry
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          Remember your password?{" "}
          <button
            onClick={onClose}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Sign in
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default PasswordResetModal;