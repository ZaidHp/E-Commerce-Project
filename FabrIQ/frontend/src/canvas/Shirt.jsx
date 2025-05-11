import React from "react";
import { easing } from "maath";
import { useSnapshot } from "valtio";
import { useFrame } from "@react-three/fiber";
import { Decal, useGLTF, useTexture } from "@react-three/drei";
import state from "../store";

const Shirt = () => {
  const snap = useSnapshot(state);
  const { nodes, materials } = useGLTF("/shirt_baked.glb");
  const logoTexture = useTexture(snap.logoDecal);
  const fullTexture = useTexture(snap.fullDecal);
  logoTexture.anisotropy = 16;
  fullTexture.anisotropy = 16;

  useFrame((state, delta) => {
    easing.dampC(materials.lambert1.color, snap.color, 0.25, delta);
  });
  const stateString = JSON.stringify(snap);
  return (
    <group
      key={stateString}
    >
      <mesh 
      castShadow
      geometry={nodes.T_Shirt_male.geometry}
      material={materials.lambert1}
      material-roughness={1}
      dispose={null}
      >
        {snap.isFullTexture && (
          <Decal
            position={[0,0,0]}
            scale={1}
            rotation={[0,0,0]}
            map={fullTexture}
          />
        )}
        {snap.isLogoTexture && (
          <Decal
            position={[0,0.04,0.15]}
            scale={0.15}
            rotation={[0,0,0]}
            map={logoTexture}
            depthWrite={true}
            depthTest={false}
          />
        )}
      </mesh>
      
    </group>
  )
}

export default Shirt;

// import React, { useEffect, useState } from "react";
// import { easing } from "maath";
// import { useSnapshot } from "valtio";
// import { useFrame } from "@react-three/fiber";
// import { Decal, useGLTF, useTexture } from "@react-three/drei";
// import state from "../store";

// const Shirt = () => {
//   const snap = useSnapshot(state);
//   const { nodes, materials } = useGLTF("/shirt_baked.glb");
//   const [logoTexture, setLogoTexture] = useState(null);
//   const [fullTexture, setFullTexture] = useState(null);
//   const [error, setError] = useState(null);

//   // Load textures with error handling
//   useEffect(() => {
//     const loadTextures = async () => {
//       try {
//         if (snap.logoDecal) {
//           const texture = await useTexture(snap.logoDecal);
//           texture.anisotropy = 16;
//           setLogoTexture(texture);
//         }
//         if (snap.fullDecal) {
//           const texture = await useTexture(snap.fullDecal);
//           texture.anisotropy = 16;
//           setFullTexture(texture);
//         }
//       } catch (err) {
//         console.error("Texture loading error:", err);
//         setError("Failed to load textures");
//       }
//     };

//     loadTextures();

//     return () => {
//       // Cleanup textures
//       if (logoTexture) logoTexture.dispose();
//       if (fullTexture) fullTexture.dispose();
//     };
//   }, [snap.logoDecal, snap.fullDecal]);

//   useFrame((state, delta) => {
//     easing.dampC(materials.lambert1.color, snap.color, 0.25, delta);
//   });

//   if (error) {
//     return (
//       <group>
//         <mesh geometry={nodes.T_Shirt_male.geometry} material={materials.lambert1}>
//           <meshBasicMaterial color="red" wireframe />
//         </mesh>
//       </group>
//     );
//   }

//   return (
//     <group key={JSON.stringify(snap)}>
//       <mesh
//         castShadow
//         geometry={nodes.T_Shirt_male.geometry}
//         material={materials.lambert1}
//         material-roughness={1}
//         dispose={null}
//       >
//         {snap.isFullTexture && fullTexture && (
//           <Decal
//             position={[0, 0, 0]}
//             scale={1}
//             rotation={[0, 0, 0]}
//             map={fullTexture}
//           />
//         )}
//         {snap.isLogoTexture && logoTexture && (
//           <Decal
//             position={[0, 0.04, 0.15]}
//             scale={0.15}
//             rotation={[0, 0, 0]}
//             map={logoTexture}
//             depthTest={false}
//             depthWrite={true}
//           />
//         )}
//       </mesh>
//     </group>
//   );
// };

// export default Shirt;