import React, { useState, useEffect, useRef } from "react";
import {
  FaHome,
  FaPlus,
  FaArchive,
  FaBox,
  FaUserFriends,
  FaCog,
  FaBars,
  FaBuilding,
  FaStar,
  FaSignOutAlt,
  FaRobot,
  FaMoneyBillWave,
} from "react-icons/fa";
import { sidebarItems } from "../assets/sidebarData";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { logoutUser } from "../utility/logoutUser";

const iconComponents = {
  FaHome,
  FaPlus,
  FaArchive,
  FaBox,
  FaUserFriends,
  FaCog,
  FaStar,
  FaSignOutAlt,
  FaBuilding,
  FaRobot,
  FaMoneyBillWave,
};

function Sidebar({ panelType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAiAccess, setHasAiAccess] = useState(
    localStorage.getItem("has_ai_access") === "true"
  );

  const sidebarRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const currentSidebarItems = sidebarItems[panelType] || [];

  useEffect(() => {
    const handleStorageChange = () => {
      setHasAiAccess(localStorage.getItem("has_ai_access") === "true");
    };

    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const success = await logoutUser();
    if (success) {
      localStorage.removeItem("has_ai_access"); 
      setHasAiAccess(false);
      navigate("/login");
      setIsOpen(false);
    }
  };

  const handleSettings = () => {
    navigate("/settings");
    setIsOpen(false);
  };

  return (
    <div ref={sidebarRef} className="z-50">
      {/* Toggle Button */}
      {!isOpen && (
        <div className="fixed top-20 left-4 z-[60]">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-white/30 hover:bg-white/60 backdrop-blur-md p-3 rounded-full shadow-lg transition-all flex items-center justify-center"
          >
            <FaBars className="text-xl text-gray-800" />
          </button>
        </div>
      )}

      {/* Animated Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="fixed top-0 left-0 h-screen w-[80%] max-w-[260px] bg-white/70 backdrop-blur-lg border-r border-white/20 shadow-2xl p-6 pt-10 rounded-r-3xl z-50"
          >
            {/* Title */}
            <div className="mb-6 text-2xl font-semibold text-gray-800 tracking-tight">
              {panelType
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </div>

            {/* Scrollable Nav Items */}
            <nav className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-120px)] pr-1 custom-scrollbar">
              {currentSidebarItems.map((item, index) => {
                if (item.type === "heading") {
                  return (
                    <span
                      key={index}
                      className="uppercase text-xs font-semibold text-gray-500 tracking-widest mt-4"
                    >
                      {item.text}
                    </span>
                  );
                } else if (item.type === "link") {
                  if (item.href === "/ai-product" && !hasAiAccess) {
                    return null;
                  }

                  const Icon = iconComponents[item.icon];
                  const isActive = location.pathname === item.href;

                  return (
                    <Link
                      key={index}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-black text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100 hover:text-black"
                      }`}
                    >
                      <Icon className="text-lg" />
                      <span className="text-sm font-medium">{item.text}</span>
                    </Link>
                  );
                }
                return null;
              })}

              <button
                onClick={handleSettings}
                className={`mt-6 flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-black transition-all duration-200 ${
                  location.pathname === "/settings"
                    ? "bg-black text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100 hover:text-black"
                }`}
              >
                <FaCog className="text-lg" />
                <span className="text-sm font-medium">Settings</span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 mt-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
              >
                <FaSignOutAlt className="text-lg" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Sidebar;

// import React, { useState, useEffect, useRef } from "react";
// import {
//   FaHome,
//   FaPlus,
//   FaArchive,
//   FaBox,
//   FaUserFriends,
//   FaCog,
//   FaBars,
//   FaBuilding,
//   FaStar,
//   FaSignOutAlt,
//   FaRobot,
//   FaMoneyBillWave,
// } from "react-icons/fa";
// import { sidebarItems } from "../assets/sidebarData";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { logoutUser } from "../utility/logoutUser";

// const iconComponents = {
//   FaHome,
//   FaPlus,
//   FaArchive,
//   FaBox,
//   FaUserFriends,
//   FaCog,
//   FaStar,
//   FaSignOutAlt,
//   FaBuilding,
//   FaRobot,
//   FaMoneyBillWave,
// };

// function Sidebar({ panelType }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [hasAiAccess, setHasAiAccess] = useState(
//     localStorage.getItem("has_ai_access") === "true"
//   );
//   const [activeHover, setActiveHover] = useState(null);

//   const sidebarRef = useRef(null);
//   const location = useLocation();
//   const navigate = useNavigate();

//   const currentSidebarItems = sidebarItems[panelType] || [];

//   useEffect(() => {
//     const handleStorageChange = () => {
//       setHasAiAccess(localStorage.getItem("has_ai_access") === "true");
//     };

//     window.addEventListener("storage", handleStorageChange);

//     return () => window.removeEventListener("storage", handleStorageChange);
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleLogout = async () => {
//     const success = await logoutUser();
//     if (success) {
//       localStorage.removeItem("has_ai_access"); 
//       setHasAiAccess(false);
//       navigate("/login");
//       setIsOpen(false);
//     }
//   };

//   const handleSettings = () => {
//     navigate("/settings");
//     setIsOpen(false);
//   };

//   return (
//     <div ref={sidebarRef} className="z-50">
//       {/* Floating Toggle Button */}
//       {!isOpen && (
//         <motion.div 
//           className="fixed top-6 left-6 z-[60]"
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//         >
//           <button
//             onClick={() => setIsOpen(true)}
//             className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg transition-all flex items-center justify-center text-white"
//           >
//             <FaBars className="text-xl" />
//           </button>
//         </motion.div>
//       )}

//       {/* Animated Sidebar */}
//       <AnimatePresence>
//         {isOpen && (
//           <>
//             {/* Overlay */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 0.5 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setIsOpen(false)}
//               className="fixed inset-0 bg-black z-40"
//             />
            
//             {/* Sidebar Content */}
//             <motion.aside
//               initial={{ x: "-100%" }}
//               animate={{ x: 0 }}
//               exit={{ x: "-100%" }}
//               transition={{ type: "spring", stiffness: 300, damping: 30 }}
//               className="fixed top-0 left-0 h-screen w-[280px] bg-gradient-to-b from-gray-50 to-white border-r border-gray-100 shadow-2xl z-50"
//             >
//               {/* Header */}
//               <div className="flex items-center justify-between p-6 border-b border-gray-100">
//                 <div className="flex items-center gap-2">
//                   <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
//                     {panelType.charAt(0).toUpperCase()}
//                   </div>
//                   <h2 className="text-xl font-bold text-gray-800">
//                     {panelType
//                       .replace(/([A-Z])/g, " $1")
//                       .replace(/^./, (str) => str.toUpperCase())}
//                   </h2>
//                 </div>
//                 <button 
//                   onClick={() => setIsOpen(false)}
//                   className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                   </svg>
//                 </button>
//               </div>

//               {/* Scrollable Nav Items */}
//               <nav className="flex flex-col gap-1 p-4 overflow-y-auto max-h-[calc(100vh-120px)] pr-1 custom-scrollbar">
//                 {currentSidebarItems.map((item, index) => {
//                   if (item.type === "heading") {
//                     return (
//                       <div key={index} className="mt-6 mb-2 px-2">
//                         <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                           {item.text}
//                         </span>
//                       </div>
//                     );
//                   } else if (item.type === "link") {
//                     if (item.href === "/ai-product" && !hasAiAccess) {
//                       return null;
//                     }

//                     const Icon = iconComponents[item.icon];
//                     const isActive = location.pathname === item.href;

//                     return (
//                       <motion.div
//                         key={index}
//                         whileHover={{ scale: 1.02 }}
//                         whileTap={{ scale: 0.98 }}
//                         onHoverStart={() => setActiveHover(index)}
//                         onHoverEnd={() => setActiveHover(null)}
//                       >
//                         <Link
//                           to={item.href}
//                           onClick={() => setIsOpen(false)}
//                           className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
//                             isActive
//                               ? "bg-indigo-50 text-indigo-600"
//                               : "text-gray-600 hover:bg-gray-100"
//                           }`}
//                         >
//                           {isActive && (
//                             <motion.span
//                               layoutId="activeIndicator"
//                               className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full"
//                               initial={false}
//                               transition={{ type: "spring", stiffness: 500, damping: 30 }}
//                             />
//                           )}
//                           <div className={`p-2 rounded-lg ${
//                             isActive 
//                               ? "bg-indigo-100 text-indigo-600" 
//                               : "bg-gray-100 text-gray-600"
//                           }`}>
//                             <Icon className="text-lg" />
//                           </div>
//                           <span className="text-sm font-medium">{item.text}</span>
//                           {activeHover === index && (
//                             <motion.div
//                               className="absolute right-4 text-gray-400"
//                               initial={{ opacity: 0, x: -10 }}
//                               animate={{ opacity: 1, x: 0 }}
//                               exit={{ opacity: 0, x: -10 }}
//                             >
//                               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                               </svg>
//                             </motion.div>
//                           )}
//                         </Link>
//                       </motion.div>
//                     );
//                   }
//                   return null;
//                 })}

//                 {/* Settings */}
//                 <motion.div
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   <button
//                     onClick={handleSettings}
//                     className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
//                       location.pathname === "/settings"
//                         ? "bg-indigo-50 text-indigo-600"
//                         : "text-gray-600 hover:bg-gray-100"
//                     }`}
//                   >
//                     <div className={`p-2 rounded-lg ${
//                       location.pathname === "/settings" 
//                         ? "bg-indigo-100 text-indigo-600" 
//                         : "bg-gray-100 text-gray-600"
//                     }`}>
//                       <FaCog className="text-lg" />
//                     </div>
//                     <span className="text-sm font-medium">Settings</span>
//                   </button>
//                 </motion.div>

//                 {/* Logout */}
//                 <motion.div
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   className="mt-4"
//                 >
//                   <button
//                     onClick={handleLogout}
//                     className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
//                   >
//                     <div className="p-2 rounded-lg bg-red-100 text-red-600">
//                       <FaSignOutAlt className="text-lg" />
//                     </div>
//                     <span className="text-sm font-medium">Logout</span>
//                   </button>
//                 </motion.div>
//               </nav>

//               {/* Footer */}
//               <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
//                 <div className="flex items-center justify-between">
//                   <div className="text-xs text-gray-500">
//                     {/* v{process.env.REACT_APP_VERSION} */}
//                   </div>
//                   <div className="text-xs text-gray-500">
//                     © {new Date().getFullYear()}
//                   </div>
//                 </div>
//               </div>
//             </motion.aside>
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// export default Sidebar;