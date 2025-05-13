// import React, { useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { CheckCircleIcon } from '@heroicons/react/24/outline';

// const PaymentSuccess = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const searchParams = new URLSearchParams(location.search);
//   const orderId = searchParams.get('m_payment_id');
//   console.log(orderId);

//   useEffect(() => {
//     // You might want to verify payment status with your backend here
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//       <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
//         <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
//           <CheckCircleIcon className="h-10 w-10 text-green-600" />
//         </div>
        
//         <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful</h1>
//         <p className="text-gray-600 mb-6">
//           Thank you for your order #{orderId}. Your payment was processed successfully.
//         </p>
        
//         <div className="flex flex-col space-y-3">
//           <button
//             onClick={() => navigate('/account/order')}
//             className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
//           >
//             View Order Details
//           </button>
//           <button
//             onClick={() => navigate('/product')}
//             className="w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors shadow-sm"
//           >
//             Continue Shopping
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentSuccess;

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const PaymentSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // useEffect(() => {
  //   const verifyPayment = async () => {
  //     const token = localStorage.getItem('access_token');
  //     if (!token) {
  //       throw new Error('Authentication required');
  //     }
  //     try {
  //       const response = await fetch('http://localhost:8080/api/user/payments/notify', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': `Bearer ${token}`
  //         },
  //         body: JSON.stringify({
  //           orderId,
  //           paymentStatus: 'COMPLETE',
  //         })
  //       });
  //       const data = await response.json();
        
  //       if (!response.ok) {
  //         throw new Error(data.error || 'Failed to process payFast payment');
  //       }
  //       // You can handle success response here if needed
  //     } catch (error) {
  //       console.error('Error verifying payment:', error);
  //       // You might want to handle errors here (e.g., show an error message)
  //     }
  //   };

  //   verifyPayment();
  // }, [orderId]); // Run effect when orderId changes

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

// import React, { useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { CheckCircleIcon } from '@heroicons/react/24/outline';

// const PaymentSuccess = () => {
//   const { orderId } = useParams();
//   console.log(orderId);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const verifyPayment = async () => {
//   const token = localStorage.getItem('access_token');
//   if (!token) {
//     console.error('No access token found');
//     navigate('/login');
//     return;
//   }

//   try {
//     const response = await fetch(`http://localhost:8080/api/user/payments/update/${orderId}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify({
//         paymentStatus: 'completed',
//       })
//     });

//     const data = await response.json();
    
//     if (!response.ok) {
//       console.error('Payment verification failed:', data);
//       throw new Error(
//         data.error || data.details || data.message || 'Payment verification failed'
//       );
//     }

//     console.log('Payment verification successful:', data);
    
//   } catch (error) {
//     console.error('Error verifying payment:', error.message);
//     // Consider showing a more user-friendly error message
//   }
// };

//     verifyPayment();
//   }, [orderId, navigate]);

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//       <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
//         <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
//           <CheckCircleIcon className="h-10 w-10 text-green-600" />
//         </div>
        
//         <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful</h1>
//         <p className="text-gray-600 mb-6">
//           Thank you for your order #{orderId}. Your payment was processed successfully.
//         </p>
        
