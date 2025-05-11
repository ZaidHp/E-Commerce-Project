// import React from "react";

// import CustomButton from "./CustomButton";

// const AIPicker = ({ prompt, setPrompt, generatingImg, handleSubmit }) => {
//   return (
//     <div className="aipicker-container">
//       <textarea
//         placeholder="Ask AI..."
//         rows={5}
//         value={prompt}
//         onChange={(e) => setPrompt(e.target.value)}
//         className="aipicker-textarea"
//       />
//       <div className="flex flex-wrap gap-3">
//         {generatingImg ? (
//           <CustomButton
//             type="outline"
//             title="Asking AI..."         
//             customStyle="text-xs"
//             /> 
//         ):(
//           <>
//             <CustomButton 
//               type="outline"
//               title="AI logo"
//               handleClick={() => handleSubmit("logo")}
//               customStyle="text-xs"
//             />
//             <CustomButton 
//               type="filled"
//               title="AI Pattern"
//               handleClick={() => handleSubmit("full")}
//               customStyle="text-xs"
//             />
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AIPicker;



import React, { useState } from "react";
import CustomButton from "./CustomButton";

const AIPicker = ({ prompt, setPrompt, generatingImg, handleSubmit }) => {
  const [error, setError] = useState(null);

  const handleGeneration = async (type) => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }
    setError(null);
    try {
      await handleSubmit(type);
    } catch (err) {
      setError(err.message || "Failed to generate image");
    }
  };

  return (
    <div className="aipicker-container">
      <textarea
        placeholder="Ask AI... (Describe what you want to generate)"
        rows={5}
        value={prompt}
        onChange={(e) => {
          setPrompt(e.target.value);
          setError(null); // Clear error when typing
        }}
        className="aipicker-textarea"
      />
      
      {/* Error display */}
      {error && (
        <div className="text-red-500 text-xs mt-1 p-2 bg-red-50 rounded">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-3">
        {generatingImg ? (
          <div className="flex items-center gap-2 w-full">
            <CustomButton
              type="outline"
              title="Generating..." 
              disabled
              customStyle="text-xs flex-1"
            />
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800"></div>
          </div>
        ) : (
          <>
            <CustomButton 
              type="outline"
              title="Generate Logo"
              handleClick={() => handleGeneration("logo")}
              customStyle="text-xs flex-1"
              disabled={!prompt.trim()}
            />
            <CustomButton 
              type="filled"
              title="Generate Full Texture"
              handleClick={() => handleGeneration("full")}
              customStyle="text-xs flex-1"
              disabled={!prompt.trim()}
            />
          </>
        )}
      </div>

      
    </div>
  );
};

export default AIPicker;