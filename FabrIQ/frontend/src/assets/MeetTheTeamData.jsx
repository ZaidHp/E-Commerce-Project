import ebadTahir from "../assets/landingpageImages/ebadimage2.jpg";
import imgTwo from "../assets/landingpageImages/imgTwo.jpg";
import AnimatedTestimonials from "../components/LandingPageComponents/AnimatedTestimonials";

const timelineData = [
  { 
    title: "Our Story", 
    content: <p>It started as an idea—a wild, audacious dream to shatter the boundaries of fashion and technology. In an industry ruled by tradition, we dared to ask: What if fashion could think? What if a single idea could turn into a wearable masterpiece at the click of a button? From the depths of this vision, FabrIQ was born. Not just a brand. A revolution. A force rewriting the rules of design, manufacturing, and creativity itself.</p> 
  },
  { 
    title: "Meet the team", 
    content: (
      <AnimatedTestimonials 
        testimonials={[
          { 
            src: ebadTahir,
            name: "Ebad Tahir", 
            designation: "Co-Founder",
            quote: "Visionary behind FabrIQ, leading the charge in AI-driven fashion." 
          },
          { 
            src: imgTwo,
            name: "Muhammad Zaid", 
            designation: "Mastermind", 
            quote: "An innovator at the intersection of AI, fashion, and e-commerce." 
          },
          { 
            src: imgTwo,
            name: "Mubashir Azhar", 
            designation: "Creative Director", 
            quote: "Ensuring top-tier creativity in every design and AI creation." 
          },
          { 
            src: imgTwo,
            name: "Umer Saleh", 
            designation: "Strategist", 
            quote: "Guiding FabrIQ’s growth and success in the fashion industry." 
          }
        ]} 
        autoplay={true} 
      />
    )
  },
  { 
    title: <p>Why <span className="font-cinzel font-[300]">FabrIQ?</span></p>, 
    content: <p> 
      Because fashion should be yours—not dictated by the industry.
      <br />
      <span className="leading-10">
      ✔ Create with AI. Generate stunning designs instantly.
      </span>
      <br />
      <span className="leading-10">
      ✔ Wear innovation. Fashion that’s fresh, not recycled trends.
      </span>
      <br />
      <span className="leading-10">
      ✔ No waste, no limits. Only produce what’s needed.
      </span>
      <br />
      <span className="leading-10">
      ✔ Power to creators. Businesses and customers shape their own style.
      </span>
      <br />
      <span className="leading-10">
      The future isn’t pre-made. It’s designed.
      </span>
      </p> 
  },
];

export default timelineData;