import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const imageUrl = product.images?.[0] 
    ? product.images[0]
    : 'https://via.placeholder.com/300';

  return (
    <div className="relative group overflow-hidden rounded-lg bg-[#1C1917] border border-[#292524] hover:border-[#57534E] transition-all duration-300 h-full flex flex-col">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-medium text-[#A3A097]">
            {product.category?.name || 'Uncategorized'}
          </span>
          <span className="text-lg font-bold text-[#E7E5E4]">
            ${Number(product.price)?.toFixed(2) || '0.00'}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-[#E7E5E4] mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-[#A3A097] mb-4 flex-1 line-clamp-3">
          {product.description || 'No description available'}
        </p>
      </div>
    </div>
  );
};

const ProductsSection = ({ products }) => {
  const sectionRef = useRef(null);
  const sliderRef = useRef(null);
  const titleRef = useRef(null);
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayTimeoutRef = useRef(null);
  const productsPerSlide = 4;
  
  const totalSlides = products?.length ? Math.ceil(products.length / productsPerSlide) : 0;
  
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || !products?.length || totalSlides <= 1) return;
    
    const autoPlayInterval = Math.floor(Math.random() * 10000) + 10000;
    
    autoPlayTimeoutRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, autoPlayInterval);
    
    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
    };
  }, [currentSlide, isAutoPlaying, products, totalSlides]);

  useEffect(() => {
    if (!sectionRef.current || !products?.length) return;
    
    gsap.killTweensOf([titleRef.current, sliderRef.current]);

    gsap.set(titleRef.current, { y: 50, opacity: 0 });
    gsap.set(sliderRef.current, { y: 50, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        toggleActions: "play none none none"
      }
    });

    tl.to(titleRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out"
    });

    tl.to(sliderRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: "power3.out"
    }, "-=0.5");

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [products]);

  const goToSlide = (index) => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }
    setCurrentSlide(index);
    setIsAutoPlaying(true);
  };

  const handleProductClick = (urlKey) => {
    navigate(`/product/viewProduct/${urlKey}`);
  };

  if (!products || products.length === 0) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0C0A09]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#E7E5E4] mb-4">
            Our Products
          </h2>
          <p className="text-lg text-[#A3A097]">
            No products available at the moment
          </p>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={sectionRef}
      className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0C0A09] relative z-10"
    >
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 
            ref={titleRef}
            className="section-title text-3xl sm:text-4xl md:text-5xl font-bold text-[#E7E5E4] mb-4"
          >
            Our Premium Collections
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-[#A3A097]">
            Discover exquisite fabrics crafted with precision and passion
          </p>
        </div>
        
        {/* Slider container */}
        <div className="relative">
          <div 
            ref={sliderRef} 
            className="overflow-hidden"
          >
            <div 
              className="flex transition-transform duration-700 ease-in-out" 
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {/* Create a slide for each group of products */}
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products
                      .slice(slideIndex * productsPerSlide, (slideIndex + 1) * productsPerSlide)
                      .map((product) => (
                        <div 
                          key={product.id}
                          onClick={() => handleProductClick(product.urlKey)}
                          className="cursor-pointer"
                        >
                          <ProductCard product={product} />
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation arrows */}
          {totalSlides > 1 && (
            <>
              <button 
                className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-6 p-2 rounded-full bg-[#292524] text-white hover:bg-[#44403C] transition-colors duration-300 focus:outline-none"
                onClick={() => goToSlide((currentSlide - 1 + totalSlides) % totalSlides)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-6 p-2 rounded-full bg-[#292524] text-white hover:bg-[#44403C] transition-colors duration-300 focus:outline-none"
                onClick={() => goToSlide((currentSlide + 1) % totalSlides)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
        
        {/* Slide indicators */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  currentSlide === index ? 'bg-[#E7E5E4]' : 'bg-[#44403C]'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
        
        <div className="mt-16 text-center">
          <button 
            className="px-8 py-3 bg-[#292524] hover:bg-[#44403C] text-[#E7E5E4] rounded-md transition-all duration-300 border border-[#44403C] hover:border-[#57534E] text-sm font-medium"
            onClick={() => navigate('/product')}
          >
            Explore All Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;