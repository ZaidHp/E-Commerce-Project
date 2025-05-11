"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

function Joinus({
  gradientFirst = "radial-gradient(68.54% 68.72% at 55.02% 31.46%, rgba(90, 82, 69, 0.2) 0, rgba(90, 82, 69, 0.1) 50%, transparent 80%)",
  gradientSecond = "radial-gradient(50% 50% at 50% 50%, rgba(90, 82, 69, 0.2) 0, rgba(90, 82, 69, 0.05) 80%, transparent 100%)",
  gradientThird = "radial-gradient(50% 50% at 50% 50%, rgba(90, 82, 69, 0.1) 0, rgba(90, 82, 69, 0.05) 80%, transparent 100%)",
  translateY = -150, // Adjusted for 300px height container
  width = 250, // Adjusted for 500px width container
  height = 400, // Adjusted for 300px height container
  smallWidth = 120, // Adjusted for 500px width container
  duration = 7,
  xOffset = 50, // Adjusted for 500px width container
}) {
  return (
    <>
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 1.5,
      }}
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      {/* Left Side Spotlight */}
      <motion.div
        animate={{
          x: [0, xOffset, 0],
        }}
        transition={{
          duration,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute top-0 left-0 h-full w-full z-40 pointer-events-none"
      >
        <div
          style={{
            transform: `translateY(${translateY}px) rotate(-45deg)`,
            background: gradientFirst,
            width: `${width}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 left-0`}
        />

        <div
          style={{
            transform: "rotate(-45deg) translate(5%, -50%)",
            background: gradientSecond,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 left-0 origin-top-left`}
        />

        <div
          style={{
            transform: "rotate(-45deg) translate(-180%, -70%)",
            background: gradientThird,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 left-0 origin-top-left`}
        />
      </motion.div>

      {/* Right Side Spotlight */}
      <motion.div
        animate={{
          x: [0, -xOffset, 0],
        }}
        transition={{
          duration,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute top-0 right-0 h-full w-full z-40 pointer-events-none"
      >
        <div
          style={{
            transform: `translateY(${translateY}px) rotate(45deg)`,
            background: gradientFirst,
            width: `${width}px`,
            height: `${height}px`,
          }}
          className={`absolute -top-5 right-5`}
        />

        <div
          style={{
            transform: "rotate(45deg) translate(-5%, -50%)",
            background: gradientSecond,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 right-0 origin-top-right`}
        />

        <div
          style={{
            transform: "rotate(45deg) translate(180%, -70%)",
            background: gradientThird,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 right-0 origin-top-right`}
        />
      </motion.div>
    </motion.div>
    <div className="absolute inset-0 flex items-center justify-center flex-col gap-11 sm:gap-6  ">
          <h1 className="text-2xl sm:text-4xl font-bold text-white">
            Join <span className="font-cinzel font-[500] mx-1 mr-3">FabrIQ</span> To Expand
          </h1>
          <p className="text-balance w-[76%] sm:w-[87%]" >Unlock new possibilities for your business with AI-driven design tools and a powerful marketplace. From effortless product creation to seamless sales, FabrIQ helps you expand your reach, boost revenue, and stand out in the fashion industry. Join today and turn your creativity into growth! </p>
          <button className="text-xl text-white font-bold py-2 px-5 rounded-xl border-2 border-white hover:bg-stone-500 hover:border-stone-700 hover:text-stone-950" >Join us</button>
        </div>
    </>
  );
};

export default Joinus;