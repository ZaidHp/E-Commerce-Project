import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiUser, FiHeart, FiMenu, FiX, FiSettings, FiPackage, FiLogOut } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';
import { Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import AuthModal from './AuthModal';
import { logoutUser } from '../utility/logoutUser';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [wishlistItemsCount, setWishlistItemsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState({});
  const cartDropdownRef = useRef(null);
  const cartIconRef = useRef(null);
  const wishlistDropdownRef = useRef(null);
  const wishlistIconRef = useRef(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authContext, setAuthContext] = useState('');
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountDropdownRef = useRef(null);
  const accountIconRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch('http://localhost:8080/api/cart/count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch cart count');
      
      const data = await response.json();
      setCartItemsCount(data.count);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const fetchWishlistCount = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch('http://localhost:8080/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch wishlist items');
      
      const data = await response.json();
      setWishlistItemsCount(data.items.length);
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
    }
  };

  const fetchCartItems = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch('http://localhost:8080/api/cart/items', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch cart items');
      
      const data = await response.json();
      setCartItems(data);
      setCartItemsCount(data.reduce((total, item) => total + item.quantity, 0));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWishlistItems = async () => {
    try {
      setIsWishlistLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch('http://localhost:8080/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch wishlist items');
      
      const data = await response.json();
      setWishlistItems(data.items);
      setWishlistItemsCount(data.items.length);
    } catch (error) {
      toast.error('Error fetching wishlist items');
      console.error('Error fetching wishlist items:', error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  useEffect(() => {
    fetchCartCount();
    fetchWishlistCount();
    
    const handleCartUpdate = () => {
      fetchCartCount();
      if (isCartOpen) fetchCartItems();
    };
    
    const handleWishlistUpdate = () => {
      fetchWishlistCount();
      if (isWishlistOpen) fetchWishlistItems();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, [isCartOpen, isWishlistOpen]);

  // Handle clicks outside cart dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        accountDropdownRef.current && 
        !accountDropdownRef.current.contains(event.target) &&
        accountIconRef.current && 
        !accountIconRef.current.contains(event.target) &&
        isAccountOpen
      ) {
      setIsAccountOpen(false);
      }
      
      if (
        cartDropdownRef.current && 
        !cartDropdownRef.current.contains(event.target) &&
        cartIconRef.current && 
        !cartIconRef.current.contains(event.target) &&
        isCartOpen
      ) {
        setIsCartOpen(false);
      }

      if (
        wishlistDropdownRef.current && 
        !wishlistDropdownRef.current.contains(event.target) &&
        wishlistIconRef.current && 
        !wishlistIconRef.current.contains(event.target) &&
        isWishlistOpen
      ) {
        setIsWishlistOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCartOpen, isWishlistOpen, isAccountOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/product/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  const handleAccountHover = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setAuthContext('account');
      return;
    }
  };

  const handleCartHover = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setAuthContext('cart');
      return;
    }
    fetchCartItems();
  };

  const handleWishlistHover = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setAuthContext('wishlist');
      return;
    }
    fetchWishlistItems();
  };

  const handleAccountIconClick = (e) => {
    e.preventDefault();
    if (localStorage.getItem('access_token')) {
      navigate('/account');
    } else {
      navigate('/auth');
    }
  };

  const handleCartIconClick = (e) => {
    e.preventDefault();
    navigate('/cart');
    // if (isCartOpen) {
    //   navigate('/cart');
    // } else {
    //   setIsCartOpen(true);
    // }
  };

  const handleWishlistIconClick = (e) => {
    e.preventDefault();
    navigate('/wishlist');
    // if (isWishlistOpen) {
    //   navigate('/wishlist');
    // } else {
    //   setIsWishlistOpen(true);
    // }
  };

  const handleLogout = async () => {
    await logoutUser();
    // toast.success('Successfully logged out');
    navigate('/auth');
    setIsAccountOpen(false);
  };

  const removeFromWishlist = async (productId) => {
    try {
      setIsRemoving(prev => ({ ...prev, [`wish-${productId}`]: true }));
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8080/api/wishlist/${productId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to remove item from wishlist');

      const data = await response.json();
      if (data.action === 'removed') {
        setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
        setWishlistItemsCount(prev => prev - 1);
        toast.success('Item removed from wishlist');
        window.dispatchEvent(new Event('wishlistUpdated'));
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsRemoving(prev => ({ ...prev, [`wish-${productId}`]: false }));
    }
  };

  const removeItem = async (itemId) => {
    try {
      setIsRemoving(prev => ({ ...prev, [itemId]: true }));
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8080/api/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to remove item');

      setCartItems(prev => prev.filter(item => item.cart_item_id !== itemId));
      setCartItemsCount(prev => prev - 1);
      toast.success('Item removed from cart');
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsRemoving(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product_price * item.quantity), 0);
  };

  const categories = [
    { name: 'New Arrivals', path: '/product' },
    { name: 'Men', path: '/product/category/Men', subcategories: [
      { name: 'T-Shirts', path: '/product/category/Men>T-Shirts' },
      { name: 'Jeans', path: '/product/category/Men>Jeans' },
      { name: 'Jackets', path: '/product/category/Men>jackets' }
    ]},
    { name: 'Women', path: '/product/category/Women',  subcategories: [
      { name: 'T-Shirts', path: '/product/category/Women>T-Shirts' },
      { name: 'Jeans', path: '/product/category/Women>jeans' },
      { name: 'Jackets', path: '/product/category/Women>jackets' }
    ]},
    // { name: 'Products', path: '/product' },
    { name: 'AI Products', path: '/order-AIcustomize-product', highlight: true }
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-black text-white text-center py-2 px-4 text-sm">
        Free shipping on all orders over $50 | Use code <span className="font-bold">FABRIQ10</span> for 10% off
      </div>

      {/* Main Navbar */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                <span className="text-indigo-600">fabr</span>
                <span className="text-gray-800">IQ</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {categories.map((category) => (
                <div key={category.name} className="relative group">
                  <Link 
                    to={category.path} 
                    className={`flex items-center px-1 py-2 text-sm font-medium ${category.highlight ? 'text-red-600' : 'text-gray-700 hover:text-indigo-600'}`}
                  >
                    {category.name}
                    {category.subcategories && <IoIosArrowDown className="ml-1 text-xs opacity-70" />}
                  </Link>
                  
                  {category.subcategories && (
                    <div className="absolute left-0 mt-0 w-48 bg-white shadow-lg rounded-md py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      {category.subcategories.map((sub) => (
                        <Link 
                          key={sub.name}
                          to={sub.path}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {/* Search Icon - Desktop */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-600 hover:text-indigo-600 hidden md:block"
                aria-label="Search"
              >
                <FiSearch size={20} />
              </button>

              {/* Account */}
              <div 
                className="relative group" 
                onMouseEnter={handleAccountHover}
              >
                <button 
                  ref={accountIconRef}
                  className="p-2 text-gray-600 hover:text-indigo-600 hidden md:block"
                  aria-label="Account"
                  onClick={handleAccountIconClick}
                >
                  <FiUser size={20} />
                </button>
                {/* Account Dropdown */}
                {/* <div 
                  ref={accountDropdownRef}
                  className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200"
                  style={{ visibility: isAccountOpen ? 'visible' : '', opacity: isAccountOpen ? '1' : '' }}
                >
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Your Account</h3>
                    </div>
                  </div>

                  {!localStorage.getItem('access_token') ? (
                    <div className="p-6 text-center">
                      <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                        <FiUser size={24} className="text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to fabrIQ</h3>
                      <p className="text-gray-600 mb-4">Sign in to access your account and manage your orders</p>
                      <div className="flex flex-col space-y-3">
                        <button
                          onClick={() => {
                            setAuthMode('login');
                            setShowAuthModal(true);
                          }}
                          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
                        >
                          Sign In
                        </button>
                        <button
                          onClick={() => {
                            setAuthMode('signup');
                            setShowAuthModal(true);
                          }}
                          className="w-full py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition-colors"
                        >
                          Create Account
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2">
                      <div className="px-6 py-4">
                        <p className="text-gray-600 mb-1">Signed in as</p>
                        <p className="text-lg font-medium text-gray-900">{localStorage.getItem('name') || 'Customer'}</p>
                      </div>
                      <div className="border-t border-gray-100">
                        <Link
                          to="/account/info"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                        >
                          <FiSettings className="mr-3" size={18} />
                          <span>Account Information</span>
                        </Link>
                        
                        <Link
                          to="/account/order"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                        >
                          <FiPackage className="mr-3" size={18} />
                          <span>My Orders</span>
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 mt-2 pt-2 px-6 pb-4">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md font-medium transition-colors mt-2"
                        >
                          <FiLogOut className="mr-2" size={18} />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div> */}

              {/* Account Dropdown */}
              <div 
                ref={accountDropdownRef}
                className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200"
                style={{ visibility: isAccountOpen ? 'visible' : '', opacity: isAccountOpen ? '1' : '' }}
              >
                {!localStorage.getItem('access_token') ? (
                  <div className="p-4">
                    <div className="text-center mb-4">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <FiUser size={24} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Welcome</h3>
                      <p className="text-sm text-gray-600">Sign in to access your account</p>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/auth');
                        setIsAccountOpen(false);
                      }}
                      className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
                    >
                      Sign In
                    </button>
                    <p className="mt-3 text-xs text-center text-gray-500">
                      New customer?{' '}
                      <button 
                        onClick={() => {
                          navigate('/auth/signup');
                          setIsAccountOpen(false);
                        }}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        Create an account
                      </button>
                    </p>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-indigo-800 font-medium text-lg">
                          {localStorage.getItem("name")?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Hi, {localStorage.getItem("name") || 'User'}
                        </h3>
                        <p className="text-sm text-gray-500">Welcome back</p>
                      </div>
                    </div>
        
                    <div className="space-y-2">
                    <button
                      onClick={() => {
                        navigate('/account/info');
                        setIsAccountOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center"
                    >
                      <FiUser className="mr-2" size={16} />
                      Account Information
                    </button>
                    <button
                      onClick={() => {
                        navigate('/account/order');
                        setIsAccountOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center"
                    >
                      <FiShoppingBag className="mr-2" size={16} />
                      My Orders
                    </button>
                  </div>
        
                  <button
                    // onClick={() => {
                    //   logoutUser();
                    //   setIsAccountOpen(false);
                    //   navigate('/auth');
                    // }}
                    onClick={handleLogout}
                    className="w-full mt-4 py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 flex items-center justify-center"
                  >
                    <FiX className="mr-2" size={16} />
                    Sign Out
                  </button>
                </div>
                )}
              </div>
            </div>

              {/* Wishlist */}
              <div 
                className="relative group" 
                onMouseEnter={() => {
                  handleWishlistHover();
                }}
              >
                <button 
                  ref={wishlistIconRef}
                  className="p-2 text-gray-600 hover:text-black relative hidden md:block group"
                  aria-label="Wishlist"
                  onClick={handleWishlistIconClick}
                >
                  <FiHeart 
                    size={20} 
                    className="group-hover:fill-black" 
                    fill="transparent"
                  />
                  {wishlistItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistItemsCount}
                    </span>
                  )}
                </button>
                
                {/* Auth Modal */}
                {/* <AuthModal 
                  isOpen={showAuthModal} 
                  onClose={() => setShowAuthModal(false)}
                  initialMode={authMode}
                /> */}

                {/* Wishlist Dropdown */}
                <div 
                  ref={wishlistDropdownRef}
                  className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200"
                  style={{ visibility: isWishlistOpen ? 'visible' : '', opacity: isWishlistOpen ? '1' : '' }}
                >
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Your Wishlist ({wishlistItemsCount})</h3>
                      {/* <button 
                        onClick={() => setIsWishlistOpen(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <FiX size={20} />
                      </button> */}
                    </div>
                  </div>

                  {!localStorage.getItem('access_token') ? (
                    <div className="p-6 text-center">
                      <div className="mx-auto w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                        <FiHeart size={24} className="text-pink-600" fill="#ec4899" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Your Wishlist</h3>
                      <p className="text-gray-600 mb-4">Sign in to save your favorite items</p>
                      <div className="flex flex-col space-y-3">
                        <button
                          onClick={() => {
                            navigate('/auth')
                          }}
                          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                        >
                          Sign In
                        </button>
                        <button
                          onClick={() => {
                            navigate('/auth/signup')
                          }}
                          className="w-full py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition-colors"
                        >
                          Create Account
                        </button>
                      </div>
                      <p className="mt-4 text-xs text-gray-500">
                        Your wishlist will be saved across all your devices
                      </p>
                    </div>
                  ) : isWishlistLoading ? (
                    <div className="p-8 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : wishlistItems.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FiHeart size={24} className="text-gray-400" />
                      </div>
                      <p className="text-gray-600">Your wishlist is empty</p>
                      <button
                        onClick={() => {
                          navigate('/product');
                          setIsWishlistOpen(false);
                        }}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                      >
                        Browse Products
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-64 overflow-y-auto">
                        {wishlistItems.map((item) => (
                          <div key={item.product_id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                            <div className="flex">
                              <div className="flex-shrink-0 h-20 w-20 rounded-md overflow-hidden">
                                <img
                                  // src={`http://localhost:8080${item.image_url}`}
                                  src={item.image_url}
                                  alt={item.product_name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="ml-4 flex-1">
                                <div className="flex justify-between">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                                      <Link 
                                        to={`/product/${item.url_key}`}
                                        onClick={() => setIsWishlistOpen(false)}
                                        className="hover:text-indigo-600"
                                      >
                                        {item.product_name}
                                      </Link>
                                    </h4>
                                    {item.average_rating && (
                                      <div className="flex items-center mt-1">
                                        <div className="flex items-center">
                                          {[...Array(5)].map((_, i) => (
                                            <svg
                                              key={i}
                                              className={`w-3 h-3 ${
                                                i < Math.round(item.average_rating)
                                                  ? 'text-yellow-400'
                                                  : 'text-gray-300'
                                              }`}
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => removeFromWishlist(item.product_id)}
                                    disabled={isRemoving[`wish-${item.product_id}`]}
                                    className="text-gray-400 hover:text-red-500 ml-2"
                                  >
                                    {isRemoving[`wish-${item.product_id}`] ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                                    ) : (
                                      <Trash2 size={16} />
                                    )}
                                  </button>
                                </div>
                                <div className="mt-2 flex justify-between items-center">
                                  <p className="text-sm font-medium text-gray-900">
                                    ${item.product_price}
                                  </p>
                                  <button
                                    onClick={() => {
                                      navigate(`/product/viewProduct/${item.url_key}`);
                                      setIsWishlistOpen(false);
                                      
                                    }}
                                    className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                                  >
                                    Add to Cart
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-gray-200">
                        <button
                          onClick={() => {
                            navigate('/wishlist');
                            setIsWishlistOpen(false);
                          }}
                          className="w-full px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                        >
                          View Wishlist
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Cart */}
              <div 
                className="relative group" 
                onMouseEnter={() => {
                  handleCartHover();
                }}
              >
                <button 
                  ref={cartIconRef}
                  className="p-2 text-gray-600 hover:text-indigo-600 relative"
                  aria-label="Cart"
                  onClick={handleCartIconClick}
                >
                  <FiShoppingBag size={20} />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </button>

                {/* Cart Dropdown */}
                <div 
                  ref={cartDropdownRef}
                  className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200"
                  style={{ visibility: isCartOpen ? 'visible' : '', opacity: isCartOpen ? '1' : '' }}
                >
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Your Cart ({cartItemsCount})</h3>
                      {/* <button 
                        onClick={() => setIsCartOpen(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <FiX size={20} />
                      </button> */}
                    </div>
                  </div>

                  { !localStorage.getItem('access_token') ? (
                    <div className="p-6 text-center">
                      <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <FiShoppingBag size={24} className="text-blue-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Your Shopping Cart</h3>
                      <p className="text-gray-600 mb-4">Sign in to view your cart and start shopping</p>
                      <div className="flex flex-col space-y-3">
                        <button
                          onClick={() => {
                            navigate('/auth')
                          }}
                          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                        >
                          Sign In
                        </button>
                        <button
                          onClick={() => {
                            navigate('/auth/signup')
                          }}
                          className="w-full py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition-colors"
                        >
                          Create Account
                        </button>
                      </div>
                      <p className="mt-4 text-xs text-gray-500">
                        By creating an account, you can save items to your cart
                      </p>
                    </div>
                  ) : isLoading ? (
                    <div className="p-8 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : cartItems.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FiShoppingBag size={24} className="text-gray-400" />
                      </div>
                      <p className="text-gray-600">Your cart is empty</p>
                      <button
                        onClick={() => {
                          navigate('/product');
                          setIsCartOpen(false);
                        }}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-64 overflow-y-auto">
                        {cartItems.map((item) => (
                          <div key={item.cart_item_id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                            <div className="flex">
                              <div className="flex-shrink-0 h-20 w-20 rounded-md overflow-hidden">
                                <img
                                  // src={`http://localhost:8080${item.image_url}`}
                                  src={item.image_url}
                                  alt={item.product_name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="ml-4 flex-1">
                                <div className="flex justify-between">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                                      {item.product_name}
                                    </h4>
                                    <p className="mt-1 text-xs text-gray-500">
                                      {item.color_name} / {item.size}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => removeItem(item.cart_item_id)}
                                    disabled={isRemoving[item.cart_item_id]}
                                    className="text-gray-400 hover:text-red-500 ml-2"
                                  >
                                    {isRemoving[item.cart_item_id] ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                                    ) : (
                                      <Trash2 size={16} />
                                    )}
                                  </button>
                                </div>
                                <div className="mt-2 flex justify-between items-center">
                                  <p className="text-sm font-medium text-gray-900">
                                    ${item.product_price}
                                  </p>
                                  <div className="flex items-center">
                                    <span className="text-sm text-gray-500 mx-2">
                                      Qty: {item.quantity}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-gray-200">
                        <div className="flex justify-between text-sm font-medium text-gray-900 mb-2">
                          <span>Subtotal</span>
                          <span>${calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mb-4">
                          <span>Shipping calculated at checkout</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              navigate('/cart');
                              setIsCartOpen(false);
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            View Cart
                          </button>
                          <button
                            onClick={() => {
                              navigate('/checkout');
                              setIsCartOpen(false);
                            }}
                            className="flex-1 px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                          >
                            Checkout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-indigo-600 focus:outline-none"
                aria-label="Menu"
              >
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700"
              >
                <FiSearch size={20} />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {categories.map((category) => (
                <div key={`mobile-${category.name}`}>
                  <Link
                    to={category.path}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${category.highlight ? 'text-red-600' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'}`}
                  >
                    {category.name}
                  </Link>
                  {category.subcategories && (
                    <div className="ml-4 mt-1 space-y-1">
                      {category.subcategories.map((sub) => (
                        <Link
                          key={`mobile-sub-${sub.name}`}
                          to={sub.path}
                          className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5 space-x-4">
                <Link to="/account" className="p-2 text-gray-600 hover:text-indigo-600">
                  <FiUser size={20} />
                  <span className="ml-2">Account</span>
                </Link>
                <Link to="/wishlist" className="p-2 text-gray-600 hover:text-indigo-600 relative">
                  <FiHeart size={20} />
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                  <span className="ml-2">Wishlist</span>
                </Link>
              </div>
            </div> */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5 space-x-4">
                {localStorage.getItem('access_token') ? (
                  <div className="flex flex-col w-full">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-indigo-800 font-medium">
                          {localStorage.getItem("name")?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {localStorage.getItem("name") || 'User'}
                        </h3>
                        <p className="text-xs text-gray-500">Welcome back</p>
                      </div>
                    </div>
        
                    <button
                      onClick={() => {
                        navigate('/account/info');
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center p-2 text-gray-600 hover:text-indigo-600"
                    >
                      <FiUser className="mr-2" size={18} />
                      Account Information
                    </button>
        
                    <button
                      onClick={() => {
                        navigate('/account/orders');
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center p-2 text-gray-600 hover:text-indigo-600"
                    >
                      <FiShoppingBag className="mr-2" size={18} />
                      My Orders
                    </button>
        
                    <button
                      onClick={handleLogout}
                      className="flex items-center p-2 text-red-600 hover:text-red-800 mt-2 border-t border-gray-200 pt-3"
                    >
                      <FiX className="mr-2" size={18} />
                      Sign Out
                    </button>
                  </div>
                  ) : (
                    <button 
                      onClick={() => {
                        navigate('/auth');
                        setIsMenuOpen(false);
                      }} 
                      className="flex items-center p-2 text-gray-600 hover:text-indigo-600"
                    >
                      <FiUser size={20} />
                      <span className="ml-2">Sign In</span>
                    </button>
                  )}
    
                  {/* Keep Wishlist in mobile view */}
                  <Link to="/wishlist" className="p-2 text-gray-600 hover:text-indigo-600 relative">
                    <FiHeart size={20} />
                    {wishlistItemsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {wishlistItemsCount}
                      </span>
                    )}
                    <span className="ml-2">Wishlist</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

        {/* Desktop Search Overlay */}
        {isSearchOpen && (
          <div className="hidden md:block fixed inset-0 bg-white z-50 pt-20 px-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Search Products</h2>
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>
              <form onSubmit={handleSearch} className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-b-2 border-gray-300 text-xl focus:outline-none focus:border-indigo-600"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-indigo-600 font-medium"
                >
                  Search
                </button>
              </form>
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Popular Searches</h3>
                <div className="flex flex-wrap gap-3">
                  {['T-Shirts', 'Jeans', 'Sneakers', 'Jackets', 'Accessories'].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term);
                        navigate(`/product/search?q=${encodeURIComponent(term)}`);
                        setIsSearchOpen(false);
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 text-sm"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;