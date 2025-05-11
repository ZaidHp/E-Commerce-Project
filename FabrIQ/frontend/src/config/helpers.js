import axios from 'axios';

// export const downloadCanvasToImage = () => {
//   const canvas = document.querySelector("canvas");
//   const dataURL = canvas.toDataURL();
//   const link = document.createElement("a");

//   link.href = dataURL;
//   link.download = "canvas.png";
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// };

export const reader = (file) =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.readAsDataURL(file);
  });

export const getContrastingColor = (color) => {
  // Remove the '#' character if it exists
  const hex = color.replace("#", "");

  // Convert the hex string to RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate the brightness of the color
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Return black or white depending on the brightness
  return brightness > 128 ? "black" : "white";
};


// export const uploadImage = async (base64Image) => {
//   try {
//     const response = await fetch('http://localhost:8080/api/v1/image/upload', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ image: base64Image })
//     });
    
//     const data = await response.json();
//     if (!data.success) throw new Error(data.error);
    
//     return data.url;
//   } catch (error) {
//     console.error('Upload error:', error);
//     throw error; // Re-throw for handling in components
//   }
// };


export const uploadImage = async (base64Image, folder) => {
  try {
    const response = await axios.post('http://localhost:8080/api/upload', {
      image: base64Image,
      folder: folder, // 'logos', 'textures', or 'products'
    });
    return response.data.path; // Returns "/uploads/[folder]/[filename].png"
  } catch (error) {
    console.error("Upload failed:", error);
    throw error; // Re-throw for handling in components
  }
};

// In helpers.js
// export const uploadImage = async (image, folder, returnFile = false) => {
//   try {
//     const formData = new FormData();
//     const blob = await fetch(image).then(res => res.blob());
//     const file = new File([blob], `${folder}-${Date.now()}.png`, { type: 'image/png' });
//     formData.append('file', file);
//     formData.append('upload_preset', 'your_upload_preset');
    
//     const response = await fetch('http://localhost:8080/api/upload', {
//       method: 'POST',
//       body: formData
//     });
    
//     const data = await response.json();
    
//     if (returnFile) {
//       return {
//         url: data.secure_url,
//         file: file
//       };
//     }
//     return data.secure_url;
//   } catch (error) {
//     console.error('Error uploading image:', error);
//     throw error;
//   }
// };

// Capture canvas as image
// export const downloadCanvasToImage = async () => {
//   const canvas = document.querySelector('canvas');
//   if (!canvas) throw new Error('Canvas not found');
  
//   const dataURL = canvas.toDataURL('image/png');
//   return await uploadImage(dataURL, 'products'); // Uploads to 'products' folder
// };

// export const downloadCanvasToImage = async (type = 'product') => {
//   const canvas = document.querySelector('canvas');
//   if (!canvas) throw new Error('Canvas not found');
  
//   const dataURL = canvas.toDataURL('image/png');
  
//   // For product image, upload to products folder
//   if (type === 'product') {
//     return await uploadImage(dataURL, 'products');
//   }
  
//   // Return both file object and URL for form handling
//   const blob = await (await fetch(dataURL)).blob();
//   const file = new File([blob], `${type}.png`, { type: 'image/png' });
  
//   return {
//     file,
//     url: dataURL
//   };
// };

// export const downloadCanvasToImage = async (type = 'product') => {
//   const canvas = document.querySelector('canvas');
//   if (!canvas) throw new Error('Canvas not found');
  
//   const dataURL = canvas.toDataURL('image/png');
  
//   try {
//     // Convert data URL to File object
//     const response = await fetch(dataURL);
//     const blob = await response.blob();
//     const file = new File([blob], `${type}-${Date.now()}.png`, { type: 'image/png' });
    
//     return {
//       file,
//       preview: dataURL
//     };
//   } catch (error) {
//     console.error("Error converting canvas to image:", error);
//     throw error;
//   }
// };

export const downloadCanvasToImage = async (type = 'product') => {
  const canvas = document.querySelector('canvas');
  if (!canvas) throw new Error('Canvas not found');
  
  // Use higher quality settings
  const dataURL = canvas.toDataURL('image/png', 1.0);
  
  try {
    // Convert data URL to blob
    const response = await fetch(dataURL);
    const blob = await response.blob();
    
    // Create a more descriptive filename
    const fileName = `${type}-design-${Date.now()}.png`;
    const file = new File([blob], fileName, { type: 'image/png' });
    
    return {
      file,
      preview: dataURL,
      type
    };
  } catch (error) {
    console.error("Error converting canvas to image:", error);
    throw error;
  }
};

// export const downloadCanvasToImage = (elementId = 'canvas', returnFile = false) => {
//   return new Promise((resolve, reject) => {
//     try {
//       const canvas = document.getElementById(elementId);
//       if (!canvas) {
//         throw new Error(`Canvas element with ID ${elementId} not found`);
//       }

//       const dataURL = canvas.toDataURL('image/png');
//       const link = document.createElement('a');

//       if (!returnFile) {
//         link.download = `${elementId}-${Date.now()}.png`;
//         link.href = dataURL;
//         link.click();
//         resolve();
//       } else {
//         // Return both URL and File object
//         fetch(dataURL)
//           .then(res => res.blob())
//           .then(blob => {
//             const file = new File([blob], `${elementId}-${Date.now()}.png`, { type: 'image/png' });
//             resolve({
//               url: dataURL,
//               file: file
//             });
//           });
//       }
//     } catch (error) {
//       reject(error);
//     }
//   });
// };
