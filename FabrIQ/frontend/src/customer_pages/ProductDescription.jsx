import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChevronLeft, Heart, Star, ChevronRight, ChevronLeft as LeftIcon } from 'lucide-react';
import AuthModal from '../customer_components/AuthModal';

const HeartIcon = ({ filled = false, className = "w-5 h-5" }) => (
  <Heart 
    className={className} 
    fill={filled ? "#ef4444" : "none"} 
    stroke={filled ? "#ef4444" : "currentColor"} 
  />
);

function ProductDescription() {
  const { urlKey } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
  const reviewContainerRef = useRef(null);
  const relatedProductsRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`http://localhost:8080/api/productPage/${urlKey}`);
        const data = await res.json();
        setProduct(data.product);
        setStoreInfo(data.storeInfo);
        setReviews(data.reviews);
        setRelatedProducts(data.relatedProducts || []);
        if (data.product?.colors?.length > 0) {
          setSelectedColor(data.product.colors[0].color_id);
        }
        
        // Check if product is in wishlist
        const token = localStorage.getItem('access_token');
        if (token) {
          const wishlistRes = await fetch('http://localhost:8080/api/wishlist', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (wishlistRes.ok) {
            const wishlistData = await wishlistRes.json();
            const isInWishlist = wishlistData.items.some(item => item.product_id === data.product.product_id);
            setIsWishlisted(isInWishlist);
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [urlKey]);

  const handleSizeClick = (sizeValue) => {
    setSelectedSize(sizeValue);
  };

  const visitStore = (business_name) => {
    navigate(`/store/${business_name}`);
  };

  const handleDecrement = () => {
    const newQuantity = Math.max(1, currentQuantity - 1);
    setCurrentQuantity(newQuantity);
  };

  const handleIncrement = () => {
    const newQuantity = currentQuantity + 1;
    setCurrentQuantity(newQuantity);
  };

  const handleScroll = (direction, ref) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      ref.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleContinueShopping = () => {
    navigate('/product');
  };

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setAuthMode('login');
        setShowAuthModal(true);
        toast.info('Please login to add items to your cart');
        return;
      }
  
      if (!selectedSize) {
        toast.error('Please select a size');
        return;
      }
  
      const response = await fetch('http://localhost:8080/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.product_id,
          quantity: currentQuantity,
          size: selectedSize,
          colorId: selectedColor
        })
      });
  
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server response:', errorData);
        throw new Error(errorData || 'Failed to add item to cart');
      }
  
      const data = await response.json();
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Item added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add item to cart');
    }
  };

  const handleAddToWishlist = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setAuthMode('login');
        setShowAuthModal(true);
        toast.info('Please login to add items to your cart');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/wishlist/${product.product_id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsWishlisted(data.action === 'added');
        window.dispatchEvent(new Event('wishlistUpdated'));
        toast.success(data.action === 'added' ? 'Added to wishlist!' : 'Removed from wishlist');
      } else {
        throw new Error('Failed to update wishlist');
      }
    } catch (err) {
      console.error('Error updating wishlist:', err);
      toast.error('Failed to update wishlist');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
    </div>
  );
  
  if (!product) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
      <button 
        onClick={handleContinueShopping}
        className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
      >
        Continue Shopping
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />

      <div className="container mx-auto px-4 py-6">
        <button
          onClick={handleContinueShopping}
          className="flex items-center text-gray-600 hover:text-black transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="ml-1 font-medium">Back to shopping</span>
        </button>
      </div>
      
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="container mx-auto px-4 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Images */}
          <div className="lg:w-1/2">
            {product.images?.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <Carousel 
                  showThumbs={true} 
                  showStatus={false} 
                  infiniteLoop 
                  autoPlay={false}
                  thumbWidth={80}
                  renderArrowPrev={(clickHandler, hasPrev) => (
                    <button
                      onClick={clickHandler}
                      className="absolute top-1/2 left-2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
                    >
                      <LeftIcon className="w-5 h-5 text-gray-800" />
                    </button>
                  )}
                  renderArrowNext={(clickHandler, hasNext) => (
                    <button
                      onClick={clickHandler}
                      className="absolute top-1/2 right-2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-800" />
                    </button>
                  )}
                  renderItem={(item) => {
                    return (
                      <div className="aspect-square w-full bg-white flex items-center justify-center">
                        <img
                          src={item.props.children.props.src}
                          alt={item.props.children.props.alt}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    );
                  }}
                >
                  {product.images.map((img, index) => (
                    <div key={index}>
                      <img
                        // src={`http://localhost:8080${img}`}
                        src={img}
                        alt={`${product.product_name} - Image ${index + 1}`}
                      />
                    </div>
                  ))}
                </Carousel>
              </div>
            ) : (
              <div className="aspect-square w-full bg-gray-100 rounded-xl shadow-sm flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.product_name}</h1>
                <button 
                  onClick={handleAddToWishlist}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <HeartIcon filled={isWishlisted} className="w-6 h-6" />
                </button>
              </div>

              {/* Price */}
              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold text-gray-900">${parseFloat(product.product_price).toFixed(2)}</span>
                {product.original_price && (
                  <span className="ml-2 text-lg text-gray-500 line-through">${parseFloat(product.original_price).toFixed(2)}</span>
                )}
                {product.original_price && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    {Math.round((1 - (product.product_price / product.original_price)) * 100)}% OFF
                  </span>
                )}
              </div>

              {/* Rating */}
              {product.average_rating && (
                <div className="flex items-center mb-6">
                  <div className="flex mr-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const ratingValue = parseFloat(product.average_rating);
                      const isFilled = ratingValue >= star;
                      const isHalfFilled = ratingValue >= star - 0.5 && ratingValue < star;
                      
                      return (
                        <div key={star} className="relative">
                          <Star
                            className="w-5 h-5"
                            fill={isFilled ? '#FFD700' : isHalfFilled ? '#FFD700' : '#E5E7EB'}
                            stroke={isFilled || isHalfFilled ? '#FFD700' : '#E5E7EB'}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-gray-600">
                    {product.average_rating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}

              {/* Store Info */}
              {storeInfo && (
                <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    {storeInfo.business_logo_url && (
                      <div className="relative">
                        <img
                          src={`http://localhost:8080${storeInfo.business_logo_url}`}
                          alt={storeInfo.business_name}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Sold by</p>
                      <span className="text-gray-800 font-medium">{storeInfo.business_name}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => visitStore(storeInfo.business_name)} 
                    className="px-3 py-1 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-full hover:bg-indigo-100 transition-colors"
                  >
                    Visit Store →
                  </button>
                </div>
              )}

              {/* Description */}
              <div className="mb-6 border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product?.product_description || "No description available."}
                </p>
              </div>

              {/* Color Selection */}
              {product.colors?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Color</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color.color_id}
                        onClick={() => {
                          setSelectedColor(color.color_id);
                          setSelectedSize(null);
                        }}
                        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                          selectedColor === color.color_id 
                            ? 'ring-2 ring-offset-2 ring-black' 
                            : 'hover:ring-1 hover:ring-gray-300 hover:ring-offset-1'
                        }`}
                        aria-label={color.color_name}
                      >
                        <span 
                          className="block w-8 h-8 rounded-full" 
                          style={{ backgroundColor: color.color_code }}
                          title={color.color_name}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Size</h3>
                  {product.colors?.length > 0 && selectedColor && (
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline">
                      Size Guide
                    </button>
                  )}
                </div>
                
                {product.colors?.length > 0 && !selectedColor ? (
                  <div className="text-gray-500 italic">Please select a color first</div>
                ) : product.sizes?.filter(size => 
                    !product.colors?.length ||  
                    (selectedColor && size.color_id === selectedColor)
                  ).length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {product.sizes
                      .filter(size => 
                        !product.colors?.length ||  
                        (selectedColor && size.color_id === selectedColor)
                      )
                      .map((size) => (
                        <button
                          key={size.size_id}
                          onClick={() => handleSizeClick(size.size)}
                          className={`py-3 px-1 rounded-lg text-center transition-all ${
                            selectedSize === size.size 
                              ? 'bg-black text-white border-black font-medium shadow-md' 
                              : size.quantity <= 0 
                                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' 
                                : 'bg-white text-gray-700 border border-gray-300 hover:border-black hover:shadow-sm'
                          }`}
                          disabled={size.quantity <= 0}
                        >
                          {size.size}
                          {size.quantity <= 0 && <span className="block text-xs mt-1">Out of stock</span>}
                        </button>
                      ))}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    {product.colors?.length ? 'No sizes available for selected color' : 'No sizes available'}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center max-w-xs">
                  <button 
                    onClick={handleDecrement} 
                    className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-l-lg hover:bg-gray-100 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <span className="text-xl font-medium">−</span>
                  </button>
                  <div className="w-20 h-12 flex items-center justify-center border-t border-b border-gray-300 font-medium">
                    {currentQuantity}
                  </div>
                  <button 
                    onClick={handleIncrement} 
                    className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-r-lg hover:bg-gray-100 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <span className="text-xl font-medium">+</span>
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className={`w-full py-4 px-6 rounded-lg font-medium text-white text-lg transition-all ${
                  !selectedSize 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-black hover:bg-gray-800 shadow-md hover:shadow-lg'
                }`}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* User Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-16 max-w-full overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            </div>
            
            <div className="relative">
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 -left-4 z-10 bg-white shadow-md rounded-full p-2 hover:shadow-lg transition-all hidden md:block"
                onClick={() => handleScroll('left', reviewContainerRef)}
                aria-label="Scroll reviews left"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 -right-4 z-10 bg-white shadow-md rounded-full p-2 hover:shadow-lg transition-all hidden md:block"
                onClick={() => handleScroll('right', reviewContainerRef)}
                aria-label="Scroll reviews right"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>

              <div
                ref={reviewContainerRef}
                className="flex overflow-x-auto gap-4 pb-6 scroll-smooth scrollbar-hide -mx-4 px-4"
              >
                {reviews.map((review, index) => (
                  <div
                    key={index}
                    className="min-w-[300px] max-w-[300px] bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex-shrink-0"
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium mr-3">
                        {review.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{review.username}</h4>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="w-4 h-4"
                              fill={review.rating >= star ? '#FFD700' : '#E5E7EB'}
                              stroke={review.rating >= star ? '#FFD700' : '#E5E7EB'}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {review.review_media && (
                      <div className="rounded-lg overflow-hidden mb-3 bg-gray-100">
                        {review.review_media.endsWith('.mp4') ? (
                          <video
                            src={`http://localhost:8080${review.review_media}`}
                            controls
                            className="w-full h-40 object-cover"
                          />
                        ) : (
                          <img
                            src={`http://localhost:8080${review.review_media}`}
                            alt="review"
                            className="w-full h-40 object-cover"
                          />
                        )}
                      </div>
                    )}
                    
                    <p className="text-gray-600 text-sm line-clamp-4">{review.review_text}</p>
                    
                    {review.review_text && review.review_text.length > 120 && (
                      <button className="mt-2 text-indigo-600 text-sm font-medium hover:text-indigo-800 transition-colors">
                        Read more
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 max-w-full overflow-hidden">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You may also like</h2>
            
            <div className="relative">
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 -left-4 z-10 bg-white shadow-md rounded-full p-2 hover:shadow-lg transition-all hidden md:block"
                onClick={() => handleScroll('left', relatedProductsRef)}
                aria-label="Scroll products left"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 -right-4 z-10 bg-white shadow-md rounded-full p-2 hover:shadow-lg transition-all hidden md:block"
                onClick={() => handleScroll('right', relatedProductsRef)}
                aria-label="Scroll products right"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>

              <div
                ref={relatedProductsRef}
                className="flex overflow-x-auto gap-4 pb-6 scroll-smooth scrollbar-hide -mx-4 px-4"
              >
                {relatedProducts.map((relatedProduct) => (
                  <div
                    key={relatedProduct.product_id}
                    className="min-w-[240px] max-w-[240px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow transition-all cursor-pointer group"
                    onClick={() => navigate(`/product/viewProduct/${relatedProduct.url_key}`)}
                  >
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {relatedProduct.images?.[0] ? (
                        <img
                          src={relatedProduct.images[0]}
                          alt={relatedProduct.product_name}
                          className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
                        {relatedProduct.product_name}
                      </h3>
                      <div className="flex items-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-4 h-4"
                            fill={star <= Math.round(relatedProduct.average_rating || 0) ? '#FFD700' : '#E5E7EB'}
                            stroke={star <= Math.round(relatedProduct.average_rating || 0) ? '#FFD700' : '#E5E7EB'}
                          />
                        ))}
                      </div>
                      <p className="text-lg font-bold text-gray-900">${parseFloat(relatedProduct.product_price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDescription;
