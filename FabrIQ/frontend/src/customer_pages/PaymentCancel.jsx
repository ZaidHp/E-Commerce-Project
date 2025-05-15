import React, { useEffect, useState } from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentCancel = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Default to false since we might not need to load
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  // Only update payment status if needed (change from 'completed' to 'cancelled')
  useEffect(() => {
    const updatePaymentStatus = async () => {
      try {
        setLoading(true);
        const response = await axios.put(
          `http://localhost:8080/api/notify/update/${orderId}`, // Changed from /notify/ to /payments/
          {
            paymentStatus: 'failed' // Changed from 'completed' to 'cancelled'
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        );

        if (response.data.success) {
          setOrderDetails(response.data);
        } else {
          setError(response.data.message || 'Failed to update payment status');
        }
      } catch (err) {
        console.error('Payment update error:', err);
        setError(err.response?.data?.error || 'Failed to update payment status');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      updatePaymentStatus();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-pulse">
            <div className="mx-auto w-20 h-20 bg-gray-200 rounded-full mb-6"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Updating Payment Status...</h1>
            <p className="text-gray-600 mb-6">Please wait while we process your request</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <XCircleIcon className="h-10 w-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {error ? 'Payment Update Failed' : 'Payment Cancelled'}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {error || 'Your payment was cancelled. No amount was deducted from your account.'}
          {orderDetails?.paymentId && (
            <span className="block mt-2 text-sm">Order ID: {orderId}</span>
          )}
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