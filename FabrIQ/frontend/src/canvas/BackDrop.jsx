import React, { useRef } from "react";
import { easing } from "maath";
import { useSnapshot } from "valtio";
import { useFrame } from "@react-three/fiber";
import { AccumulativeShadows, RandomizedLight } from "@react-three/drei";

const BackDrop = () => {
  const shadows=useRef();


  return (
    <AccumulativeShadows 
      ref={shadows}
      temporal
      frames={60}
      alphaTest={0.196}
      scale={8}
      rotation={[Math.PI/2, 0, 0]}
      position={[0, 0, -0.14]}>
      <RandomizedLight 
        amount={4}
        radius={10}
        intensity={0.55}
        ambient={0.25}
        position={[5, 5, -10]}
      />
      <RandomizedLight 
        amount={4}
        radius={5}
        intensity={0.25}
        ambient={0.55}
        position={[-5, 5, -9]}
      />
    </AccumulativeShadows>
  );
};

export default BackDrop;

// import React, { useRef, useEffect } from "react";
// import { easing } from "maath";
// import { useSnapshot } from "valtio";
// import { useFrame, useThree } from "@react-three/fiber";
// import { AccumulativeShadows, RandomizedLight, useHelper } from "@react-three/drei";
// import * as THREE from "three";

// const BackDrop = () => {
//   const shadows = useRef();
//   const { scene } = useThree();
//   const snap = useSnapshot(state);

//   // Configuration object for easy adjustments
//   const config = {
//     shadows: {
//       frames: 60,
//       alphaTest: 0.196,
//       scale: 8,
//       rotation: [Math.PI / 2, 0, 0],
//       position: [0, 0, -0.14],
//       temporal: true,
//       blend: 100
//     },
//     lights: {
//       light1: {
//         amount: 4,
//         radius: 10,
//         intensity: 0.55,
//         ambient: 0.25,
//         position: [5, 5, -10]
//       },
//       light2: {
//         amount: 4,
//         radius: 5,
//         intensity: 0.25,
//         ambient: 0.55,
//         position: [-5, 5, -9]
//       }
//     }
//   };

//   // Debugging helper (remove in production)
//   useEffect(() => {
//     if (process.env.NODE_ENV === "development" && shadows.current) {
//       const shadowHelper = new THREE.CameraHelper(shadows.current.getShadowCamera());
//       scene.add(shadowHelper);
//       return () => scene.remove(shadowHelper);
//     }
//   }, [scene]);

//   // Smooth transitions
//   useFrame((state, delta) => {
//     if (shadows.current) {
//       // You can add any dynamic shadow updates here
//       easing.damp3(
//         shadows.current.position,
//         [0, 0, -0.14 + (snap.intro ? 0 : -0.1)], // Example dynamic adjustment
//         0.25,
//         delta
//       );
//     }
//   });

//   return (
//     <AccumulativeShadows 
//       ref={shadows}
//       temporal={config.shadows.temporal}
//       frames={config.shadows.frames}
//       alphaTest={config.shadows.alphaTest}
//       scale={config.shadows.scale}
//       rotation={config.shadows.rotation}
//       position={config.shadows.position}
//       blend={config.shadows.blend}
//     >
//       <RandomizedLight 
//         amount={config.lights.light1.amount}
//         radius={config.lights.light1.radius}
//         intensity={config.lights.light1.intensity}
//         ambient={config.lights.light1.ambient}
//         position={config.lights.light1.position}
//       />
//       <RandomizedLight 
//         amount={config.lights.light2.amount}
//         radius={config.lights.light2.radius}
//         intensity={config.lights.light2.intensity}
//         ambient={config.lights.light2.ambient}
//         position={config.lights.light2.position}
//       />
//     </AccumulativeShadows>
//   );
// };

// export default BackDrop;

// import React, { useRef, useEffect } from "react";
// import { easing } from "maath";
// import { useSnapshot } from "valtio";
// import { useFrame, useThree } from "@react-three/fiber";
// import { AccumulativeShadows, RandomizedLight, useHelper } from "@react-three/drei";
// import * as THREE from "three";
// import state from "../store"; // Added missing import

// const BackDrop = () => {
//   const shadows = useRef();
//   const { scene } = useThree();
//   const snap = useSnapshot(state);

//   // Configuration object for easy adjustments
//   const config = {
//     shadows: {
//       frames: 60,
//       alphaTest: 0.196,
//       scale: 8,
//       rotation: [Math.PI / 2, 0, 0],
//       position: [0, 0, -0.14],
//       temporal: true,
//       blend: 100
//     },
//     lights: {
//       light1: {
//         amount: 4,
//         radius: 10,
//         intensity: 0.55,
//         ambient: 0.25,
//         position: [5, 5, -10]
//       },
//       light2: {
//         amount: 4,
//         radius: 5,
//         intensity: 0.25,
//         ambient: 0.55,
//         position: [-5, 5, -9]
//       }
//     }
//   };

//   // Debugging helper (remove in production)
//   useEffect(() => {
//     if (process.env.NODE_ENV === "development" && shadows.current) {
//       const shadowHelper = new THREE.CameraHelper(shadows.current.getShadowCamera());
//       scene.add(shadowHelper);
//       return () => scene.remove(shadowHelper);
//     }
//   }, [scene]);

//   // Smooth transitions with error boundary
//   useFrame((state, delta) => {
//     try {
//       if (shadows.current) {
//         easing.damp3(
//           shadows.current.position,
//           [0, 0, -0.14 + (snap.intro ? 0 : -0.1)],
//           0.25,
//           delta
//         );
//       }
//     } catch (error) {
//       console.error("Error in BackDrop animation frame:", error);
//     }
//   });

//   return (
//     <AccumulativeShadows 
//       ref={shadows}
//       temporal={config.shadows.temporal}
//       frames={config.shadows.frames}
//       alphaTest={config.shadows.alphaTest}
//       scale={config.shadows.scale}
//       rotation={config.shadows.rotation}
//       position={config.shadows.position}
//       blend={config.shadows.blend}
//     >
//       <RandomizedLight 
//         amount={config.lights.light1.amount}
//         radius={config.lights.light1.radius}
//         intensity={config.lights.light1.intensity}
//         ambient={config.lights.light1.ambient}
//         position={config.lights.light1.position}
//       />
//       <RandomizedLight 
//         amount={config.lights.light2.amount}
//         radius={config.lights.light2.radius}
//         intensity={config.lights.light2.intensity}
//         ambient={config.lights.light2.ambient}
//         position={config.lights.light2.position}
//       />
//     </AccumulativeShadows>
//   );
// };

// export default BackDrop;