import React from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <XCircleIcon className="h-10 w-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Cancelled</h1>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No amount was deducted from your account.
        </p>
        
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => navigate('/cart')}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Return to Cart
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

export default PaymentCancel;