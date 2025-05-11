// import React, { useState, useEffect } from 'react';
// import { useSnapshot } from 'valtio';
// import axios from 'axios';
// import { motion } from 'framer-motion';
// import state from '../store';
// import { fadeAnimation, slideAnimation } from '../config/motion';
// import { downloadCanvasToImage } from '../config/helpers';
// import CustomButton from '../components/CustomButton';

// const AIOrderComponent = ({ onClose }) => {
//   const snap = useSnapshot(state);
//   const [businesses, setBusinesses] = useState([]);
//   const [selectedBusiness, setSelectedBusiness] = useState(null);
//   const [prices, setPrices] = useState([]);
//   const [selectedPrice, setSelectedPrice] = useState(null);
//   const [size, setSize] = useState('M');
//   const [quantity, setQuantity] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);
//   const [orderId, setOrderId] = useState(null);

//   useEffect(() => {
    
//       fetchBusinesses();
//       fetchPrices();
    
//   }, []);

//   const fetchBusinesses = async () => {
//     try {
//       const response = await axios.get('http://localhost:8080/api/ai/businesses', {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('access_token')}`
//         }
//       });
//       setBusinesses(response.data);
//       console.log("Businesses: " ,response.data);
//     } catch (err) {
//       console.error('Failed to fetch businesses:', err);
//       setError('Failed to load businesses. Please try again.');
//     }
//   };

//   const fetchPrices = async () => {
//     try {
//       const response = await axios.get('http://localhost:8080/api/ai/prices', {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('access_token')}`
//         }
//       });
//       setPrices(response.data);
//     } catch (err) {
//       console.error('Failed to fetch prices:', err);
//       setError('Failed to load pricing. Please try again.');
//     }
//   };

//   const determineItemType = () => {
//     if (snap.isLogoTexture && snap.isFullTexture) {
//       return 'Plain textured T-Shirt with logo';
//     } else if (snap.isLogoTexture) {
//       return 'Plain T-Shirt with logo';
//     } else if (snap.isFullTexture) {
//       return 'Plain textured T-Shirt';
//     } else {
//       return 'Plain T-shirt';
//     }
//   };

//   const handleSubmit = async () => {
//     if (!selectedBusiness) {
//       setError('Please select a business');
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       // Determine the item type based on current state
//       const itemType = determineItemType();
//       const selectedPriceObj = prices.find(p => p.type === itemType);
      
//       if (!selectedPriceObj) {
//         throw new Error('Could not determine price for this item');
//       }

//       // Prepare form data
//       const formData = new FormData();
//       formData.append('business_id', selectedBusiness.business_id);
//       formData.append('size', size);
//       formData.append('quantity', quantity);
//       formData.append('item_type', itemType);

//       // Capture and add images to form data
//       const fullProductImage = await downloadCanvasToImage('product');
//       const productBlob = await fetch(fullProductImage).then(r => r.blob());
//       formData.append('product', productBlob, 'product.png');

//       if (snap.isLogoTexture && snap.logoDecal) {
//         const logoResponse = await fetch(snap.logoDecal);
//         const logoBlob = await logoResponse.blob();
//         formData.append('logo', logoBlob, 'logo.png');
//       }

//       if (snap.isFullTexture && snap.fullDecal) {
//         const textureResponse = await fetch(snap.fullDecal);
//         const textureBlob = await textureResponse.blob();
//         formData.append('texture', textureBlob, 'texture.png');
//       }

//       // Submit order
//       const response = await axios.post('http://localhost:8080/api/ai', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//           Authorization: `Bearer ${localStorage.getItem('access_token')}`
//         }
//       });

//       setSuccess(true);
//       setOrderId(response.data.order_id);
//       setTimeout(() => {
//         onClose();
//         setSuccess(false);
//         }, 3000);
//     } catch (err) {
//       console.error('Order submission failed:', err);
//       setError(err.response?.data?.error || 'Failed to place order. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

// //   if (nextStage !== 'Order Now') return null;

//   return (
//     <motion.div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
//       {...fadeAnimation}
//     >
//       <motion.div 
//         className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
//         {...slideAnimation('up')}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-2xl font-bold text-gray-900">Place Your AI Order</h2>
//             <button 
//               onClick={() => state.intro = true}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>

//           {error && (
//             <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
//               {error}
//             </div>
//           )}

