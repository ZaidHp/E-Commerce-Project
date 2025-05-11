import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { ChevronLeft } from 'lucide-react';
import AuthModal from '../customer_components/AuthModal';

const OrderPage = () => {
  const [orderData, setOrderData] = useState({
    shippingInfo: null,
    products: [],
    addresses: []
  });
  const [loading, setLoading] = useState(true);
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const [cartResponse, addressesResponse] = await Promise.all([
          fetch('http://localhost:8080/api/cart/items', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch('http://localhost:8080/api/addresses', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        ]);

        if (!cartResponse.ok || !addressesResponse.ok) {
          throw new Error('Failed to fetch order data');
        }

        const cartItems = await cartResponse.json();
        const addresses = await addressesResponse.json();

        const user = JSON.parse(atob(token.split('.')[1]));

        setOrderData({
          shippingInfo: addresses.length > 0 ? {
            ...addresses[0],
            name: `${user.firstName} ${user.lastName}`,
            phone: addresses[0].phone_number
          } : null,
          products: cartItems,
          addresses
        });

        if (addresses.length > 0) {
          setSelectedAddressId(addresses[0].address_id);
        }

        setLoading(false);
      } catch (error) {
        toast.error(error.message);
        setLoading(false);
      }
    };

    fetchOrderData();
  }, []);

  const handleAddressChange = (addressId) => {
    setSelectedAddressId(addressId);
    const selected = orderData.addresses.find(a => a.address_id === addressId);
    setOrderData(prev => ({
      ...prev,
      shippingInfo: {
        ...selected,
        name: `${selected.first_name} ${selected.last_name}`,
        phone: selected.phone_number
      }
    }));
  };

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  const saveNewAddress = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8080/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAddress)
      });

      if (!response.ok) {
        throw new Error('Failed to save address');
      }

      const savedAddress = await response.json();
      
      setOrderData(prev => ({
        ...prev,
        addresses: [...prev.addresses, savedAddress],
        shippingInfo: {
          ...savedAddress,
          name: `${savedAddress.first_name} ${savedAddress.last_name}`,
          phone: savedAddress.phone_number
        }
      }));
      
      setSelectedAddressId(savedAddress.address_id);
      setShowAddressForm(false);
      setNewAddress({
        addressType: 'Home',
        address: '',
        city: '',
        country: '',
        phoneNumber: ''
      });
      toast.success('Address saved successfully');
    } catch (error) {
      toast.error(error.message);
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
      const response = await fetch(`http://localhost:8080/api/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete address');
      }
  
      setOrderData(prev => ({
        ...prev,
        addresses: prev.addresses.filter(addr => addr.address_id !== addressId)
      }));
  
      if (selectedAddressId === addressId) {
        const remainingAddresses = orderData.addresses.filter(addr => addr.address_id !== addressId);
        if (remainingAddresses.length > 0) {
          handleAddressChange(remainingAddresses[0].address_id);
        } else {
          setSelectedAddressId(null);
          setOrderData(prev => ({
            ...prev,
            shippingInfo: null
          }));
        }
      }
  
      toast.success('Address deleted successfully');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, remove it!'
      });

      if (!result.isConfirmed) return;
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8080/api/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      setOrderData(prev => ({
        ...prev,
        products: prev.products.filter(item => item.cart_item_id !== itemId)
      }));
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReturnToCart = () => {
    navigate('/cart');
  };

  const handleProceedToPay = async () => {
    try {
      if (!selectedAddressId) {
        toast.error('Please select a shipping address');
        return;
      }

      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8080/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          addressId: selectedAddressId,
          items: orderData.products.map(item => ({
            productId: item.product_id,
            sizeId: item.size_id,
            quantity: item.quantity
          }))
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();
      navigate('/payment', { state: { orderId: order.orders[0].order_id, amount: order.orders[0].total_amount } });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const itemsTotal = orderData.products.reduce((sum, item) => sum + item.product_price * item.quantity, 0);
  const itemCount = orderData.products.reduce((count, item) => count + item.quantity, 0);
  const deliveryFee = orderData.products.length * 2;
  const total = itemsTotal + deliveryFee;
  const isLoggedIn = !!localStorage.getItem('access_token');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
        
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Secure Checkout</h1>
          <p className="text-gray-600 mb-6">
            Login or create an account to proceed with your order and enjoy a faster checkout experience.
          </p>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => {
                setAuthMode('login');
                setShowAuthModal(true);
              }}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              Login to Continue
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setShowAuthModal(true);
              }}
              className="w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors shadow-sm"
            >
              Create Account
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/product')}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center w-full"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center mb-6"></div>
      <div>
          <button
            onClick={handleReturnToCart}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="ml-1 font-medium">Return To Cart</span>
          </button>
        </div>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Section */}
          <div className="lg:w-2/3">
            {/* Shipping & Billing */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Shipping & Billing</h2>
                <button 
                  onClick={() => setShowAddressForm(true)} 
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  {orderData.addresses.length > 0 ? 'Add New' : 'Add Address'}
                </button>
              </div>

              {showAddressForm ? (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Address</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                      <select
                        name="addressType"
                        value={newAddress.addressType}
                        onChange={handleNewAddressChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Full address"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          name="city"
                          value={newAddress.city}
                          onChange={handleNewAddressChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        onClick={() => setShowAddressForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveNewAddress}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Save Address
                      </button>
                    </div>
                  </div>
                </div>
              ) : orderData.addresses.length > 0 ? (
                <div className="p-6">
                  <div className="space-y-4">
                    {orderData.addresses.map(address => (
                      <div 
                        key={address.address_id} 
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedAddressId === address.address_id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => handleAddressChange(address.address_id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center mb-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                address.address_type === 'Home' ? 'bg-red-100 text-red-800' :
                                address.address_type === 'Office' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {address.address_type}
                              </span>
                              <span className="ml-2 font-medium text-gray-900">{address.first_name} {address.last_name}</span>
                              <span className="ml-2 text-gray-500">{address.phone_number}</span>
                            </div>
                            <p className="text-gray-700">{address.address}</p>
                            <p className="text-gray-700">{address.city}, {address.country}</p>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="selectedAddress"
                              checked={selectedAddressId === address.address_id}
                              onChange={() => handleAddressChange(address.address_id)}
                              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAddress(address.address_id);
                              }}
                              className="ml-3 text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete address"
                              disabled={isDeleting}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No shipping addresses</h3>
                  <p className="mt-1 text-sm text-gray-500">Add a shipping address to continue with your order.</p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Address
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Order Items ({orderData.products.length})</h2>
              </div>
              <div className="p-6">
                {orderData.products.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {orderData.products.map((product) => (
                      <li key={product.cart_item_id} className="py-6 flex">
                        <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden">
                          <img
                            // src={`http://localhost:8080${product.image_url}`}
                            src={product.image_url}
                            alt={product.product_name}
                            className="w-full h-full object-center object-cover"
                          />
                        </div>

                        <div className="ml-4 flex-1 flex flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3>{product.product_name}</h3>
                              <p className="ml-4">${product.product_price}</p>
                            </div>
                            <div className="flex mt-1 text-sm text-gray-500 space-x-2">
                              <div className="flex items-center">
                                <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ backgroundColor: product.color_code }}></span>
                                {product.color_name}
                              </div>
                              <div>|</div>
                              <div>Size: {product.size}</div>
                            </div>
                          </div>
                          <div className="flex-1 flex items-end justify-between text-sm">
                            <p className="text-gray-500">Qty {product.quantity}</p>

                            <div className="flex">
                              <button
                                type="button"
                                onClick={() => deleteItem(product.cart_item_id)}
                                className="font-medium text-red-600 hover:text-red-500"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                    <p className="mt-1 text-sm text-gray-500">Start adding some products to your cart.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => navigate('/product')}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </div>
                )}
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
                    <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                    <span className="font-medium">${itemsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-4">
                    <span className="text-base font-medium text-gray-900">Total</span>
                    <span className="text-base font-medium text-gray-900">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleProceedToPay}
                  disabled={orderData.products.length === 0 || !selectedAddressId}
                  className={`mt-6 w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    orderData.products.length === 0 || !selectedAddressId
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Proceed to Payment
                </button>

                <p className="mt-4 text-center text-sm text-gray-500">
                  VAT included, where applicable
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderPage;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import Swal from 'sweetalert2';
// import { ChevronLeft } from 'lucide-react';
// import AuthModal from '../customer_components/AuthModal';
// import PayFastButton from '../customer_components/PayFastButton';

// const OrderPage = () => {
//   const [orderData, setOrderData] = useState({
//     shippingInfo: null,
//     products: [],
//     addresses: []
//   });
//   const [loading, setLoading] = useState(true);
//   const [selectedAddressId, setSelectedAddressId] = useState(null);
//   const [newAddress, setNewAddress] = useState({
//     addressType: 'Home',
//     address: '',
//     city: '',
//     country: '',
//     phoneNumber: ''
//   });
//   const [showAddressForm, setShowAddressForm] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const [authMode, setAuthMode] = useState('login');
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchOrderData = async () => {
//       try {
//         const token = localStorage.getItem('access_token');
//         if (!token) {
//           setLoading(false);
//           return;
//         }

//         const [cartResponse, addressesResponse] = await Promise.all([
//           fetch('http://localhost:8080/api/cart/items', {
//             headers: {
//               'Authorization': `Bearer ${token}`
//             }
//           }),
//           fetch('http://localhost:8080/api/addresses', {
//             headers: {
//               'Authorization': `Bearer ${token}`
//             }
//           })
//         ]);

//         if (!cartResponse.ok || !addressesResponse.ok) {
//           throw new Error('Failed to fetch order data');
//         }

//         const cartItems = await cartResponse.json();
//         const addresses = await addressesResponse.json();

//         const user = JSON.parse(atob(token.split('.')[1]));

//         setOrderData({
//           shippingInfo: addresses.length > 0 ? {
//             ...addresses[0],
//             name: `${user.firstName} ${user.lastName}`,
//             phone: addresses[0].phone_number
//           } : null,
//           products: cartItems,
//           addresses
//         });

//         if (addresses.length > 0) {
//           setSelectedAddressId(addresses[0].address_id);
//         }

//         setLoading(false);
//       } catch (error) {
//         toast.error(error.message);
//         setLoading(false);
//       }
//     };

//     fetchOrderData();
//   }, []);

//   const handleAddressChange = (addressId) => {
//     setSelectedAddressId(addressId);
//     const selected = orderData.addresses.find(a => a.address_id === addressId);
//     setOrderData(prev => ({
//       ...prev,
//       shippingInfo: {
//         ...selected,
//         name: `${selected.first_name} ${selected.last_name}`,
//         phone: selected.phone_number
//       }
//     }));
//   };

//   const handleNewAddressChange = (e) => {
//     const { name, value } = e.target;
//     setNewAddress(prev => ({ ...prev, [name]: value }));
//   };

//   const saveNewAddress = async () => {
//     try {
//       const token = localStorage.getItem('access_token');
//       const response = await fetch('http://localhost:8080/api/addresses', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(newAddress)
//       });

//       if (!response.ok) {
//         throw new Error('Failed to save address');
//       }

//       const savedAddress = await response.json();
      
//       setOrderData(prev => ({
//         ...prev,
//         addresses: [...prev.addresses, savedAddress],
//         shippingInfo: {
//           ...savedAddress,
//           name: `${savedAddress.first_name} ${savedAddress.last_name}`,
//           phone: savedAddress.phone_number
//         }
//       }));
      
//       setSelectedAddressId(savedAddress.address_id);
//       setShowAddressForm(false);
//       setNewAddress({
//         addressType: 'Home',
//         address: '',
//         city: '',
//         country: '',
//         phoneNumber: ''
//       });
//       toast.success('Address saved successfully');
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const deleteAddress = async (addressId) => {
//     if (isDeleting) return;
    
//     try {
//       const result = await Swal.fire({
//         title: 'Are you sure?',
//         text: "You won't be able to revert this!",
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#2563eb',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Yes, delete it!'
//       });

//       if (!result.isConfirmed) return;
//       setIsDeleting(true);
//       const token = localStorage.getItem('access_token');
//       const response = await fetch(`http://localhost:8080/api/addresses/${addressId}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
  
//       if (!response.ok) {
//         throw new Error('Failed to delete address');
//       }
  
//       setOrderData(prev => ({
//         ...prev,
//         addresses: prev.addresses.filter(addr => addr.address_id !== addressId)
//       }));
  
//       if (selectedAddressId === addressId) {
//         const remainingAddresses = orderData.addresses.filter(addr => addr.address_id !== addressId);
//         if (remainingAddresses.length > 0) {
//           handleAddressChange(remainingAddresses[0].address_id);
//         } else {
//           setSelectedAddressId(null);
//           setOrderData(prev => ({
//             ...prev,
//             shippingInfo: null
//           }));
//         }
//       }
  
//       toast.success('Address deleted successfully');
//     } catch (error) {
//       toast.error(error.message);
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const deleteItem = async (itemId) => {
//     try {
//       const result = await Swal.fire({
//         title: 'Are you sure?',
//         text: "You won't be able to revert this!",
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#2563eb',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Yes, remove it!'
//       });

//       if (!result.isConfirmed) return;
//       const token = localStorage.getItem('access_token');
//       const response = await fetch(`http://localhost:8080/api/cart/items/${itemId}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Failed to remove item');
//       }

//       setOrderData(prev => ({
//         ...prev,
//         products: prev.products.filter(item => item.cart_item_id !== itemId)
//       }));
//       toast.success('Item removed from cart');
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const handleReturnToCart = () => {
//     navigate('/cart');
//   };

//   const handleProceedToPay = async () => {
//     try {
//       if (!selectedAddressId) {
//         toast.error('Please select a shipping address');
//         return;
//       }

//       const token = localStorage.getItem('access_token');
//       const response = await fetch('http://localhost:8080/api/checkout', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           addressId: selectedAddressId,
//           items: orderData.products.map(item => ({
//             productId: item.product_id,
//             sizeId: item.size_id,
//             quantity: item.quantity
//           }))
//         })
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to create order');
//       }

//       const order = await response.json();
//       navigate('/payment', { state: { orderId: order.order_id, amount: order.total_amount } });
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const itemsTotal = orderData.products.reduce((sum, item) => sum + item.product_price * item.quantity, 0);
//   const itemCount = orderData.products.reduce((count, item) => count + item.quantity, 0);
//   const deliveryFee = orderData.products.length * 2;
//   const total = itemsTotal + deliveryFee;
//   const isLoggedIn = !!localStorage.getItem('access_token');

//   if (loading) return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//     </div>
//   );

//   if (!isLoggedIn) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//         <AuthModal 
//           isOpen={showAuthModal} 
//           onClose={() => setShowAuthModal(false)}
//           initialMode={authMode}
//         />
        
//         <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
//           <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
//             </svg>
//           </div>
          
//           <h1 className="text-2xl font-bold text-gray-900 mb-3">Secure Checkout</h1>
//           <p className="text-gray-600 mb-6">
//             Login or create an account to proceed with your order and enjoy a faster checkout experience.
//           </p>
          
//           <div className="flex flex-col space-y-3">
//             <button
//               onClick={() => {
//                 setAuthMode('login');
//                 setShowAuthModal(true);
//               }}
//               className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
//             >
//               Login to Continue
//             </button>
//             <button
//               onClick={() => {
//                 setAuthMode('signup');
//                 setShowAuthModal(true);
//               }}
//               className="w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors shadow-sm"
//             >
//               Create Account
//             </button>
//           </div>
          
//           <div className="mt-6 pt-6 border-t border-gray-200">
//             <button
//               onClick={() => navigate('/product')}
//               className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center w-full"
//             >
//               Continue Shopping
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="flex items-center mb-6"></div>
//       <div>
//           <button
//             onClick={handleReturnToCart}
//             className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
//           >
//             <ChevronLeft className="w-5 h-5" />
//             <span className="ml-1 font-medium">Return To Cart</span>
//           </button>
//         </div>
//       <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
//         <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
//         <div className="flex flex-col lg:flex-row gap-8">
//           {/* Left Section */}
//           <div className="lg:w-2/3">
//             {/* Shipping & Billing */}
//             <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
//               <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//                 <h2 className="text-xl font-semibold text-gray-800">Shipping & Billing</h2>
//                 <button 
//                   onClick={() => setShowAddressForm(true)} 
//                   className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
//                   </svg>
//                   {orderData.addresses.length > 0 ? 'Add New' : 'Add Address'}
//                 </button>
//               </div>

//               {showAddressForm ? (
//                 <div className="p-6">
//                   <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Address</h3>
//                   <div className="space-y-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
//                       <select
//                         name="addressType"
//                         value={newAddress.addressType}
//                         onChange={handleNewAddressChange}
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                       >
//                         <option value="Home">Home</option>
//                         <option value="Office">Office</option>
//                         <option value="Other">Other</option>
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
//                       <input
//                         type="text"
//                         name="address"
//                         value={newAddress.address}
//                         onChange={handleNewAddressChange}
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                         placeholder="Full address"
//                       />
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
//                         <input
//                           type="text"
//                           name="city"
//                           value={newAddress.city}
//                           onChange={handleNewAddressChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="City"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
//                         <input
//                           type="text"
//                           name="country"
//                           value={newAddress.country}
//                           onChange={handleNewAddressChange}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                           placeholder="Country"
//                         />
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
//                       <input
//                         type="text"
//                         name="phoneNumber"
//                         value={newAddress.phoneNumber}
//                         onChange={handleNewAddressChange}
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                         placeholder="Phone number"
//                       />
//                     </div>
//                     <div className="flex justify-end space-x-3 pt-2">
//                       <button
//                         onClick={() => setShowAddressForm(false)}
//                         className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         onClick={saveNewAddress}
//                         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//                       >
//                         Save Address
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ) : orderData.addresses.length > 0 ? (
//                 <div className="p-6">
//                   <div className="space-y-4">
//                     {orderData.addresses.map(address => (
//                       <div 
//                         key={address.address_id} 
//                         className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedAddressId === address.address_id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
//                         onClick={() => handleAddressChange(address.address_id)}
//                       >
//                         <div className="flex justify-between items-start">
//                           <div>
//                             <div className="flex items-center mb-2">
//                               <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                                 address.address_type === 'Home' ? 'bg-red-100 text-red-800' :
//                                 address.address_type === 'Office' ? 'bg-blue-100 text-blue-800' :
//                                 'bg-gray-100 text-gray-800'
//                               }`}>
//                                 {address.address_type}
//                               </span>
//                               <span className="ml-2 font-medium text-gray-900">{address.first_name} {address.last_name}</span>
//                               <span className="ml-2 text-gray-500">{address.phone_number}</span>
//                             </div>
//                             <p className="text-gray-700">{address.address}</p>
//                             <p className="text-gray-700">{address.city}, {address.country}</p>
//                           </div>
//                           <div className="flex items-center">
//                             <input
//                               type="radio"
//                               name="selectedAddress"
//                               checked={selectedAddressId === address.address_id}
//                               onChange={() => handleAddressChange(address.address_id)}
//                               className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
//                             />
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 deleteAddress(address.address_id);
//                               }}
//                               className="ml-3 text-gray-400 hover:text-red-500 transition-colors"
//                               title="Delete address"
//                               disabled={isDeleting}
//                             >
//                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                                 <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
//                               </svg>
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="p-6 text-center">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//                   </svg>
//                   <h3 className="mt-2 text-sm font-medium text-gray-900">No shipping addresses</h3>
//                   <p className="mt-1 text-sm text-gray-500">Add a shipping address to continue with your order.</p>
//                   <div className="mt-6">
//                     <button
//                       onClick={() => setShowAddressForm(true)}
//                       className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                     >
//                       <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
//                       </svg>
//                       Add Address
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Order Items */}
//             <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//               <div className="px-6 py-4 border-b border-gray-200">
//                 <h2 className="text-xl font-semibold text-gray-800">Order Items ({orderData.products.length})</h2>
//               </div>
//               <div className="p-6">
//                 {orderData.products.length > 0 ? (
//                   <ul className="divide-y divide-gray-200">
//                     {orderData.products.map((product) => (
//                       <li key={product.cart_item_id} className="py-6 flex">
//                         <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden">
//                           <img
//                             // src={`http://localhost:8080${product.image_url}`}
//                             src={product.image_url}
//                             alt={product.product_name}
//                             className="w-full h-full object-center object-cover"
//                           />
//                         </div>

//                         <div className="ml-4 flex-1 flex flex-col">
//                           <div>
//                             <div className="flex justify-between text-base font-medium text-gray-900">
//                               <h3>{product.product_name}</h3>
//                               <p className="ml-4">${product.product_price}</p>
//                             </div>
//                             <div className="flex mt-1 text-sm text-gray-500 space-x-2">
//                               <div className="flex items-center">
//                                 <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ backgroundColor: product.color_code }}></span>
//                                 {product.color_name}
//                               </div>
//                               <div>|</div>
//                               <div>Size: {product.size}</div>
//                             </div>
//                           </div>
//                           <div className="flex-1 flex items-end justify-between text-sm">
//                             <p className="text-gray-500">Qty {product.quantity}</p>

//                             <div className="flex">
//                               <button
//                                 type="button"
//                                 onClick={() => deleteItem(product.cart_item_id)}
//                                 className="font-medium text-red-600 hover:text-red-500"
//                               >
//                                 Remove
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       </li>
//                     ))}
//                   </ul>
//                 ) : (
//                   <div className="text-center py-8">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
//                     </svg>
//                     <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
//                     <p className="mt-1 text-sm text-gray-500">Start adding some products to your cart.</p>
//                     <div className="mt-6">
//                       <button
//                         onClick={() => navigate('/product')}
//                         className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                       >
//                         Continue Shopping
//                       </button>
//                     </div>
//                   </div>
//                 )}
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
//                     <span className="text-gray-600">Subtotal ({itemCount} items)</span>
//                     <span className="font-medium">${itemsTotal.toFixed(2)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Shipping</span>
//                     <span className="font-medium">${deliveryFee.toFixed(2)}</span>
//                   </div>
//                   <div className="flex justify-between border-t border-gray-200 pt-4">
//                     <span className="text-base font-medium text-gray-900">Total</span>
//                     <span className="text-base font-medium text-gray-900">${total.toFixed(2)}</span>
//                   </div>
//                 </div>

//                 {orderData.products.length === 0 || !selectedAddressId ? (
//                   <button
//                     disabled
//                     className="mt-6 w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-400 cursor-not-allowed"
//                   >
//                     Proceed to Payment
//                   </button>
//                 ) : (
//                   <PayFastButton 
//                     orderId={orderData.products.map(item => ({productId: item.product_id}))} // You'll need to get this from your order creation response
//                     amount={total.toFixed(2)} 
//                   />
//                 )}

//                 <p className="mt-4 text-center text-sm text-gray-500">
//                   VAT included, where applicable
//                 </p>
//               </div>
//             </div>
//           </div>

//         </div>
//       </main>
//     </div>
//   );
// };

// export default OrderPage;