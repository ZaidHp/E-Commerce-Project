// // sidebarData.js
// const has_ai_access = JSON.parse(localStorage.getItem("has_ai_access")) === true;
// export const sidebarItems = {
//   businessPanel: [
//     {
//       type: "heading",
//       text: "QUICK LINKS",
//     },
//     {
//       type: "link",
//       text: "Dashboard",
//       icon: "FaHome",
//       href: "/dashboard",
//       className:
//         "text-neutral-800 mb-2 mr-5 px-3 font-semibold outline outline-slate-400 rounded-se-full p-1 hover:text-blue-500 hover:outline-blue-500",
//     },

//     {
//       type: "heading",
//       text: "PRODUCTS",
//     },
//     {
//       type: "link",
//       text: "New Product",
//       icon: "FaPlus",
//       href: "/new-product",
//       className:
//         "text-neutral-800 mb-3 px-3 font-semibold hover:text-gray-800 hover:outline-blue-500 bg-blue-500 text-white rounded-se-full p-1",
//     },
//     {
//       type: "link",
//       text: "Listed Products",
//       icon: "FaArchive",
//       href: "/products",
//       className:
//         "text-neutral-800 mb-3 px-3 font-semibold outline outline-slate-400 rounded-se-xl p-1 hover:text-blue-500 hover:outline-blue-500",
//     },
//     ...(has_ai_access
//       ? [
//           {
//             type: "link",
//             text: "AI Product",
//             icon: "FaRobot",
//             href: "/ai-product",
//             className:
//               "text-neutral-800 mb-3 mr-3 lg:mr-7 px-3 font-semibold outline outline-slate-400 rounded-ee-full p-1 hover:text-blue-500 hover:outline-blue-500",
//           },
//         ]
//       : []),
    // {
    //   type: "link",
    //   text: "AI Product",
    //   icon: "FaRobot",
    //   href: "/ai-product",
    //   className:
    //     "text-neutral-800 mb-3 mr-3 lg:mr-7 px-3 font-semibold outline outline-slate-400 rounded-ee-full p-1 hover:text-blue-500 hover:outline-blue-500",
    // },
//     {
//       type: "link",
//       text: "Product Reviews",
//       icon: "FaStar",
//       href: "/product-reviews",
//       className:
//         "text-neutral-800 mb-3 mr-3 lg:mr-7 px-3 font-semibold outline outline-slate-400 rounded-ee-full p-1 hover:text-blue-500 hover:outline-blue-500",
//     },
//     {
//       type: "heading",
//       text: "SALE",
//     },
//     {
//       type: "link",
//       text: "Orders",
//       icon: "FaBox",
//       href: "/orders",
//       className:
//         "text-neutral-800 mb-3 px-3 font-semibold outline outline-slate-400 rounded-ee-xl p-1 hover:text-blue-500 hover:outline-blue-500",
//     },
//     {
//       type: "link",
//       text: "Payments",
//       icon: "FaMoneyBillWave",
//       href: "/payments",
//       className:
//         "text-neutral-800 mb-3 mr-3 lg:mr-7 px-3 font-semibold outline outline-slate-400 rounded-ee-full p-1 hover:text-blue-500 hover:outline-blue-500",
//     },
//     {
//       type: "heading",
//       text: "CUSTOMER INFORMATION AND FEEDBACK",
//     },
//     {
//       type: "link",
//       text: "Customers",
//       icon: "FaUserFriends",
//       href: "/customers",
//       className:
//         "text-neutral-800 mb-3 mr-3 lg:mr-7 px-3 font-semibold outline outline-slate-400 rounded-ee-full p-1 hover:text-blue-500 hover:outline-blue-500",
//     },
    
