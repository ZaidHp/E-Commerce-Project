import React, {useRef} from 'react'
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useSnapshot } from 'valtio'

import state from '../store'


const CameraRig = ({children}) => {
  const group = useRef();
  const snap=useSnapshot(state);
  
  useFrame((state, delta)=>{
    const isBreakpoint = window.innerWidth <= 1260;
    const isMobile = window.innerWidth <= 600;

    //set the initial position position of the model
    let targetPosition = [-0.4, 0, 2];
    if(snap.intro){
      if(isBreakpoint){
        targetPosition = [0,0,2];
      }
      if(isMobile){
        targetPosition = [0,0.3,1.6];
      }
      else{ targetPosition = [0,0,2];}
    } else {
      if(isMobile){
        targetPosition = [0,0,1.3];
      }
      else{ targetPosition = [0,0,.7];}
    }

    //set model camera psition
    easing.damp3(state.camera.position, targetPosition, 0.25, delta)

    //set the model rotation smoothly
    easing.dampE(
      group.current.rotation,
      [state.pointer.y/10, -state.pointer.x/5, 0],
      0.25,
      delta,
    )
  })


  
  return (
    <group ref={group}>
      {children}
    </group>
  )
}

export default CameraRig

// import React, { useRef, useEffect, useState } from 'react'
// import { useFrame, useThree } from '@react-three/fiber'
// import { easing } from 'maath'
// import { useSnapshot } from 'valtio'
// import state from '../store'

// const CameraRig = ({ children }) => {
//   const group = useRef()
//   const snap = useSnapshot(state)
//   const { camera } = useThree()
//   const [windowSize, setWindowSize] = useState({
//     width: window.innerWidth,
//     height: window.innerHeight
//   })

//   // Handle window resize
//   useEffect(() => {
//     const handleResize = () => {
//       setWindowSize({
//         width: window.innerWidth,
//         height: window.innerHeight
//       })
//     }

//     window.addEventListener('resize', handleResize)
//     return () => window.removeEventListener('resize', handleResize)
//   }, [])

//   useFrame((state, delta) => {
//     if (!group.current) return // Safety check

//     const isBreakpoint = windowSize.width <= 1260
//     const isMobile = windowSize.width <= 600

//     // Set target positions based on state and screen size
//     const targetPositions = {
//       intro: {
//         default: [0, 0, 2],
//         breakpoint: [0, 0, 2],
//         mobile: [0, 0.3, 1.6]
//       },
//       custom: {
//         default: [0, 0, 0.7],
//         mobile: [0, 0, 1.3]
//       }
//     }

//     // Determine target position
//     let targetPosition = snap.intro 
//       ? isMobile 
//         ? targetPositions.intro.mobile 
//         : isBreakpoint 
//           ? targetPositions.intro.breakpoint 
//           : targetPositions.intro.default
//       : isMobile
//         ? targetPositions.custom.mobile
//         : targetPositions.custom.default

//     // Smooth camera position transition
//     easing.damp3(camera.position, targetPosition, 0.25, delta)

//     // Apply rotation based on pointer movement (with bounds)
//     const rotationX = Math.min(Math.max(state.pointer.y / 10, -0.2), 0.2) // Limit vertical rotation
//     const rotationY = Math.min(Math.max(-state.pointer.x / 5, -0.4), 0.4) // Limit horizontal rotation
    
//     easing.dampE(
//       group.current.rotation,
//       [rotationX, rotationY, 0],
//       0.25,
//       delta
//     )
//   })

//   return (
//     <group ref={group}>
//       {children}
//     </group>
//   )
// }

// export default CameraRig