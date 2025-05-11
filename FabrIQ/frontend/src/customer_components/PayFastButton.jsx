import React, { useState } from 'react';
import axios from 'axios';

const PayFastButton = ({ orderId, amount }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      // Initiate payment with backend
      const response = await axios.post('http://localhost:8080/api/payments/initiate', {
        orderId
      });

      // Create form dynamically
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = response.data.url;

      // Add all data as hidden inputs
      Object.entries(response.data.data).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      // Submit the form
      document.body.appendChild(form);
      form.submit();
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
    >
      {loading ? 'Processing...' : `Pay R${amount}`}
    </button>
  );
};

export default PayFastButton;