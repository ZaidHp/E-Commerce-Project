// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

//h-screen w-[60%] max-w-xs lg:min-w-full rounded-l-xl lg:w-[100%] bg-slate-300 fixed top-0 z-50 flex lg:items-center justify-center flex-col gap-4 p-4 px-5 rounded-r-full relative absolute lg:left-1/4 lg:-translate-x-full

//absolute lg:right-8 -translate-y-[50%] lg:w-[21%] h-[85%] flex flex-col  justify-center

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        varela: ["Varela Round", "sans-serif"],
        cinzel: ["Cinzel", "serif"],
      },
      colors: {
        indigo: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
};