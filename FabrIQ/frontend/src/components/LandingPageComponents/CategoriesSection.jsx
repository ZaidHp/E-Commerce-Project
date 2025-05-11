import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from 'react-router-dom';

const CategoryCircle = ({ category }) => {
  const imageUrl = category.image || 'https://via.placeholder.com/300';

  return (
    <div className="flex flex-col items-center group">
      <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-[#292524] group-hover:border-[#57534E] transition-all duration-300 mb-3">
        <img
          src={imageUrl}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300';
          }}
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300" />
      </div>
      <h3 className="text-[#E7E5E4] font-medium text-lg text-center group-hover:text-white transition-colors duration-300">
        {category.name}
      </h3>
    </div>
  );
};

const CategorySlider = ({ title, categories, gender }) => {
  const sliderRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayTimeoutRef = useRef(null);
  const navigate = useNavigate();
  
  const categoriesPerSlide = 4;
  const totalSlides = categories?.length ? Math.ceil(categories.length / categoriesPerSlide) : 0;

  useEffect(() => {
    if (!isAutoPlaying || !categories?.length || totalSlides <= 1) return;
    
    const autoPlayInterval = Math.floor(Math.random() * 5000) + 10000;
    
    autoPlayTimeoutRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, autoPlayInterval);
    
    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
    };
  }, [currentSlide, isAutoPlaying, categories, totalSlides]);

  const goToSlide = (index) => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }
    setCurrentSlide(index);
    setIsAutoPlaying(true);
  };

  const handleCategoryClick = (category) => {
    navigate(`/product/category/${gender}>${encodeURIComponent(category.name)}`);
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="mb-16">
      <h3 className="text-2xl md:text-3xl font-bold text-[#E7E5E4] mb-8 inline-block relative">
        {title}
        <span className="absolute bottom-0 left-0 w-full h-1 bg-[#A3A097]/30 -mb-2"></span>
      </h3>
      
      {/* Slider container */}
      <div className="relative">
        <div ref={sliderRef} className="overflow-hidden">
          <div 
            className="flex transition-transform duration-700 ease-in-out" 
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {/* Create a slide for each group of categories */}
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div key={slideIndex} className="w-full flex-shrink-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 justify-items-center">
                  {categories
                    .slice(slideIndex * categoriesPerSlide, (slideIndex + 1) * categoriesPerSlide)
                    .map((category) => (
                      <div 
                        key={category.name}
                        onClick={() => handleCategoryClick(category)}
                        className="cursor-pointer"
                      >
                        <CategoryCircle category={category} />
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
              className="absolute top-1/2 -left-4 -translate-y-1/2 p-2 rounded-full bg-[#292524] text-white hover:bg-[#44403C] transition-colors duration-300 focus:outline-none"
              onClick={() => goToSlide((currentSlide - 1 + totalSlides) % totalSlides)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              className="absolute top-1/2 -right-4 -translate-y-1/2 p-2 rounded-full bg-[#292524] text-white hover:bg-[#44403C] transition-colors duration-300 focus:outline-none"
              onClick={() => goToSlide((currentSlide + 1) % totalSlides)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        {/* Slide indicators */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  currentSlide === index ? 'bg-[#E7E5E4]' : 'bg-[#44403C]'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CategoriesSection = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const navigate = useNavigate();
  
//   useEffect(() => {
//     gsap.registerPlugin(ScrollTrigger);
//   }, []);

//   // Animation for section entrance
//   useEffect(() => {
//     if (!sectionRef.current) return;
    
//     // Clear any existing animations
//     gsap.killTweensOf([titleRef.current, contentRef.current]);

//     // Set initial state
//     gsap.set(titleRef.current, { y: 50, opacity: 0 });
//     gsap.set(contentRef.current, { y: 50, opacity: 0 });

//     // Create timeline for sequenced animations
//     const tl = gsap.timeline({
//       scrollTrigger: {
//         trigger: sectionRef.current,
//         start: "top 80%",
//         toggleActions: "play none none none"
//       }
//     });

//     // Animate title
//     tl.to(titleRef.current, {
//       y: 0,
//       opacity: 1,
//       duration: 0.8,
//       ease: "power3.out"
//     });

//     // Animate content
//     tl.to(contentRef.current, {
//       y: 0,
//       opacity: 1,
//       duration: 0.8,
//       ease: "power3.out"
//     }, "-=0.5"); // Overlap slightly with title animation

//     return () => {
//       ScrollTrigger.getAll().forEach(trigger => trigger.kill());
//     };
//   }, []);

  // Hardcoded category data since it's not coming from the backend
  const menCategoriesData = [
    { name: 'T-Shirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
    { name: 'Jackets', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
    { name: 'Jeans', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
    { name: 'Formal Wear', image: 'https://images.unsplash.com/photo-1515736076039-a3ca66043b27?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { name: 'Sportswear', image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
    { name: 'Accessories', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' }
  ];
  
  const womenCategoriesData = [
    { name: 'Dresses', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
    { name: 'Tops', image: 'https://images.unsplash.com/photo-1551489186-cf8726f514f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
    { name: 'Skirts', image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
    { name: 'Jeans', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
    { name: 'Formal Wear', image: 'https://images.unsplash.com/photo-1550639525-c97d455acf70?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' },
    { name: 'Accessories', image: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' }
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0C0A09] relative z-10"
    >
      <div className="max-w-7xl mx-auto">
        
        <div ref={contentRef} className="space-y-16">
          <CategorySlider 
            title="Men's Collection" 
            categories={menCategoriesData} 
            gender="men" 
          />
          
          <CategorySlider 
            title="Women's Collection" 
            categories={womenCategoriesData} 
            gender="women" 
          />
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;