//           {success ? (
//             <div className="text-center py-8">
//               <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
//                 <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//               </div>
//               <h3 className="text-lg font-medium text-gray-900 mb-2">Order Placed Successfully!</h3>
//               <p className="text-gray-600 mb-6">Your order ID: {orderId}</p>
//               <button
//                 onClick={() => {
//                   state.intro = true;
//                   setSuccess(false);
//                 }}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//               >
//                 Back to Customizer
//               </button>
//             </div>
//           ) : (
//             <>
//               <div className="space-y-6">
//                 {/* Business Selection */}
//                 <div>
//                   <h3 className="text-lg font-medium text-gray-900 mb-2">Select Business</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {businesses.map(business => (
//                       <div 
//                         key={business.business_id}
//                         className={`p-4 border rounded-lg cursor-pointer transition-all ${
//                           selectedBusiness?.business_id === business.business_id 
//                             ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
//                             : 'border-gray-200 hover:border-gray-300'
//                         }`}
//                         onClick={() => setSelectedBusiness(business)}
//                       >
//                         <div className="flex items-center">
//                           {business.business_logo_url && (
//                             <img 
//                               src={business.business_logo_url} 
//                               alt={business.business_name}
//                               className="w-12 h-12 rounded-full object-cover mr-3"
//                             />
//                           )}
//                           <span className="font-medium">{business.business_name}</span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Product Details */}
//                 <div className="border-t border-gray-200 pt-4">
//                   <h3 className="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
                  
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {/* Preview */}
//                     <div>
//                       <h4 className="text-sm font-medium text-gray-700 mb-2">Your Design</h4>
//                       <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
//                         <img 
//                           src={snap.logoDecal || snap.fullDecal || ''} 
//                           alt="Custom design"
//                           className="max-h-40 object-contain"
//                         />
//                       </div>
//                     </div>

//                     {/* Configuration */}
//                     <div>
//                       <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
//                         <div className="text-gray-900 font-medium">
//                           {determineItemType()}
//                         </div>
//                       </div>

//                       <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
//                         <select
//                           value={selectedPrice?.type || ''}
//                           onChange={(e) => {
//                             const price = prices.find(p => p.type === e.target.value);
//                             setSelectedPrice(price);
//                           }}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                         >
//                           <option value="">Select a price</option>
//                           {prices.map(price => (
//                             <option key={price.price_id} value={price.type}>
//                               {price.type} - ${price.price}
//                             </option>
//                           ))}
//                         </select>
//                       </div>

//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
//                           <select
//                             value={size}
//                             onChange={(e) => setSize(e.target.value)}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                           >
//                             <option value="XS">XS</option>
//                             <option value="S">S</option>
//                             <option value="M">M</option>
//                             <option value="L">L</option>
//                             <option value="XL">XL</option>
//                             <option value="XXL">XXL</option>
//                           </select>
//                         </div>

//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
//                           <input
//                             type="number"
//                             min="1"
//                             max="10"
//                             value={quantity}
//                             onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Summary */}
//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <h3 className="text-lg font-medium text-gray-900 mb-3">Order Summary</h3>
//                   <div className="space-y-2">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Item Price</span>
//                       <span className="font-medium">
//                         ${selectedPrice ? (selectedPrice.price * quantity).toFixed(2) : '0.00'}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Shipping</span>
//                       <span className="font-medium">$5.00</span>
//                     </div>
//                     <div className="border-t border-gray-200 pt-2 flex justify-between">
//                       <span className="font-medium">Total</span>
//                       <span className="font-medium text-blue-600">
//                         ${selectedPrice ? (selectedPrice.price * quantity + 5).toFixed(2) : '0.00'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-6 flex justify-end space-x-3">
//                 <button
//                   onClick={() => state.intro = true}
//                   className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSubmit}
//                   disabled={!selectedBusiness || !selectedPrice || loading}
//                   className={`px-4 py-2 rounded-md text-white ${
//                     !selectedBusiness || !selectedPrice || loading
//                       ? 'bg-gray-400 cursor-not-allowed'
//                       : 'bg-blue-600 hover:bg-blue-700'
//                   }`}
//                 >
//                   {loading ? (
//                     <span className="flex items-center">
//                       <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Processing...
//                     </span>
//                   ) : (
//                     'Place Order'
//                   )}
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default AIOrderComponent;

