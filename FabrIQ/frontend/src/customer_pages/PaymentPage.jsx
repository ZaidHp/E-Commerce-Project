// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { ChevronLeft } from 'lucide-react';

// const PaymentPage = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { orderId, amount } = location.state || {};
//   const [selectedMethod, setSelectedMethod] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);

//    useEffect(() => {
//     if (!orderId || !amount) {
//       navigate('/');
//     }
//   }, [orderId, amount, navigate]);

//   if (!orderId || !amount) {
//     return null; // Return null while redirecting
//   }

//   const handlePaymentMethodSelect = (method) => {
//     setSelectedMethod(method);
//   };

//   const handlePaymentSubmit = async () => {
//     if (!selectedMethod) {
//       toast.error('Please select a payment method');
//       return;
//     }

//     setIsProcessing(true);

//     try {
//       if (selectedMethod === 'cod') {
//         // Handle Cash on Delivery
//         const token = localStorage.getItem('access_token');
//         const response = await fetch('http://localhost:8080/api/payments', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//           },
//           body: JSON.stringify({
//             order_id: orderId,
//             payment_method: 'cod',
//             amount_paid: amount,
//             payment_status: 'pending'
//           })
//         });

//         if (!response.ok) {
//           throw new Error('Failed to process payment');
//         }

//         const payment = await response.json();
//         navigate('/order-confirmation', { 
//           state: { 
//             orderId,
//             paymentId: payment.payment_id,
//             paymentMethod: 'Cash on Delivery'
//           } 
//         });
//       } else if (selectedMethod === 'payfast') {
//         // Redirect to PayFast
//         // In a real implementation, you would generate the payment request
//         // and redirect to PayFast's payment page
//         window.location.href = `https://www.payfast.co.za/eng/process?amount=${amount}&item_name=Order ${orderId}`;
//       }
//     } catch (error) {
//       toast.error(error.message);
//       setIsProcessing(false);
//     }
//   };

//   const handleBackToOrder = () => {
//     navigate(-1); // Go back to the previous page
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
//         <div className="mb-6">
//           <button
//             onClick={handleBackToOrder}
//             className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
//           >
//             <ChevronLeft className="w-5 h-5" />
//             <span className="ml-1 font-medium">Back to Order</span>
//           </button>
//         </div>

//         <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment Method</h1>

//         <div className="flex flex-col lg:flex-row gap-8">
//           {/* Payment Methods */}
//           <div className="lg:w-2/3">
//             <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
//               <div className="px-6 py-4 border-b border-gray-200">
//                 <h2 className="text-xl font-semibold text-gray-800">Select Payment Method</h2>
//               </div>
              
//               <div className="p-6 space-y-4">
//                 {/* Pay Online with PayFast */}
//                 <div 
//                   className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedMethod === 'payfast' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
//                   onClick={() => handlePaymentMethodSelect('payfast')}
//                 >
//                   <div className="flex items-center">
//                     <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//                       </svg>
//                     </div>
//                     <div className="ml-4">
//                       <h3 className="text-lg font-medium text-gray-900">Pay Online</h3>
//                       <p className="text-gray-600">Secure payment via PayFast (Credit/Debit Card, EFT)</p>
//                     </div>
//                     <div className="ml-auto">
//                       <input
//                         type="radio"
//                         name="paymentMethod"
//                         checked={selectedMethod === 'payfast'}
//                         onChange={() => handlePaymentMethodSelect('payfast')}
//                         className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
//                       />
//                     </div>
//                   </div>
//                   {selectedMethod === 'payfast' && (
//                     <div className="mt-4 pt-4 border-t border-gray-200">
//                       <div className="flex justify-center">
//                         <img 
//                           src="https://sandbox.payfast.co.za/images/payfast_logo.svg" 
//                           alt="PayFast" 
//                           className="h-8"
//                         />
//                       </div>
//                       <p className="mt-2 text-sm text-gray-500 text-center">
//                         You will be redirected to PayFast's secure payment page to complete your transaction.
//                       </p>
//                     </div>
//                   )}
//                 </div>

//                 {/* Cash on Delivery */}
//                 <div 
//                   className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedMethod === 'cod' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
//                   onClick={() => handlePaymentMethodSelect('cod')}
//                 >
//                   <div className="flex items-center">
//                     <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
//                       </svg>
//                     </div>
//                     <div className="ml-4">
//                       <h3 className="text-lg font-medium text-gray-900">Cash on Delivery</h3>
//                       <p className="text-gray-600">Pay with cash when your order is delivered</p>
//                     </div>
//                     <div className="ml-auto">
//                       <input
//                         type="radio"
//                         name="paymentMethod"
//                         checked={selectedMethod === 'cod'}
//                         onChange={() => handlePaymentMethodSelect('cod')}
//                         className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
//                       />
//                     </div>
//                   </div>
//                   {selectedMethod === 'cod' && (
//                     <div className="mt-4 pt-4 border-t border-gray-200">
//                       <p className="text-sm text-gray-500">
//                         Please have exact change ready for the delivery person. An additional service fee may apply.
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Order Summary */}
//           <div className="lg:w-1/3">
//             <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-4">
//               <div className="px-6 py-4 border-b border-gray-200">
//                 <h2 className="text-lg font-semibold text-gray-800">Order Summary</h2>
//               </div>
//               <div className="p-6">
//                 <div className="space-y-4">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Order Number</span>
//                     <span className="font-medium">#{orderId}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Total Amount</span>
//                     <span className="font-medium">${amount.toFixed(2)}</span>
//                   </div>
//                   <div className="pt-4 border-t border-gray-200">
//                     <h3 className="text-sm font-medium text-gray-900">Selected Payment</h3>
//                     <p className="mt-1 text-sm text-gray-600">
//                       {selectedMethod === 'payfast' ? 'PayFast Online Payment' : 
//                        selectedMethod === 'cod' ? 'Cash on Delivery' : 'Not selected'}
//                     </p>
//                   </div>
//                 </div>

