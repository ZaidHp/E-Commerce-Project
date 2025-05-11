import { Canvas } from "@react-three/fiber";
import { Environment, Center } from "@react-three/drei";

import Shirt from './Shirt';
import CameraRig from './CameraRig'
import BackDrop from './BackDrop';


const CanvasModel = () => {
  return (
    <Canvas 
      shadows
      camera={{position:[0,0,0], fov:70}}
      gl={{preserveDrawingBuffer:true}}
      className="w-full max-w-full transition-all ease-in"
      >
      <ambientLight intensity={0.5} />
      <Environment preset="city" />
      <CameraRig>
        <BackDrop />
        <Center>
          <Shirt />
        </Center>
       </CameraRig>
    </Canvas>
  )
}

export default CanvasModel

// import { Canvas } from "@react-three/fiber";
// import { Environment, Center, Loader } from "@react-three/drei";
// import { Suspense, useState } from "react";
// import Shirt from './Shirt';
// import CameraRig from './CameraRig';
// import BackDrop from './BackDrop';

// const CanvasModel = () => {
//   const [environmentLoaded, setEnvironmentLoaded] = useState(false);
//   const [error, setError] = useState(null);

//   const handleEnvironmentError = (err) => {
//     console.error("Environment loading error:", err);
//     setError("Failed to load environment");
//   };

//   return (
//     <>
//       <Canvas
//         shadows
//         camera={{ position: [0, 0, 0], fov: 70 }}
//         gl={{ 
//           preserveDrawingBuffer: true,
//           antialias: true,
//           powerPreference: "high-performance"
//         }}
//         className="w-full max-w-full transition-all ease-in"
//         dpr={[1, 2]} // Device pixel ratio for better quality on high-DPI screens
//       >
//         <Suspense fallback={null}>
//           {/* Lighting Setup */}
//           <ambientLight intensity={0.5} />
//           <directionalLight
//             position={[5, 5, 5]}
//             intensity={1}
//             castShadow
//             shadow-mapSize-width={1024}
//             shadow-mapSize-height={1024}
//           />
          
//           {/* Environment with fallback */}
//           {error ? (
//             <Environment preset="apartment" /> // Fallback environment
//           ) : (
//             <Environment 
//               preset="city" 
//               onError={handleEnvironmentError}
//               onLoad={() => setEnvironmentLoaded(true)}
//             />
//           )}

//           {/* Main Scene */}
//           <CameraRig>
//             <BackDrop />
//             <Center>
//               <Shirt />
//             </Center>
//           </CameraRig>
//         </Suspense>
//       </Canvas>
      
//       {/* Loading indicator */}
//       {!environmentLoaded && <Loader />}
      
//       {/* Error display (optional) */}
//       {error && (
//         <div className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded">
//           {error} - Using fallback environment
//         </div>
//       )}
//     </>
//   );
// };

// export default CanvasModel;