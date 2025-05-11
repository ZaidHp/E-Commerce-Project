import axios from 'axios';

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