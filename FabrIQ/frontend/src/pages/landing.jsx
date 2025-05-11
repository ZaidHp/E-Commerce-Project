import React, { useEffect, useState } from "react";
import LampDemo from "../components/LandingPageComponents/LampDemo";
import Aboutus from "../components/LandingPageComponents/Aboutus";
import timelineData from "../assets/MeetTheTeamData";
import HeroSection from "../components/LandingPageComponents/HeroSection";
import Joinus from "../components/LandingPageComponents/Joinus";
import ProductsSection from "../components/LandingPageComponents/ProductsSection";
import CategoriesSection from "../components/LandingPageComponents/CategoriesSection";
import { gsap } from "gsap";

const LandingPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.onbeforeunload = () => {
      window.scrollTo(0, 0);
    };
    document.body.style.overflow = "hidden";
    gsap.delayedCall(6.8, () => {
      document.body.style.overflow = "auto";
    });

    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/productPage");
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-[#0C0A09] w-full text-[#A3A097]">
      <HeroSection/>
      <LampDemo/>
      <CategoriesSection/>
      {!loading && <ProductsSection products={products} />}
      <Aboutus data={timelineData}/>
      <div className="relative h-[60vh] sm:h-[400px] w-full overflow-hidden bg-rgb[12,10,9] flex items-center justify-center" style={{boxShadow:"0 0 20px rgba(68, 62, 52, 0.1), 0 0 40px rgba(89, 81, 69, 0.1), 0 0 60px rgba(89, 81, 69, 0.15)"}}>
        <div className="relative h-[60vh] sm:h-[300px] w-[150%] sm:w-[800px] overflow-visible mx-auto">
          <Joinus
            width={250}
            height={400}
            smallWidth={120}
            translateY={-150}
            xOffset={50}
          />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;