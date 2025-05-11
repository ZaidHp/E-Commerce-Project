import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, ChevronLeft, ChevronRight, Heart, MapPin, Mail, Phone } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BusinessStore = () => {
  const { business_name } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
//   const productsRef = useRef(null);
  const reviewsRef = useRef(null);
  const businessesRef = useRef(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productsPerPage] = useState(8);

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setLoading(true);
        
        const businessRes = await fetch(`http://localhost:8080/api/business/${business_name}`);
        if (!businessRes.ok) throw new Error('Business not found');
        
        const businessData = await businessRes.json();
        setBusiness(businessData.business);
        setProducts(businessData.products);
        setReviews(businessData.reviews);
        
        const totalPages = Math.ceil(businessData.products.length / productsPerPage);
        setTotalPages(totalPages);

        const businessesRes = await fetch('http://localhost:8080/api/business');
        const businessesData = await businessesRes.json();
        setAllBusinesses(businessesData.filter(biz => biz.business_name !== business_name));

      } catch (err) {
        console.error('Error fetching business data:', err);
        toast.error(err.message);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [business_name, navigate, productsPerPage]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleScroll = (direction, ref) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      ref.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className="w-4 h-4"
        fill={rating >= star ? '#FFD700' : 'none'}
        stroke={rating >= star ? '#FFD700' : '#E5E7EB'}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Business not found</h2>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Business Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="ml-1 font-medium">Back</span>
          </button>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-auto flex-shrink-0">
              {business.business_logo_url ? (
                <img
                  src={`http://localhost:8080${business.business_logo_url}`}
                  alt={business.business_name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-xl object-cover border border-gray-200 shadow-sm"
                />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                  No Logo
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{business.business_name}</h1>
                  <div className="flex items-center gap-2 mb-4">
                    {business.average_rating !== null && business.average_rating !== undefined &&  (
                      <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                        <div className="flex mr-1">
                          {renderStars(business.average_rating)}
                        </div>
                        <span className="text-gray-700 font-medium">
                          {Number(business.average_rating).toFixed(1)}
                        </span>
                      </div>
                    )}
                    <span className="text-sm text-gray-500">
                      {products.length} {products.length === 1 ? 'product' : 'products'}
                    </span>
                  </div>
                </div>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">{business.business_description}</p>
              
              <div className="flex flex-wrap gap-4">
                {business.address && (
                  <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
                    <span>{business.address}, {business.city}, {business.country}</span>
                  </div>
                )}
                {business.business_email && (
                  <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    <Mail className="w-5 h-5 mr-2 text-indigo-500" />
                    <span>{business.business_email}</span>
                  </div>
                )}
                {business.business_phone && (
                  <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    <Phone className="w-5 h-5 mr-2 text-indigo-500" />
                    <span>{business.business_phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Products Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          {products.length > productsPerPage && (
            <div className="flex gap-2">
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentProducts.map((product) => (
                <div
                  key={product.product_id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => navigate(`/product/viewProduct/${product.url_key}`)}
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {product.image_url ? (
                      <img
                        // src={`http://localhost:8080${product.image_url}`}
                        src={product.image_url}
                        alt={product.product_name}
                        className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 line-clamp-2 mb-1 hover:text-indigo-600 transition-colors">
                      {product.product_name}
                    </h3>
                    <div className="flex items-center mb-2">
                      {product.average_rating ? (
                        <>
                          {renderStars(product.average_rating)}
                          <span className="text-xs text-gray-500 ml-1">
                            ({Number(product.average_rating).toFixed(1)})
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">No reviews yet</span>
                      )}
                    </div>
                    <p className="text-lg font-bold text-gray-900">${Number(product.product_price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="inline-flex rounded-md shadow-sm">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-l-md border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-4 py-2 border-t border-b ${currentPage === number ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      {number}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-r-md border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500">This business hasn't added any products yet.</p>
          </div>
        )}
      </div>
      
      {/* Reviews Section */}
      {reviews.length > 0 && (
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
              {/* <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                View all reviews
              </button> */}
            </div>
            
            <div className="relative">
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 -left-4 z-10 bg-white shadow-md rounded-full p-2 hover:shadow-lg transition-all hidden md:block hover:bg-indigo-50"
                onClick={() => handleScroll('left', reviewsRef)}
                aria-label="Scroll reviews left"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 -right-4 z-10 bg-white shadow-md rounded-full p-2 hover:shadow-lg transition-all hidden md:block hover:bg-indigo-50"
                onClick={() => handleScroll('right', reviewsRef)}
                aria-label="Scroll reviews right"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>

              <div
                ref={reviewsRef}
                className="flex overflow-x-auto gap-6 pb-6 scroll-smooth scrollbar-hide"
              >
                {reviews.map((review) => (
                  <div
                    key={review.review_id}
                    className="min-w-[320px] max-w-[320px] bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-shrink-0 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium mr-3">
                        {review.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{review.username}</h4>
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                          <span className="text-xs text-gray-500 ml-2">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {review.review_media && (
                      <div className="rounded-lg overflow-hidden mb-4 bg-gray-100">
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
                    
                    <p className="text-gray-600">{review.review_text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Other Businesses Section */}
      {allBusinesses.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Other Businesses</h2>
          
          <div className="relative">
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 -left-4 z-10 bg-white shadow-md rounded-full p-2 hover:shadow-lg transition-all hidden md:block hover:bg-indigo-50"
              onClick={() => handleScroll('left', businessesRef)}
              aria-label="Scroll businesses left"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 -right-4 z-10 bg-white shadow-md rounded-full p-2 hover:shadow-lg transition-all hidden md:block hover:bg-indigo-50"
              onClick={() => handleScroll('right', businessesRef)}
              aria-label="Scroll businesses right"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>

            <div
              ref={businessesRef}
              className="flex overflow-x-auto gap-6 pb-6 scroll-smooth scrollbar-hide"
            >
              {allBusinesses.map((biz) => (
                <Link
                  key={biz.business_id}
                  to={`/store/${biz.business_name}`}
                  className="min-w-[240px] max-w-[240px] bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-shrink-0 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col items-center">
                    {biz.business_logo_url ? (
                      <img
                        src={`http://localhost:8080${biz.business_logo_url}`}
                        alt={biz.business_name}
                        className="w-20 h-20 rounded-lg object-cover border border-gray-200 mb-3"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 mb-3 border border-gray-200">
                        No Logo
                      </div>
                    )}
                    <h3 className="font-medium text-gray-900 text-center">{biz.business_name}</h3>
                    <div className="flex items-center mt-1">
                      {biz.average_rating ? (
                        <>
                          {renderStars(biz.average_rating)}
                          <span className="text-xs text-gray-500 ml-1">
                            ({Number(biz.average_rating).toFixed(1)})
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">No reviews</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {biz.product_count || 0} products
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessStore;