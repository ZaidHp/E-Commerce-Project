import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../customer_components/AuthModal'

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClearingCart, setIsClearingCart] = useState(false);
  const [isUpdatingQuantities, setIsUpdatingQuantities] = useState({});
  const [isRemovingItems, setIsRemovingItems] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const shippingFee = 4;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:8080/api/cart/items', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cart items');
        }

        const data = await response.json();
        setCartItems(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const calculateTotal = (items) => {
    return items.reduce((total, item) => total + (item.product_price * item.quantity), 0);
  };

  const handleContinueShopping = () => {
    navigate('/product');
  };

  const handleProceed = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setAuthMode('login');
      setShowAuthModal(true);
      toast.info('Please login to proceed to checkout');
      return;
    }
    navigate('/checkout');
  };

  const updateQuantity = async (itemId, delta) => {
    try {
      setIsUpdatingQuantities(prev => ({ ...prev, [itemId]: true }));
      const token = localStorage.getItem('access_token');
      const item = cartItems.find(i => i.cart_item_id === itemId);
      const newQuantity = item.quantity + delta;

      if (newQuantity < 1) return;

      const response = await fetch(`http://localhost:8080/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      setCartItems(prev =>
        prev.map(item =>
          item.cart_item_id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      toast.success('Quantity updated');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUpdatingQuantities(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const removeItem = async (itemId) => {
    try {
      setIsRemovingItems(prev => ({ ...prev, [itemId]: true }));
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

      setCartItems(prev => prev.filter(item => item.cart_item_id !== itemId));
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsRemovingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const clearCart = async () => {
    try {
      setIsClearingCart(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8080/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      setCartItems([]);
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Cart cleared');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsClearingCart(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <p className="mt-4 text-lg font-medium text-gray-700">Loading your cart...</p>
      </div>
    </div>
  );

  const isLoggedIn = !!localStorage.getItem('access_token');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <button
            onClick={handleContinueShopping}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="ml-1 font-medium">Back to shopping</span>
          </button>
        </div>

        {!isLoggedIn ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center mt-8 max-w-2xl mx-auto">
            <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">Your Shopping Cart Awaits</h2>
            <p className="text-gray-500 mb-6">Please login or create an account to view and manage your cart items.</p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
              >
                Login
              </button>
              <button
                className="px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors shadow-sm"
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }}
              >
                Create Account
              </button>
            </div>
            
            <p className="mt-6 text-sm text-gray-500">
              By creating an account, you can save items to your cart and access them anytime.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center mb-6"></div>
            <div className="flex items-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 ml-4">Your Shopping Cart</h1>
              {cartItems.length > 0 && (
                <span className="ml-auto bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
                <button
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                  onClick={handleContinueShopping}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-2/3">
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {cartItems.map((item) => (
                      <div
                        key={item.cart_item_id}
                        className="flex flex-col sm:flex-row p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-full sm:w-32 flex-shrink-0 mb-4 sm:mb-0">
                          <img
                            // src={`http://localhost:8080${item.image_url}`}
                            src={item.image_url}
                            alt={item.product_name}
                            className="w-full h-32 object-contain rounded-lg"
                          />
                        </div>
                        <div className="flex-grow px-4">
                          <div className="flex justify-between">
                            <h2 className="text-lg font-medium text-gray-900 line-clamp-2">
                              {item.product_name}
                            </h2>
                            <button
                              onClick={() => removeItem(item.cart_item_id)}
                              disabled={isRemovingItems[item.cart_item_id]}
                              className="text-gray-400 hover:text-red-500 transition-colors ml-4"
                            >
                              {isRemovingItems[item.cart_item_id] ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Trash2 className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-y-2">
                            <div className="w-full sm:w-1/2">
                              <p className="text-sm text-gray-500">
                                Color: <span className="inline-block w-4 h-4 rounded-full mr-2 border border-gray-200" 
                                          style={{ backgroundColor: item.color_code }}></span>
                                {item.color_name}
                              </p>
                            </div>
                            <div className="w-full sm:w-1/2">
                              <p className="text-sm text-gray-500">Size: {item.size}</p>
                            </div>
                            <div className="w-full sm:w-1/2">
                              <p className="text-sm text-gray-500">Price: ${item.product_price}</p>
                            </div>
                            <div className="w-full sm:w-1/2">
                              <p className="text-sm font-medium text-gray-900">
                                Total: ${(item.quantity * item.product_price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center">
                            <button
                              onClick={() => updateQuantity(item.cart_item_id, -1)}
                              disabled={isUpdatingQuantities[item.cart_item_id]}
                              className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-md hover:bg-gray-100 transition-colors"
                            >
                              {isUpdatingQuantities[item.cart_item_id] ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Minus className="w-5 h-5" />
                              )}
                            </button>
                            <div className="w-12 h-10 flex items-center justify-center border-t border-b border-gray-300 bg-gray-50 text-center">
                              {item.quantity}
                            </div>
                            <button
                              onClick={() => updateQuantity(item.cart_item_id, 1)}
                              disabled={isUpdatingQuantities[item.cart_item_id]}
                              className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-md hover:bg-gray-100 transition-colors"
                            >
                              {isUpdatingQuantities[item.cart_item_id] ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Plus className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap justify-between gap-4">
                    <button
                      className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={handleContinueShopping}
                    >
                      Continue Shopping
                    </button>
                    <button
                      onClick={clearCart}
                      disabled={isClearingCart}
                      className="px-6 py-2 bg-red-50 border border-red-100 rounded-lg font-medium text-red-600 hover:bg-red-100 transition-colors flex items-center"
                    >
                      {isClearingCart ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Clearing...
                        </>
                      ) : (
                        'Clear Cart'
                      )}
                    </button>
                  </div>
                </div>

                <div className="lg:w-1/3">
                  <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">${calculateTotal(cartItems).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium">${shippingFee.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-gray-200 my-2"></div>
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-lg font-bold text-gray-900">
                          ${(calculateTotal(cartItems) + shippingFee).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <button
                      className="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                      onClick={handleProceed}
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;