//                 <button
//                   onClick={handlePaymentSubmit}
//                   disabled={!selectedMethod || isProcessing}
//                   className={`mt-6 w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
//                     !selectedMethod || isProcessing
//                       ? 'bg-gray-400 cursor-not-allowed'
//                       : 'bg-blue-600 hover:bg-blue-700'
//                   }`}
//                 >
//                   {isProcessing ? (
//                     <>
//                       <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Processing...
//                     </>
//                   ) : selectedMethod === 'payfast' ? (
//                     'Proceed to PayFast'
//                   ) : (
//                     'Complete Order'
//                   )}
//                 </button>

//                 <p className="mt-4 text-center text-sm text-gray-500">
//                   Your personal data will be used to process your order and for other purposes described in our privacy policy.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentPage;

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChevronLeft } from 'lucide-react';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, amount } = location.state || {};
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!orderId || !amount) {
      toast.error('Missing order information');
      navigate('/');
    }
  }, [orderId, amount, navigate]);

  if (!orderId || !amount) {
    return null;
  }

  const handlePaymentMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      if (selectedMethod === 'cod') {
        // Handle Cash on Delivery
        const response = await fetch('http://localhost:8080/api/user/payments/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            orderId,
            amount,
            paymentMethod: 'cod'
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to process COD payment');
        }

        // navigate('/order-confirmation', { 
        //   state: { 
        //     orderId,
        //     paymentMethod: 'Cash on Delivery',
        //     amount
        //   } 
        // });

        navigate('/payment/success');

      } else if (selectedMethod === 'payfast') {
        // Handle PayFast payment
        const response = await fetch('http://localhost:8080/api/user/payments/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            orderId,
            paymentMethod: 'payFast'
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to initiate PayFast payment');
        }

        // Redirect to PayFast payment page
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.url;

        Object.entries(data.data).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      }
    } catch (error) {
      toast.error(error.message);
      setIsProcessing(false);
    }
  };

  const handleBackToOrder = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={handleBackToOrder}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="ml-1 font-medium">Back to Order</span>
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment Method</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Payment Methods */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Select Payment Method</h2>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Pay Online with PayFast */}
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedMethod === 'payfast' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => handlePaymentMethodSelect('payfast')}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Pay Online</h3>
                      <p className="text-gray-600">Secure payment via PayFast (Credit/Debit Card, EFT)</p>
                    </div>
                    <div className="ml-auto">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={selectedMethod === 'payfast'}
                        onChange={() => handlePaymentMethodSelect('payfast')}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                    </div>
                  </div>
                  {selectedMethod === 'payfast' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-center">
                        <img 
                          src="https://sandbox.payfast.co.za/images/payfast_logo.svg" 
                          alt="PayFast" 
                          className="h-8"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500 text-center">
                        You will be redirected to PayFast's secure payment page to complete your transaction.
                      </p>
                    </div>
                  )}
                </div>

                {/* Cash on Delivery */}
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedMethod === 'cod' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => handlePaymentMethodSelect('cod')}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Cash on Delivery</h3>
                      <p className="text-gray-600">Pay with cash when your order is delivered</p>
                    </div>
                    <div className="ml-auto">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={selectedMethod === 'cod'}
                        onChange={() => handlePaymentMethodSelect('cod')}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                    </div>
                  </div>
                  {selectedMethod === 'cod' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        Please have exact change ready for the delivery person. An additional service fee may apply.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Order Summary</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number</span>
                    <span className="font-medium">#{orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-medium">R{amount.toFixed(2)}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Selected Payment</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {selectedMethod === 'payfast' ? 'PayFast Online Payment' : 
                       selectedMethod === 'cod' ? 'Cash on Delivery' : 'Not selected'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handlePaymentSubmit}
                  disabled={!selectedMethod || isProcessing}
                  className={`mt-6 w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    !selectedMethod || isProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : selectedMethod === 'payfast' ? (
                    'Proceed to PayFast'
                  ) : (
                    'Complete Order'
                  )}
                </button>

                <p className="mt-4 text-center text-sm text-gray-500">
                  Your personal data will be used to process your order and for other purposes described in our privacy policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;