//         <div className="flex flex-col space-y-3">
//           <button
//             onClick={() => navigate('/account/order')}
//             className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
//           >
//             View Order Details
//           </button>
//           <button
//             onClick={() => navigate('/product')}
//             className="w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors shadow-sm"
//           >
//             Continue Shopping
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentSuccess;

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// const PaymentSuccess = () => {
//   const { orderId } = useParams();
//   const navigate = useNavigate();
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const verifyPayment = async () => {
//   const token = localStorage.getItem('access_token');
//   if (!token) {
//     setError('Authentication required. Please log in.');
//     navigate('/login');
//     return;
//   }

//   try {
//     setIsLoading(true);
//     const response = await fetch(`http://localhost:8080/api/user/payments/update/${orderId}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify({
//         paymentStatus: 'completed',
//       })
//     });

//     const data = await response.json();
    
//     if (!response.ok) {
//       // Enhanced error handling
//       const errorMsg = data.error || 
//                      data.details || 
//                      data.message || 
//                      `Payment verification failed (Status: ${response.status})`;
//       throw new Error(errorMsg);
//     }

//     console.log('Payment verification successful:', data);
    
//   } catch (error) {
//     console.error('Error verifying payment:', error);
//     setError(error.message);
    
//     // If it's a server error, show more details
//     if (error.message.includes('500')) {
//       setError('Server error. Please try again later or contact support.');
//     }
//   } finally {
//     setIsLoading(false);
//   }
// };

//     verifyPayment();
//   }, [orderId, navigate]);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//         <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
//           <div className="animate-pulse">
//             <div className="mx-auto w-20 h-20 bg-gray-200 rounded-full mb-6"></div>
//             <h1 className="text-2xl font-bold text-gray-900 mb-3">Processing Payment...</h1>
//             <p className="text-gray-600 mb-6">
//               Please wait while we verify your payment for order #{orderId}.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//         <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
//           <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
//             <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
//           </div>
          
//           <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Verification Issue</h1>
//           <p className="text-gray-600 mb-6">
//             {error} (Order #{orderId})
//           </p>
          
//           <div className="flex flex-col space-y-3">
//             <button
//               onClick={() => navigate('/account/order')}
//               className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
//             >
//               View Order Details
//             </button>
//             <button
//               onClick={() => navigate('/support')}
//               className="w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors shadow-sm"
//             >
//               Contact Support
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//       <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
//         <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
//           <CheckCircleIcon className="h-10 w-10 text-green-600" />
//         </div>
        
//         <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful</h1>
//         <p className="text-gray-600 mb-6">
//           Thank you for your order #{orderId}. Your payment was processed successfully.
//         </p>
        
//         <div className="flex flex-col space-y-3">
//           <button
//             onClick={() => navigate('/account/order')}
//             className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
//           >
//             View Order Details
//           </button>
//           <button
//             onClick={() => navigate('/product')}
//             className="w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors shadow-sm"
//           >
//             Continue Shopping
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentSuccess;

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// const PaymentSuccess = () => {
//   const { orderId } = useParams();
//   const navigate = useNavigate();
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [paymentSuccess, setPaymentSuccess] = useState(false);

//   useEffect(() => {
//     const verifyPayment = async () => {
//       const token = localStorage.getItem('access_token');
//       if (!token) {
//         setError('Authentication required. Please log in.');
//         setIsLoading(false);
//         navigate('/login');
//         return;
//       }

//       try {
//         setIsLoading(true);
//         const response = await fetch(`http://localhost:8080/api/user/payments/update/${orderId}`, {
//           method: 'PUT',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//           },
//           body: JSON.stringify({
//             paymentStatus: 'completed',
//           })
//         });

//         // Handle network errors
//         if (!response) {
//           throw new Error('Network error. Please check your connection.');
//         }
        
//         const data = await response.json();
        
//         if (!response.ok) {
//           // Enhanced error handling
//           const errorMsg = data.error || 
//                         data.details || 
//                         data.message || 
//                         `Payment verification failed (Status: ${response.status})`;
//           throw new Error(errorMsg);
//         }

//         console.log('Payment verification successful:', data);
//         setPaymentSuccess(true);
        
//       } catch (error) {
//         console.error('Error verifying payment:', error);
//         setError(error.message);
        
//         // If it's a server error, show more details
//         if (error.message.includes('500')) {
//           setError('Server error. Please try again later or contact support.');
//         }
        
//         // If it's a network error
//         if (error.name === 'TypeError') {
//           setError('Unable to connect to the server. Please check your internet connection.');
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     verifyPayment();
//   }, [orderId, navigate]);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//         <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
//           <div className="animate-pulse">
//             <div className="mx-auto w-20 h-20 bg-gray-200 rounded-full mb-6"></div>
//             <h1 className="text-2xl font-bold text-gray-900 mb-3">Processing Payment...</h1>
//             <p className="text-gray-600 mb-6">
//               Please wait while we verify your payment for order #{orderId}.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//         <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
//           <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
//             <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
//           </div>
          
//           <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Verification Issue</h1>
//           <p className="text-gray-600 mb-6">
//             {error} (Order #{orderId})
//           </p>
          
//           <div className="flex flex-col space-y-3">
//             <button
//               onClick={() => navigate('/account/order')}
//               className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
//             >
//               View Order Details
//             </button>
//             <button
//               onClick={() => navigate('/support')}
//               className="w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors shadow-sm"
//             >
//               Contact Support
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (paymentSuccess) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//         <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
//           <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
//             <CheckCircleIcon className="h-10 w-10 text-green-600" />
//           </div>
          
//           <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful</h1>
//           <p className="text-gray-600 mb-6">
//             Thank you for your order #{orderId}. Your payment was processed successfully.
//           </p>
          
//           <div className="flex flex-col space-y-3">
//             <button
//               onClick={() => navigate('/account/order')}
//               className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
//             >
//               View Order Details
//             </button>
//             <button
//               onClick={() => navigate('/product')}
//               className="w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors shadow-sm"
//             >
//               Continue Shopping
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Fallback - this shouldn't happen but is included as a safeguard
//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//       <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
//         <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Processing</h1>
//         <p className="text-gray-600 mb-6">
//           Something unexpected happened. Please check your order status.
//         </p>
//         <button
//           onClick={() => navigate('/account/order')}
//           className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
//         >
//           View Order Details
//         </button>
//       </div>
//     </div>
//   );
// };

// export default PaymentSuccess;

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// const PaymentSuccess = () => {
//   const { orderId } = useParams();
//   const navigate = useNavigate();
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [paymentSuccess, setPaymentSuccess] = useState(false);

//   useEffect(() => {
//     const verifyPayment = async () => {
//       const token = localStorage.getItem('access_token');
//       if (!token) {
//         setError('Authentication required. Please log in.');
//         setIsLoading(false);
//         navigate('/login');
//         return;
//       }

//       try {
//         setIsLoading(true);
        
//         // Add a small delay to ensure the DOM has updated before making the API call
//         // This can sometimes help with React rendering issues
//         await new Promise(resolve => setTimeout(resolve, 100));
        
//         console.log('Making payment verification request for order:', orderId);
//         const response = await fetch(`http://localhost:8080/api/user/payments/update/${orderId}`, {
//           method: 'PUT',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//           },
//           body: JSON.stringify({
//             paymentStatus: 'completed',
//           })
//         });

//         // Handle network errors
//         if (!response) {
//           throw new Error('Network error. Please check your connection.');
//         }
        
//         // Handle non-JSON responses
//         let data;
//         const contentType = response.headers.get('content-type');
//         if (contentType && contentType.includes('application/json')) {
//           data = await response.json();
//         } else {
//           const text = await response.text();
//           console.error('Non-JSON response:', text);
//           throw new Error(`Unexpected response format: ${text.substring(0, 100)}...`);
//         }
        
//         if (!response.ok) {
//           // Enhanced error handling
//           const errorMsg = data && (data.error || data.details || data.message) || 
//                         `Payment verification failed (Status: ${response.status})`;
//           console.error('Error response:', data);
//           throw new Error(errorMsg);
//         }

//         console.log('Payment verification successful:', data);
//         setPaymentSuccess(true);
        
//       } catch (error) {
//         console.error('Error verifying payment:', error);
        
//         // Get a readable error message
//         let errorMessage = error.message || 'Unknown error occurred';
        
//         // If it's a server error, show more details
//         if (errorMessage.includes('500')) {
//           errorMessage = 'Server error. Please try again later or contact support.';
//         }
        
//         // If it's a network error
//         if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
//           errorMessage = 'Unable to connect to the server. Please check your internet connection.';
//         }
        
//         // If it's a timeout
//         if (error.name === 'TimeoutError' || errorMessage.includes('timeout')) {
//           errorMessage = 'The server is taking too long to respond. Please try again later.';
//         }
        
//         setError(errorMessage);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     verifyPayment();
//   }, [orderId, navigate]);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//         <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
//           <div className="animate-pulse">
//             <div className="mx-auto w-20 h-20 bg-gray-200 rounded-full mb-6"></div>
//             <h1 className="text-2xl font-bold text-gray-900 mb-3">Processing Payment...</h1>
//             <p className="text-gray-600 mb-6">
//               Please wait while we verify your payment for order #{orderId}.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//         <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
//           <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
//             <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
//           </div>
          
//           <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Verification Issue</h1>
//           <p className="text-gray-600 mb-6">
//             {error} (Order #{orderId})
//           </p>
          
//           <div className="flex flex-col space-y-3">
//             <button
//               onClick={() => navigate('/account/order')}
//               className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
//             >
//               View Order Details
//             </button>
//             <button
//               onClick={() => navigate('/support')}
//               className="w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors shadow-sm"
//             >
//               Contact Support
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (paymentSuccess) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//         <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
//           <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
//             <CheckCircleIcon className="h-10 w-10 text-green-600" />
//           </div>
          
//           <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful</h1>
//           <p className="text-gray-600 mb-6">
//             Thank you for your order #{orderId}. Your payment was processed successfully.
//           </p>
          
//           <div className="flex flex-col space-y-3">
//             <button
//               onClick={() => navigate('/account/order')}
//               className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
//             >
//               View Order Details
//             </button>
//             <button
//               onClick={() => navigate('/product')}
//               className="w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors shadow-sm"
//             >
//               Continue Shopping
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Fallback - this shouldn't happen but is included as a safeguard
//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//       <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
//         <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Processing</h1>
//         <p className="text-gray-600 mb-6">
//           Something unexpected happened. Please check your order status.
//         </p>
//         <button
//           onClick={() => navigate('/account/order')}
//           className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
//         >
//           View Order Details
//         </button>
//       </div>
//     </div>
//   );
// };

// export default PaymentSuccess;