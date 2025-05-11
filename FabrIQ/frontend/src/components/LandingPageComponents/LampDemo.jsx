"use client";
import React from "react";
import { motion } from "framer-motion";

import LampContainer from "./LampContainer";

const LampDemo = () => {
  return (
    <>
    <LampContainer>  
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-[0%] sm:mt-[-50%] sm:mt-8 bg-gradient-to-br from-stone-300 to-stone-500 sm:py-4 bg-clip-text text-center text-3xl font-medium font-varela tracking-tight text-transparent md:text-5xl"
      >
        Redefining <br /><p className="uppercase sm:text-6xl "> <span className="text-5xl sm:text-8xl">S</span>mart <span className="text-5xl sm:text-8xl">F</span>ashion </p>
      </motion.h1>
    </LampContainer>
    </>
  );
};

export default LampDemo;