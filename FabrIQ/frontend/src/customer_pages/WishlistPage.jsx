import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ChevronRight, Star, ChevronLeft } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthModal from '../customer_components/AuthModal';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:8080/api/wishlist', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setWishlistItems(data.items);
        } else {
          throw new Error('Failed to fetch wishlist');
        }
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        toast.error('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setAuthMode('login');
        setShowAuthModal(true);
        toast.info('Please login to manage your wishlist');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/wishlist/${productId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setWishlistItems(wishlistItems.filter(item => item.product_id !== productId));
        window.dispatchEvent(new Event('wishlistUpdated'));
        toast.success('Removed from wishlist');
      } else {
        throw new Error('Failed to remove from wishlist');
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      toast.error('Failed to remove from wishlist');
    }
  };

  const navigateToProduct = (urlKey) => {
    navigate(`/product/viewProduct/${urlKey}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  const isLoggedIn = !!localStorage.getItem('access_token');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />

      <div className="max-w-7xl mx-auto">
        {!isLoggedIn ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center max-w-2xl mx-auto">
            <div className="mx-auto w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-pink-500" fill="#ec4899" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Your Personal Wishlist</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Login or create an account to save your favorite items and access them anytime from any device.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
              >
                Login to View Wishlist
              </button>
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                Create Account
              </button>
            </div>

            <p className="mt-8 text-sm text-gray-500">
              Your wishlist will be saved and synced across all your devices.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Your Wishlist</h1>
              <span className="text-gray-600">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {wishlistItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="mx-auto max-w-md">
                  <svg
                    className="mx-auto h-24 w-24 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <h3 className="mt-4 text-xl font-medium text-gray-900">Your wishlist is empty</h3>
                  <p className="mt-2 text-gray-500">
                    Save items you love by clicking the heart icon on products
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => navigate('/product')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {wishlistItems.map((item) => (
                  <div
                    key={item.product_id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-square">
                      {item.image_url ? (
                        <img
                          // src={`http://localhost:8080${item.image_url}`}
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => navigateToProduct(item.url_key)}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromWishlist(item.product_id);
                        }}
                        className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                        aria-label="Remove from wishlist"
                      >
                        <Heart className="w-5 h-5 text-red-500" fill="#ef4444" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3
                        className="font-medium text-gray-900 mb-1 cursor-pointer hover:text-gray-600 line-clamp-2"
                        onClick={() => navigateToProduct(item.url_key)}
                      >
                        {item.product_name}
                      </h3>
                      
                      <div className="flex items-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-4 h-4"
                            fill={
                              item.average_rating 
                              ? star <= Math.round(item.average_rating) 
                              ? '#FFD700' 
                              : '#E5E7EB'
                              : '#E5E7EB'
                            }
                            stroke={
                              item.average_rating 
                              ? star <= Math.round(item.average_rating) 
                              ? '#FFD700' 
                              : '#E5E7EB'
                              : '#E5E7EB'
                            }
                          />
                        ))}
                        {item.average_rating && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({item.average_rating.toFixed(1)})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-gray-900">
                          ${parseFloat(item.product_price).toFixed(2)}
                        </p>
                        <button
                          onClick={() => navigateToProduct(item.url_key)}
                          className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          View details <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;