// import React, { useState, useEffect } from 'react';
// import { useSnapshot } from 'valtio';
// import axios from 'axios';
// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import state from '../store';
// import { fadeAnimation, slideAnimation } from '../config/motion';
// import { downloadCanvasToImage } from '../config/helpers';
// import CustomButton from '../components/CustomButton';

// const AIOrderComponent = ({ onClose }) => {
//   const snap = useSnapshot(state);
//   const navigate = useNavigate();
//   const [businesses, setBusinesses] = useState([]);
//   const [selectedBusiness, setSelectedBusiness] = useState(null);
//   const [prices, setPrices] = useState([]);
//   const [selectedPrice, setSelectedPrice] = useState(null);
//   const [size, setSize] = useState('M');
//   const [quantity, setQuantity] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);

//   useEffect(() => {
//     fetchBusinesses();
//     fetchPrices();
//   }, []);

//   useEffect(() => {
//     // Automatically select price when prices or item type changes
//     if (prices.length > 0) {
//       const itemType = determineItemType();
//       const price = prices.find(p => p.type === itemType);
//       setSelectedPrice(price);
//     }
//   }, [prices, snap.isLogoTexture, snap.isFullTexture]);

//   const fetchBusinesses = async () => {
//     try {
//       const response = await axios.get('http://localhost:8080/api/ai/businesses', {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('access_token')}`
//         }
//       });
//       setBusinesses(response.data);
//     } catch (err) {
//       console.error('Failed to fetch businesses:', err);
//       setError('Failed to load businesses. Please try again.');
//     }
//   };

//   const fetchPrices = async () => {
//     try {
//       const response = await axios.get('http://localhost:8080/api/ai/prices', {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('access_token')}`
//         }
//       });
//       setPrices(response.data);
//     } catch (err) {
//       console.error('Failed to fetch prices:', err);
//       setError('Failed to load pricing. Please try again.');
//     }
//   };

//   const determineItemType = () => {
//     if (snap.isLogoTexture && snap.isFullTexture) {
//       return 'Plain textured T-Shirt with logo';
//     } else if (snap.isLogoTexture) {
//       return 'Plain T-Shirt with logo';
//     } else if (snap.isFullTexture) {
//       return 'Plain textured T-Shirt';
//     } else {
//       return 'Plain T-shirt';
//     }
//   };

//   const handleSubmit = async () => {
//     if (!selectedBusiness) {
//       setError('Please select a business');
//       return;
//     }

//     if (!selectedPrice) {
//       setError('Could not determine price for this item');
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       // Determine the item type based on current state
//       const itemType = determineItemType();
      
//       // Prepare form data
//       const formData = new FormData();
//       formData.append('business_id', selectedBusiness.business_id);
//       formData.append('size', size);
//       formData.append('quantity', quantity);
//       formData.append('item_type', itemType);

//       // Capture and add images to form data
//       const fullProductImage = await downloadCanvasToImage('product');
//       const productBlob = await fetch(fullProductImage).then(r => r.blob());
//       formData.append('product', productBlob, 'product.png');

//       if (snap.isLogoTexture && snap.logoDecal) {
//         const logoResponse = await fetch(snap.logoDecal);
//         const logoBlob = await logoResponse.blob();
//         formData.append('logo', logoBlob, 'logo.png');
//       }

//       if (snap.isFullTexture && snap.fullDecal) {
//         const textureResponse = await fetch(snap.fullDecal);
//         const textureBlob = await textureResponse.blob();
//         formData.append('texture', textureBlob, 'texture.png');
//       }

//       // Submit order
//       const response = await axios.post('http://localhost:8080/api/ai', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//           Authorization: `Bearer ${localStorage.getItem('access_token')}`
//         }
//       });

//       setSuccess(true);
      
//       // Navigate to payment page after a brief delay
//       setTimeout(() => {
//         navigate('/payment', { 
//           state: { 
//             orderId: response.data.orders[0].order_id, 
//             amount: response.data.orders[0].total_amount 
//           } 
//         });
//       }, 2000);
//     } catch (err) {
//       console.error('Order submission failed:', err);
//       setError(err.response?.data?.error || 'Failed to place order. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <motion.div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
//       {...fadeAnimation}
//     >
//       <motion.div 
//         className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
//         {...slideAnimation('up')}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-2xl font-bold text-gray-900">Place Your AI Order</h2>
//             <button 
//               onClick={() => onClose()}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>

