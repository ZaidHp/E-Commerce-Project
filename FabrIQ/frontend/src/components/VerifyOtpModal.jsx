import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ModalWrapper from "./ModalWrapper";

const VerifyOtpModal = ({ isOpen, onClose, email }) => {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [resending, setResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    let interval;
    if (isOpen && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const res = await axios.post("http://localhost:8080/api/users/verify", {
        email,
        otp,
      });
      toast.success(res.data.message || "OTP Verified Successfully!");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data.message || "Invalid OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await axios.post("http://localhost:8080/api/users/resend-otp", { email });
      setTimer(30);
      toast.success(res.data?.message || "OTP Resent Successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="p-6 max-w-md mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Verify Your Email</h2>
          <p className="text-gray-500 mt-2">
            We've sent a 6-digit code to <span className="font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
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
          </div>

          <button
            type="submit"
            disabled={isVerifying || otp.length !== 6}
            className={`w-full bg-indigo-600 text-white py-3 rounded-lg font-medium transition-colors shadow-md ${
              isVerifying || otp.length !== 6 ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
            }`}
          >
            {isVerifying ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify Account'
            )}
          </button>

          <div className="text-center mt-4">
            {timer > 0 ? (
              <p className="text-sm text-gray-500">
                Didn't receive code? Resend in <span className="font-medium text-indigo-600">{timer}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className={`text-sm text-indigo-600 hover:text-indigo-800 font-medium ${
                  resending ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <button
            onClick={onClose}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Back to login
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default VerifyOtpModal;