//     {
//       type: "link",
//       text: "Business Reviews",
//       icon: "FaBuilding",
//       href: "/business-reviews",
//       className:
//         "text-neutral-800 mb-3 mr-3 lg:mr-7 px-3 font-semibold outline outline-slate-400 rounded-ee-full p-1 hover:text-blue-500 hover:outline-blue-500",
//     }
    
    
//     // {
//     //   type: "link",
//     //   text: "Settings",
//     //   icon: "FaCog",
//     //   href: "/settings",
//     //   className: "text-2x text-neutral-800 mt-7 -ml-3 hover:text-blue-500",
//     // },
//   ],
// };

const has_ai_access = JSON.parse(localStorage.getItem("has_ai_access")) === true;
// console.log(localStorage.getItem("has_ai_access"));
export const sidebarItems = {
  businessPanel: [
    {
      type: "heading",
      text: "QUICK LINKS",
    },
    {
      type: "link",
      text: "Dashboard",
      icon: "FaHome",
      href: "/dashboard",
      className:
        "text-neutral-800 mb-2 mr-5 px-3 font-semibold outline outline-slate-400 rounded-se-full p-1 hover:text-blue-500 hover:outline-blue-500",
    },

    {
      type: "heading",
      text: "PRODUCTS",
    },
    {
      type: "link",
      text: "New Product",
      icon: "FaPlus",
      href: "/new-product",
      className:
        "text-neutral-800 mb-3 px-3 font-semibold hover:text-gray-800 hover:outline-blue-500 bg-blue-500 text-white rounded-se-full p-1",
    },
    {
      type: "link",
      text: "Listed Products",
      icon: "FaArchive",
      href: "/products",
      className:
        "text-neutral-800 mb-3 px-3 font-semibold outline outline-slate-400 rounded-se-xl p-1 hover:text-blue-500 hover:outline-blue-500",
    },
    ...(has_ai_access
      ? [
          {
            type: "link",
            text: "AI Product",
            icon: "FaRobot",
            href: "/create-custom-AIproduct",
            className:
              "text-neutral-800 mb-3 mr-3 lg:mr-7 px-3 font-semibold outline outline-slate-400 rounded-ee-full p-1 hover:text-blue-500 hover:outline-blue-500",
          },
        ]
      : []),
    {
      type: "link",
      text: "Product Reviews",
      icon: "FaStar",
      href: "/product-reviews",
      className:
        "text-neutral-800 mb-3 mr-3 lg:mr-7 px-3 font-semibold outline outline-slate-400 rounded-ee-full p-1 hover:text-blue-500 hover:outline-blue-500",
    },
    {
      type: "heading",
      text: "SALE",
    },
    {
      type: "link",
      text: "Orders",
      icon: "FaBox",
      href: "/orders",
      className:
        "text-neutral-800 mb-3 px-3 font-semibold outline outline-slate-400 rounded-ee-xl p-1 hover:text-blue-500 hover:outline-blue-500",
    },
    {
      type: "link",
      text: "Payments",
      icon: "FaMoneyBillWave",
      href: "/payments",
      className:
        "text-neutral-800 mb-3 mr-3 lg:mr-7 px-3 font-semibold outline outline-slate-400 rounded-ee-full p-1 hover:text-blue-500 hover:outline-blue-500",
    },
    {
      type: "heading",
      text: "CUSTOMER INFORMATION AND FEEDBACK",
    },
    {
      type: "link",
      text: "Customers",
      icon: "FaUserFriends",
      href: "/customers",
      className:
        "text-neutral-800 mb-3 mr-3 lg:mr-7 px-3 font-semibold outline outline-slate-400 rounded-ee-full p-1 hover:text-blue-500 hover:outline-blue-500",
    },
    {
      type: "link",
      text: "Business Reviews",
      icon: "FaBuilding",
      href: "/business-reviews",
      className:
        "text-neutral-800 mb-3 mr-3 lg:mr-7 px-3 font-semibold outline outline-slate-400 rounded-ee-full p-1 hover:text-blue-500 hover:outline-blue-500",
    },
  ],
};