//           {error && (
//             <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
//               {error}
//             </div>
//           )}

//           {success ? (
//             <div className="text-center py-8">
//               <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
//                 <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//               </div>
//               <h3 className="text-lg font-medium text-gray-900 mb-2">Order Placed Successfully!</h3>
//               <p className="text-gray-600 mb-6">Redirecting to payment...</p>
//             </div>
//           ) : (
//             <>
//               <div className="space-y-6">
//                 {/* Business Selection */}
//                 <div>
//                   <h3 className="text-lg font-medium text-gray-900 mb-2">Select Business</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {businesses.map(business => (
//                       <div 
//                         key={business.business_id}
//                         className={`p-4 border rounded-lg cursor-pointer transition-all ${
//                           selectedBusiness?.business_id === business.business_id 
//                             ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
//                             : 'border-gray-200 hover:border-gray-300'
//                         }`}
//                         onClick={() => setSelectedBusiness(business)}
//                       >
//                         <div className="flex items-center">
//                           {business.business_logo_url && (
//                             <img 
//                               src={business.business_logo_url} 
//                               alt={business.business_name}
//                               className="w-12 h-12 rounded-full object-cover mr-3"
//                             />
//                           )}
//                           <span className="font-medium">{business.business_name}</span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Product Details */}
//                 <div className="border-t border-gray-200 pt-4">
//                   <h3 className="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
                  
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {/* Preview */}
//                     <div>
//                       <h4 className="text-sm font-medium text-gray-700 mb-2">Your Design</h4>
//                       <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
//                         <img 
//                           src={snap.logoDecal || snap.fullDecal || ''} 
//                           alt="Custom design"
//                           className="max-h-40 object-contain"
//                         />
//                       </div>
//                     </div>

//                     {/* Configuration */}
//                     <div>
//                       <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
//                         <div className="text-gray-900 font-medium">
//                           {determineItemType()}
//                         </div>
//                       </div>

//                       <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
//                         <div className="text-gray-900 font-medium">
//                           {selectedPrice ? `$${selectedPrice.price}` : 'Loading...'}
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
//                           <select
//                             value={size}
//                             onChange={(e) => setSize(e.target.value)}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                           >
//                             <option value="XS">XS</option>
//                             <option value="S">S</option>
//                             <option value="M">M</option>
//                             <option value="L">L</option>
//                             <option value="XL">XL</option>
//                             <option value="XXL">XXL</option>
//                           </select>
//                         </div>

//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
//                           <input
//                             type="number"
//                             min="1"
//                             max="10"
//                             value={quantity}
//                             onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Summary */}
//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <h3 className="text-lg font-medium text-gray-900 mb-3">Order Summary</h3>
//                   <div className="space-y-2">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Item Price</span>
//                       <span className="font-medium">
//                         ${selectedPrice ? (selectedPrice.price * quantity).toFixed(2) : '0.00'}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Shipping</span>
//                       <span className="font-medium">$5.00</span>
//                     </div>
//                     <div className="border-t border-gray-200 pt-2 flex justify-between">
//                       <span className="font-medium">Total</span>
//                       <span className="font-medium text-blue-600">
//                         ${selectedPrice ? (selectedPrice.price * quantity + 5).toFixed(2) : '0.00'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-6 flex justify-end space-x-3">
//                 <button
//                   onClick={() => state.intro = true}
//                   className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSubmit}
//                   disabled={!selectedBusiness || !selectedPrice || loading}
//                   className={`px-4 py-2 rounded-md text-white ${
//                     !selectedBusiness || !selectedPrice || loading
//                       ? 'bg-gray-400 cursor-not-allowed'
//                       : 'bg-blue-600 hover:bg-blue-700'
//                   }`}
//                 >
//                   {loading ? (
//                     <span className="flex items-center">
//                       <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Processing...
//                     </span>
//                   ) : (
//                     'Place Order'
//                   )}
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default AIOrderComponent;

