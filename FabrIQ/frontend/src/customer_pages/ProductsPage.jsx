import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiX, FiStar } from 'react-icons/fi';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

const CategoryItem = ({ 
  parentCategory, 
  selectedCategory, 
  setSelectedCategory,
  expandedCategories,
  toggleCategory 
}) => {
  const hasSubcategories = parentCategory.subcategories?.length > 0;
  const isExpanded = expandedCategories.includes(parentCategory.id);
  const isSelected = selectedCategory === parentCategory.id;

  return (
    <>
      <li className="mb-1">
        <div className="flex items-center">
          <button
            onClick={() => {
              setSelectedCategory(parentCategory.id);
              if (hasSubcategories) {
                toggleCategory(parentCategory.id);
              }
            }}
            className={`flex-1 text-left p-3 rounded-lg transition-colors ${
              isSelected
                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            {parentCategory.name}
          </button>
          {hasSubcategories && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(parentCategory.id);
              }}
              className={`p-2 rounded-full hover:bg-gray-100 ${
                isExpanded ? 'text-indigo-600' : 'text-gray-400'
              }`}
            >
              {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </button>
          )}
        </div>
      </li>
      {hasSubcategories && isExpanded && (
        <div className="ml-4 border-l-2 border-gray-100 pl-2">
          {parentCategory.subcategories.map(subcategory => (
            <li key={`subcat-${subcategory.id}`} className="mb-1">
              <button
                onClick={() => setSelectedCategory(subcategory.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedCategory === subcategory.id 
                    ? 'bg-indigo-50 text-indigo-600 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {subcategory.name}
              </button>
            </li>
          ))}
        </div>
      )}
    </>
  );
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [categoryStructure, setCategoryStructure] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlSearchTerm = searchParams.get('q');
    
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
      setSelectedCategory(null);
    } else if (params.category) {
      const categoryPath = params.category;
      if (categoryPath.includes('>')) {
        const [parentCategory, subcategory] = categoryPath.split('>');
        setSearchTerm('');
      } else {
        setSearchTerm('');
      }
    } else {
      setSearchTerm('');
      setSelectedCategory(null);
    }
  }, [location, params.category]);

  useEffect(() => {
    if (categories.length > 0 && params.category) {
      const categoryPath = params.category;
      if (categoryPath.includes('>')) {
        const [parentName, subcategoryName] = categoryPath.split('>');
        const parentCategory = categoryStructure.find(
          cat => cat.name.toLowerCase() === parentName.toLowerCase()
        );
        if (parentCategory) {
          const subcategory = parentCategory.subcategories?.find(
            sub => sub.name.toLowerCase() === subcategoryName.toLowerCase()
          );
          if (subcategory) {
            setSelectedCategory(subcategory.id);
            if (!expandedCategories.includes(parentCategory.id)) {
              setExpandedCategories([...expandedCategories, parentCategory.id]);
            }
          }
        }
      } else {
        const category = categoryStructure.find(
          cat => cat.name.toLowerCase() === categoryPath.toLowerCase()
        );
        if (category) {
          setSelectedCategory(category.id);
        } else {
          for (const parent of categoryStructure) {
            const subcategory = parent.subcategories?.find(
              sub => sub.name.toLowerCase() === categoryPath.toLowerCase()
            );
            if (subcategory) {
              setSelectedCategory(subcategory.id);
              if (!expandedCategories.includes(parent.id)) {
                setExpandedCategories([...expandedCategories, parent.id]);
              }
              break;
            }
          }
        }
      }
    }
  }, [categories, params.category, categoryStructure]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, priceRange, sortOption]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8080/api/productPage");
      const data = await res.json();
      setProducts(data.products || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch products', err);
      setProducts([]);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/categories");
      const data = await res.json();
      setCategoryStructure(data);
      
      const flatCategories = data.reduce((acc, parent) => {
        return [...acc, parent, ...parent.subcategories];
      }, []);
      setCategories(flatCategories);
    } catch (err) {
      console.error('Failed to fetch categories', err);
      setCategories([]);
      setCategoryStructure([]);
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filterProducts = () => {
    const sourceProducts = Array.isArray(products) ? products : [];
    let result = [...sourceProducts];

    if (searchTerm) {
      result = result.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      const selectedCategoryObj = categories.find(c => c.id === selectedCategory);
      if (selectedCategoryObj) {
        if (selectedCategoryObj.subcategories) {
          const subcategoryIds = selectedCategoryObj.subcategories.map(sc => sc.id);
          result = result.filter(product => 
            product.categoryId === selectedCategory || 
            subcategoryIds.includes(product.categoryId)
          );
        } else {
          result = result.filter(product => product.categoryId === selectedCategory);
        }
      }
    }

    result = result.filter(product => {
      const price = Number(product.price) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'popular':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  };

  const handleProductClick = (urlKey) => {
    navigate(`/product/viewProduct/${urlKey}`);
  };

  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    navigate(`/product?q=${term}`, { replace: true });
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setPriceRange([0, 1000]);
    setSortOption('newest');
    navigate('/product');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Filters Overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-40 overflow-y-auto">
          <div className="flex min-h-screen">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between px-4 py-4 border-b">
                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                <button
                  type="button"
                  className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md p-2 text-gray-400 hover:text-gray-500"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-4 overflow-y-auto">
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
                  <ul className="space-y-1">
                    <li>
                      <button
                        onClick={() => {
                          setSelectedCategory(null);
                          navigate('/product');
                        }}
                        className={`w-full text-left p-2 rounded-lg ${
                          !selectedCategory 
                            ? 'bg-indigo-50 text-indigo-600 font-medium' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        All Categories
                      </button>
                    </li>
                    {categoryStructure.map(parentCategory => (
                      <div key={`mobile-parent-${parentCategory.id}`} className="space-y-1">
                        <button
                          onClick={() => {
                            setSelectedCategory(parentCategory.id);
                            toggleCategory(parentCategory.id);
                            navigate(`/product/${parentCategory.name.toLowerCase()}`);
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center justify-between ${
                            selectedCategory === parentCategory.id
                              ? 'bg-indigo-50 text-indigo-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {parentCategory.name}
                          {parentCategory.subcategories?.length > 0 && (
                            <span>
                              {expandedCategories.includes(parentCategory.id) ? (
                                <FiChevronUp size={16} />
                              ) : (
                                <FiChevronDown size={16} />
                              )}
                            </span>
                          )}
                        </button>
                        {parentCategory.subcategories?.length > 0 && 
                          expandedCategories.includes(parentCategory.id) && (
                            <div className="ml-4 border-l-2 border-gray-100 pl-2">
                              {parentCategory.subcategories.map(subcategory => (
                                <button
                                  key={`mobile-subcat-${subcategory.id}`}
                                  onClick={() => {
                                    setSelectedCategory(subcategory.id);
                                    navigate(`/product/${parentCategory.name.toLowerCase()}>${subcategory.name.toLowerCase()}`);
                                  }}
                                  className={`w-full text-left p-2 rounded-lg ${
                                    selectedCategory === subcategory.id
                                      ? 'bg-indigo-50 text-indigo-600 font-medium'
                                      : 'text-gray-600 hover:bg-gray-50'
                                  }`}
                                >
                                  {subcategory.name}
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                    <div className="relative">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="absolute h-2 bg-indigo-500 rounded-full"
                          style={{
                            left: '0%',
                            right: `${100 - (priceRange[1] / 1000 * 100)}%`
                          }}
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="absolute w-full h-2 opacity-0 cursor-pointer top-0"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between space-x-4">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex-1"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex-1"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search and Filter Bar */}
        <div className='min-h-10'></div>
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 mt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="md:hidden flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <FiFilter size={18} />
                <span className="text-sm font-medium">Filters</span>
              </button>

              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <FiChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Desktop Sidebar Filters */}
          <div className="hidden md:block w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Categories</h3>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left p-2 rounded-lg ${
                        !selectedCategory 
                          ? 'bg-indigo-50 text-indigo-600 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      All Categories
                    </button>
                  </li>
                  {categoryStructure.map(parentCategory => (
                    <CategoryItem
                      key={`parent-${parentCategory.id}`}
                      parentCategory={parentCategory}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      expandedCategories={expandedCategories}
                      toggleCategory={toggleCategory}
                    />
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                  <div className="relative">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="absolute h-2 bg-indigo-500 rounded-full"
                        style={{
                          left: '0%',
                          right: `${100 - (priceRange[1] / 1000 * 100)}%`
                        }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="absolute w-full h-2 opacity-0 cursor-pointer top-0"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Active Filters */}
            {(searchTerm || selectedCategory || priceRange[1] < 1000) && (
              <div className="mb-6 flex flex-wrap gap-2">
                {searchTerm && (
                  <div className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                    <span className="text-gray-700">Search: {searchTerm}</span>
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="ml-1.5 text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}
                {selectedCategory && (
                  <div className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                    <span className="text-gray-700">
                      {(() => {
                        const category = categories.find(c => c.id === selectedCategory);
                        if (!category) return null;
    
                        if (category.subcategories) {
                          const selectedSubcategory = category.subcategories.find(
                            sub => sub.id === selectedCategory
                          );
      
                          if (selectedSubcategory) {
                            return `${category.name} > ${selectedSubcategory.name}`;
                          }
                          return category.name;
                        } else {
                          const parentCategory = categoryStructure.find(parent => 
                            parent.subcategories?.some(sub => sub.id === selectedCategory)
                          );
      
                          if (parentCategory) {
                            const subcategory = parentCategory.subcategories.find(
                              sub => sub.id === selectedCategory
                            );
                            return `${parentCategory.name} > ${subcategory.name}`;
                          }
                          return category.name;
                        }
                      })()}
                    </span>
                    <button 
                      onClick={() => setSelectedCategory(null)}
                      className="ml-1.5 text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}
                {priceRange[1] < 1000 && (
                  <div className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                    <span className="text-gray-700">
                      Price: ${priceRange[0]} - ${priceRange[1]}
                    </span>
                    <button 
                      onClick={() => setPriceRange([0, 1000])}
                      className="ml-1.5 text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <>
                {currentProducts.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentProducts.map((product) => (
                        <div
                          key={product.id}
                          className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition duration-200 cursor-pointer group"
                          onClick={() => handleProductClick(product.urlKey)}
                        >
                          <div className="relative aspect-square overflow-hidden">
                            {product.images?.length > 0 ? (
                              <img
                                // src={`http://localhost:8080${product.images[0]}`}
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/300';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-400">No Image</span>
                              </div>
                            )}
                            {product.rating && (
                              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur rounded-full px-2 py-1 flex items-center text-xs font-medium">
                                <FiStar className="text-yellow-400 mr-1" />
                                {product.rating.toFixed(1)}
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                              {product.name || 'No Name'}
                            </h2>
                            <p className="text-sm text-gray-500 mb-2">
                              {product.category?.name || 'No Category'}
                              {product.category?.subcategories?.length > 0 && (
                              ` > ${product.category.subcategories[0].name}`
                              )}
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-lg font-bold text-gray-900">
                                ${Number(product.price)?.toFixed(2) || '0.00'}
                              </p>
                              {product.original_price && (
                                <p className="text-sm text-gray-500 line-through">
                                  ${Number(product.original_price)?.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {filteredProducts.length > productsPerPage && (
                      <div className="mt-8 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Showing <span className="font-medium">{indexOfFirstProduct + 1}</span> to{' '}
                          <span className="font-medium">
                            {Math.min(indexOfLastProduct, filteredProducts.length)}
                          </span>{' '}
                          of <span className="font-medium">{filteredProducts.length}</span> results
                        </div>
                        <nav className="flex items-center space-x-2">
                          <button
                            onClick={() => paginate(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <IoIosArrowBack size={18} />
                          </button>
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                            <button
                              key={number}
                              onClick={() => paginate(number)}
                              className={`px-3 py-1.5 rounded-md text-sm ${
                                currentPage === number 
                                  ? 'bg-indigo-600 text-white' 
                                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {number}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <IoIosArrowForward size={18} />
                          </button>
                        </nav>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <div className="mx-auto max-w-md">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your search or filter to find what you're looking for.
                      </p>
                      <div className="mt-6">
                        <button
                          onClick={resetFilters}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Reset Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className='min-h-20'></div>
    </div>
  );
};

export default ProductsPage;