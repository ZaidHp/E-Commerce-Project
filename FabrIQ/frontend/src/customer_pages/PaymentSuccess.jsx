import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('m_payment_id');

  useEffect(() => {
    // You might want to verify payment status with your backend here
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircleIcon className="h-10 w-10 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order #{orderId}. Your payment was processed successfully.
        </p>
        
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => navigate('/account/order')}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            View Order Details
          </button>
          <button
            onClick={() => navigate('/product')}
            className="w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors shadow-sm"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;