import React, { useState, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import state from '../store';
import { fadeAnimation, slideAnimation } from '../config/motion';
import { downloadCanvasToImage } from '../config/helpers';
import CustomButton from '../components/CustomButton';
import Swal from 'sweetalert2';

const AIOrderComponent = ({ onClose }) => {
  const snap = useSnapshot(state);
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [prices, setPrices] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [size, setSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    addressType: 'Home',
    address: '',
    city: '',
    country: '',
    phoneNumber: ''
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBusinesses();
    fetchPrices();
    fetchAddresses();
  }, []);

  useEffect(() => {
    // Automatically select price when prices or item type changes
    if (prices.length > 0) {
      const itemType = determineItemType();
      const price = prices.find(p => p.type === itemType);
      setSelectedPrice(price);
    }
  }, [prices, snap.isLogoTexture, snap.isFullTexture]);

  const fetchBusinesses = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/ai/businesses', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setBusinesses(response.data);
    } catch (err) {
      console.error('Failed to fetch businesses:', err);
      setError('Failed to load businesses. Please try again.');
    }
  };

  const fetchPrices = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/ai/prices', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setPrices(response.data);
    } catch (err) {
      console.error('Failed to fetch prices:', err);
      setError('Failed to load pricing. Please try again.');
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/addresses', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setAddresses(response.data);
      if (response.data.length > 0) {
        setSelectedAddressId(response.data[0].address_id);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
      setError('Failed to load addresses. Please try again.');
    }
  };

  const determineItemType = () => {
    if (snap.isLogoTexture && snap.isFullTexture) {
      return 'Plain textured T-Shirt with logo';
    } else if (snap.isLogoTexture) {
      return 'Plain T-Shirt with logo';
    } else if (snap.isFullTexture) {
      return 'Plain textured T-Shirt';
    } else {
      return 'Plain T-shirt';
    }
  };

  const handleAddressChange = (addressId) => {
    setSelectedAddressId(addressId);
  };

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  const saveNewAddress = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post('http://localhost:8080/api/addresses', newAddress, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
      const savedAddress = response.data;
      setAddresses(prev => [...prev, savedAddress]);
      setSelectedAddressId(savedAddress.address_id);
      setShowAddressForm(false);
      setNewAddress({
        addressType: 'Home',
        address: '',
        city: '',
        country: '',
        phoneNumber: ''
      });
      setError(null);
    } catch (err) {
      console.error('Failed to save address:', err);
      setError('Failed to save address. Please try again.');
    }
  };

  const deleteAddress = async (addressId) => {
    if (isDeleting) return;
    
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (!result.isConfirmed) return;
      setIsDeleting(true);
      
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://localhost:8080/api/addresses/${addressId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setAddresses(prev => prev.filter(addr => addr.address_id !== addressId));
      
      if (selectedAddressId === addressId) {
        const remainingAddresses = addresses.filter(addr => addr.address_id !== addressId);
        if (remainingAddresses.length > 0) {
          setSelectedAddressId(remainingAddresses[0].address_id);
        } else {
          setSelectedAddressId(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete address:', err);
      setError('Failed to delete address. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBusiness) {
      setError('Please select a business');
      return;
    }

    if (!selectedPrice) {
      setError('Could not determine price for this item');
      return;
    }

    if (!selectedAddressId) {
      setError('Please select a shipping address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Determine the item type based on current state
      const itemType = determineItemType();
      
      // Prepare form data
      const formData = new FormData();
      formData.append('business_id', selectedBusiness.business_id);
      formData.append('size', size);
      formData.append('quantity', quantity);
      formData.append('item_type', itemType);
      formData.append('address_id', selectedAddressId);

      // Capture and add images to form data
      const fullProductImage = await downloadCanvasToImage('product');
      const productBlob = await fetch(fullProductImage).then(r => r.blob());
      formData.append('product', productBlob, 'product.png');

      if (snap.isLogoTexture && snap.logoDecal) {
        const logoResponse = await fetch(snap.logoDecal);
        const logoBlob = await logoResponse.blob();
        formData.append('logo', logoBlob, 'logo.png');
      }

      if (snap.isFullTexture && snap.fullDecal) {
        const textureResponse = await fetch(snap.fullDecal);
        const textureBlob = await textureResponse.blob();
        formData.append('texture', textureBlob, 'texture.png');
      }

      // Submit order
      const response = await axios.post('http://localhost:8080/api/ai', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      setSuccess(true);
      
      // Navigate to payment page after a brief delay
      setTimeout(() => {
        navigate('/payment', { 
          state: { 
            orderId: response.data.orders[0].order_id, 
            amount: response.data.orders[0].total_amount 
          } 
        });
      }, 2000);
    } catch (err) {
      console.error('Order submission failed:', err);
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      {...fadeAnimation}
    >
      <motion.div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        {...slideAnimation('up')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Place Your AI Order</h2>
            <button 
              onClick={() => onClose()}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Order Placed Successfully!</h3>
              <p className="text-gray-600 mb-6">Redirecting to payment...</p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {/* Business Selection */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select Business</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {businesses.map(business => (
                      <div 
                        key={business.business_id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedBusiness?.business_id === business.business_id 
                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedBusiness(business)}
                      >
                        <div className="flex items-center">
                          {business.business_logo_url && (
                            <img 
                              src={`http://localhost:8080/${business.business_logo_url}`} 
                              alt={business.business_name}
                              className="w-12 h-12 rounded-full object-cover mr-3"
                            />
                          )}
                          <span className="font-medium">{business.business_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Shipping Address</h3>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-600">Select a shipping address</span>
                    <button 
                      onClick={() => setShowAddressForm(true)} 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {addresses.length > 0 ? '+ Add New' : '+ Add Address'}
                    </button>
                  </div>

                  {showAddressForm ? (
                    <div className="p-4 border border-gray-200 rounded-lg mb-4">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Add New Address</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                          <select
                            name="addressType"
                            value={newAddress.addressType}
                            onChange={handleNewAddressChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Home">Home</option>
                            <option value="Office">Office</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                          <input
                            type="text"
                            name="address"
                            value={newAddress.address}
                            onChange={handleNewAddressChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Full address"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                              type="text"
                              name="city"
                              value={newAddress.city}
                              onChange={handleNewAddressChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                            <input
                              type="text"
                              name="country"
                              value={newAddress.country}
                              onChange={handleNewAddressChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Country"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <input
                            type="text"
                            name="phoneNumber"
                            value={newAddress.phoneNumber}
                            onChange={handleNewAddressChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Phone number"
                          />
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                          <button
                            onClick={() => setShowAddressForm(false)}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveNewAddress}
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            Save Address
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : addresses.length > 0 ? (
                    <div className="space-y-2">
                      {addresses.map(address => (
                        <div 
                          key={address.address_id} 
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedAddressId === address.address_id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                          onClick={() => handleAddressChange(address.address_id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center mb-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  address.address_type === 'Home' ? 'bg-red-100 text-red-800' :
                                  address.address_type === 'Office' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {address.address_type}
                                </span>
                                <span className="ml-2 text-sm font-medium text-gray-900">{address.first_name} {address.last_name}</span>
                                <span className="ml-2 text-sm text-gray-500">{address.phone_number}</span>
                              </div>
                              <p className="text-sm text-gray-700">{address.address}</p>
                              <p className="text-sm text-gray-700">{address.city}, {address.country}</p>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name="selectedAddress"
                                checked={selectedAddressId === address.address_id}
                                onChange={() => handleAddressChange(address.address_id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteAddress(address.address_id);
                                }}
                                className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete address"
                                disabled={isDeleting}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border border-gray-200 rounded-lg text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No shipping addresses</h3>
                      <p className="mt-1 text-sm text-gray-500">Add a shipping address to continue with your order.</p>
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Add Address
                      </button>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Preview */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Your Design</h4>
                      <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
                        <img 
                          src={snap.logoDecal || snap.fullDecal || ''} 
                          alt="Custom design"
                          className="max-h-40 object-contain"
                        />
                      </div>
                    </div>

                    {/* Configuration */}
                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                        <div className="text-gray-900 font-medium">
                          {determineItemType()}
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                        <div className="text-gray-900 font-medium">
                          {selectedPrice ? `$${selectedPrice.price}` : 'Loading...'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                          <select
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Item Price</span>
                      <span className="font-medium">
                        ${selectedPrice ? (selectedPrice.price * quantity).toFixed(2) : '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">$5.00</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-medium text-blue-600">
                        ${selectedPrice ? (selectedPrice.price * quantity + 5).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => onClose()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedBusiness || !selectedPrice || loading || !selectedAddressId}
                  className={`px-4 py-2 rounded-md text-white ${
                    !selectedBusiness || !selectedPrice || loading || !selectedAddressId
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AIOrderComponent;