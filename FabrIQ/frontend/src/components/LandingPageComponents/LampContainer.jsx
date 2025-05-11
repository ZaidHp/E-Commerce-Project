"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { useState, useEffect } from "react";


const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768); // Initialize correctly

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkScreenSize(); // Set initial state after mount
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return isMobile;
};



const LampContainer = ({ children, className }) => {
  
const isMobile = useIsMobile(); 

  return (
    <div
      className={cn(
        "relative flex h-[50vh] sm:h-[100vh] flex-col items-center justify-center overflow-hidden bg-stone-950 w-full rounded-md z-0",
        className
      )}
    >
      <div className="relative flex w-full flex-1 scale-y-[70%] items-center justify-center isolate z-0">
        <motion.div
          initial={{ opacity: 0.5, width: isMobile ? "10rem" : "15rem" }}
          whileInView={{ opacity: 1, width: isMobile ? "15rem" : "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto right-1/2 h-56 overflow-visible w-[30rem] bg-gradient-conic from-[rgb(90,82,69)] via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top]"
        >
          <div className="absolute  w-[100%] left-0 bg-stone-950 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute  w-40 h-[100%] left-0 bg-stone-950  bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0.5, width: isMobile ? "10rem" : "15rem" }}
          whileInView={{ opacity: 1, width: isMobile ? "15rem" : "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-[rgb(90,82,69)] text-white [--conic-position:from_290deg_at_center_top]"
        >
          <div className="absolute  w-40 h-[100%] right-0 bg-stone-950  bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute  w-[100%] right-0 bg-stone-950 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>
        <div className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-1/2 rounded-full bg-[rgb(90,82,69)] opacity-50 blur-3xl"></div>
        <motion.div
          initial={{ opacity: 0.5, width: isMobile ? "4rem" : "8rem" }}
          whileInView={{ opacity: 1, width: isMobile ? "8rem" : "16rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-30 h-36 w-64 -translate-y-[6rem] rounded-full bg-[rgb(90,82,69)] blur-2xl"
        ></motion.div>
        <motion.div
          initial={{ opacity: 0.5, width: isMobile ? "10rem" : "15rem" }}
          whileInView={{ opacity: 1, width: isMobile ? "15rem" : "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-50 h-0.5 w-[30rem] -translate-y-[7rem] bg-[rgb(90,82,69)]"
        ></motion.div>

        <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-stone-950 "></div>
      </div>

      <div className="relative z-50 -translate-y-[160%] sm:-translate-y-[90%] flex-col items-center px-5"> 
        {children}
      </div>

    </div>
  );
};

export default LampContainer;