import React, { useState, useEffect } from "react";
import { useSnapshot } from "valtio";
import { motion } from "framer-motion";
import { FaCamera, FaTrash } from "react-icons/fa";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import colorNamer from 'color-namer';
import state from "../store";
import { downloadCanvasToImage } from "../config/helpers";
import { CustomButton } from "../components";

const SIZE_OPTIONS = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
  '28', '30', '32', '34', '36', '38', '40',
  'One Size'
];

const AddProductForm = ({ onClose }) => {
  const snap = useSnapshot(state);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [removedImageUrls, setRemovedImageUrls] = useState([]);
  const [errors, setErrors] = useState([]);

  const [product, setProduct] = useState({
    product_name: "",
    sku: "",
    product_price: "",
    weight: "",
    product_description: "",
    url_key: "",
    product_status: "enabled",
    product_visibility: "visible",
    manage_stock: "No",
    stock_available: "Yes",
  });

  const [attributes, setAttributes] = useState([{ 
    id: Date.now(),
    color_name: colorNamer(snap.color).basic[0].name || 'Custom Color',
    color_hex: snap.color,
    sizes: [{ id: Date.now() + 1, size: 'M', quantity: 10 }]
  }]);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');

  // useEffect(() => {
  //   // Capture the product image when component mounts
  //   const captureProductImage = async () => {
  //     try {
  //       const productImage = await downloadCanvasToImage('product', true);
  //       setImages([{
  //         file: productImage.file,
  //         preview: productImage.url
  //       }]);
  //     } catch (error) {
  //       console.error("Error capturing product image:", error);
  //       toast.error("Failed to capture product image");
  //     }
  //   };

  //   captureProductImage();

  //   // Set initial attributes based on customization
  //   setAttributes([{ 
  //     id: Date.now(),
  //     color_name: colorNamer(snap.color).basic[0].name || 'Custom Color',
  //     color_hex: snap.color,
  //     sizes: [{ id: Date.now() + 1, size: 'M', quantity: 10 }]
  //   }]);
  // }, []);
  useEffect(() => {
  // const captureImages = async () => {
  //   try {
  //     // Capture product image
  //     const productImage = await downloadCanvasToImage('product');
      
  //     // Capture logo if enabled
  //     const logoImage = snap.isLogoTexture && snap.logoDecal 
  //       ? { file: null, preview: snap.logoDecal }
  //       : null;
      
  //     // Capture texture if enabled
  //     const textureImage = snap.isFullTexture && snap.fullDecal 
  //       ? { file: null, preview: snap.fullDecal }
  //       : null;

  //     // Combine all images
  //     const allImages = [
  //       productImage,
  //       ...(logoImage ? [logoImage] : []),
  //       ...(textureImage ? [textureImage] : [])
  //     ].filter(img => img && img.preview);

  //     setImages(allImages);
  //     console.log(allImages);
  //   } catch (error) {
  //     console.error("Error capturing images:", error);
  //     toast.error("Failed to capture product images");
  //   }
  // };
  const captureImages = async () => {
  try {
    // Capture product image
    const productImage = await downloadCanvasToImage('product');
    
    // Initialize images array with the product image
    const allImages = [productImage];
    
    // Add logo if enabled and exists
    if (snap.isLogoTexture && snap.logoDecal) {
      allImages.push({
        file: null, // Will be converted to file later
        preview: snap.logoDecal,
        type: 'logo'
      });
    }
    
    // Add full texture if enabled and exists
    if (snap.isFullTexture && snap.fullDecal) {
      allImages.push({
        file: null, // Will be converted to file later
        preview: snap.fullDecal,
        type: 'texture'
      });
    }

    setImages(allImages);
  } catch (error) {
    console.error("Error capturing images:", error);
    toast.error("Failed to capture product images");
  }
};

  // Set initial attributes based on customization
  setAttributes([{ 
    id: Date.now(),
    color_name: colorNamer(snap.color).basic[0].name || 'Custom Color',
    color_hex: snap.color,
    sizes: [{ id: Date.now() + 1, size: 'M', quantity: 10 }]
  }]);

  captureImages();
}, []);

  const handleProductChange = (field, value) => {
    setProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleColorChange = (colorId, field, value) => {
    setAttributes(prev =>
      prev.map(attr =>
        attr.id === colorId
          ? {
              ...attr,
              [field]: value,
              ...(field === 'color_hex' && {
                color_name: !attr.color_name || 
                           colorNamer(attr.color_hex).basic[0].name === attr.color_name
                  ? colorNamer(value).basic[0].name
                  : attr.color_name
              })
            }
          : attr
      )
    );
  };

  const handleSizeChange = (colorId, sizeId, field, value) => {
    setAttributes(prev =>
      prev.map(attr =>
        attr.id === colorId
          ? {
              ...attr,
              sizes: attr.sizes.map(size =>
                size.id === sizeId
                  ? {
                      ...size,
                      [field]: field === 'quantity' ? parseInt(value) || 0 : value
                    }
                  : size
              )
            }
          : attr
      )
    );
  };

  const addColor = () => {
    setAttributes(prev => [
      ...prev,
      { 
        id: Date.now(),
        color_name: '', 
        color_hex: '#000000', 
        sizes: [{ id: Date.now() + 1, size: 'M', quantity: 10 }]
      }
    ]);
  };

  const removeColor = (colorId) => {
    setAttributes(prev => 
      prev.length > 1 
        ? prev.filter(attr => attr.id !== colorId)
        : prev
    );
  };

  const addSize = (colorId) => {
    setAttributes(prev => 
      prev.map(attr => 
        attr.id === colorId
          ? {
              ...attr,
              sizes: [
                ...attr.sizes,
                { id: Date.now(), size: 'M', quantity: 10 }
              ]
            }
          : attr
      )
    );
  };

  const removeSize = (colorId, sizeId) => {
    setAttributes(prev => 
      prev.map(attr => 
        attr.id === colorId
          ? {
              ...attr,
              sizes: attr.sizes.length > 1 
                ? attr.sizes.filter(size => size.id !== sizeId)
                : attr.sizes
            }
          : attr
      )
    );
  };

  const validate = () => {
    const newErrors = [];
    let isValid = true;

    if (!product.product_name.trim()) {
      toast.error("Product name is required");
      isValid = false;
    }

    if (!product.sku.trim()) {
      toast.error("SKU is required");
      isValid = false;
    }

    if (!product.product_price || isNaN(product.product_price)) {
      toast.error("Valid price is required");
      isValid = false;
    }

    if (!selectedCategoryId) {
      toast.error("Please select a category");
      isValid = false;
    }

    if (images.length === 0) {
      toast.error("At least one product image is required");
      isValid = false;
    }

    return isValid;
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    setImages(prev => {
      const updated = [...prev];
      const removed = updated.splice(index, 1)[0];
      
      if (removed.preview && removed.preview.startsWith('blob:')) {
        URL.revokeObjectURL(removed.preview);
      }
      
      if (!removed.file && removed.preview) {
        setRemovedImageUrls(prevUrls => [...prevUrls, removed.preview]);
      }
      return updated;
    });
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    const formData = new FormData();
    const business_id = localStorage.getItem("business_id");
    
    if (!business_id) {
      toast.error("Business ID not found. Please login again.");
      return;
    }

    // Append all form data
    formData.append("business_id", business_id);
    formData.append("category_id", selectedCategoryId);
    formData.append("sku", product.sku);
    formData.append("product_name", product.product_name);
    formData.append("product_description", product.product_description);
    formData.append("product_price", product.product_price);
    formData.append("weight", product.weight);
    formData.append("manage_stock", product.manage_stock);
    formData.append("stock_availability", product.stock_available);
    formData.append("product_status", product.product_status);
    formData.append("product_visibility", product.product_visibility);
    formData.append("url_key", product.url_key);
    formData.append("attributes", JSON.stringify(attributes));

    // Add the custom design properties
    formData.append("custom_design", JSON.stringify({
      color: snap.color,
      isLogoTexture: snap.isLogoTexture,
      isFullTexture: snap.isFullTexture,
      logoDecal: snap.logoDecal,
      fullDecal: snap.fullDecal
    }));

    if (removedImageUrls.length > 0) {
      formData.append("removedImages", JSON.stringify(removedImageUrls));
    }

    // images.forEach((img) => {
    //   if (img.file) {
    //     formData.append("images", img.file);
    //   }
    // });
  //    for (const img of images) {
  //   if (img?.file instanceof File) {
  //     formData.append("images", img.file);
  //   } else if (img?.preview) {
  //     // For images that only have preview (logo/texture), convert to file
  //     try {
  //       const response = await fetch(img.preview);
  //       const blob = await response.blob();
  //       const file = new File([blob], `design-${Date.now()}.png`, { type: 'image/png' });
  //       formData.append("images", file);
  //     } catch (error) {
  //       console.error("Error converting image to file:", error);
  //       continue;
  //     }
  //   }
  // }
  for (const img of images) {
    if (img?.file instanceof File) {
      // Regular uploaded file
      formData.append("images", img.file);
    } else if (img?.preview) {
      try {
        // For canvas images and AI-generated images
        let blob;
        
        if (img.preview.startsWith('blob:')) {
          // For canvas-generated images
          const response = await fetch(img.preview);
          blob = await response.blob();
        } else {
          // For base64 images (AI-generated)
          const base64Response = await fetch(img.preview);
          blob = await base64Response.blob();
        }
        
        const fileName = img.type 
          ? `design-${img.type}-${Date.now()}.png` 
          : `design-${Date.now()}.png`;
        
        const file = new File([blob], fileName, { type: 'image/png' });
        formData.append("images", file);
      } catch (error) {
        console.error("Error converting image to file:", error);
        continue;
      }
    }
  }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/products", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Custom product created successfully!");
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'All unsaved changes will be lost.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel',
      cancelButtonText: 'No, stay',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });
  
    if (result.isConfirmed) {
      onClose();
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Add Custom Product to Store</h2>
            <button 
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Product Info */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-3">General Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Product Name</label>
                    <Input
                      value={product.product_name}
                      onChange={(e) => handleProductChange('product_name', e.target.value)}
                      placeholder="Custom T-Shirt Design"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">SKU</label>
                      <Input
                        value={product.sku}
                        onChange={(e) => handleProductChange('sku', e.target.value)}
                        placeholder="CTD-001"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Price</label>
                      <Input
                        type="number"
                        value={product.product_price}
                        onChange={(e) => handleProductChange('product_price', e.target.value)}
                        placeholder="29.99"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                      <Input
                        type="number"
                        value={product.weight}
                        onChange={(e) => handleProductChange('weight', e.target.value)}
                        placeholder="0.5"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setShowCategoryModal(true);
                          fetchCategories();
                        }}
                        className="w-full text-left p-2 border rounded bg-white hover:bg-gray-100"
                      >
                        {selectedCategoryName || "Select category"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={product.product_description}
                      onChange={(e) => handleProductChange('product_description', e.target.value)}
                      className="w-full border rounded p-2 h-24"
                      placeholder="Describe your custom product..."
                    />
                  </div>
                </div>
              </div>

              {/* SEO Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-3">Search Engine Optimization</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">URL Key</label>
                    <Input
                      value={product.url_key}
                      onChange={(e) => handleProductChange('url_key', e.target.value)}
                      placeholder="custom-t-shirt-design"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-3">Product Images</h3>
                <div className="flex flex-wrap gap-4">
                  {images.map((img, index) => (
                    img.preview ? (
                      <div key={index} className="relative h-32 w-32 rounded-md overflow-hidden border">
                        <img 
                          src={img.preview} 
                          alt={`preview-${index}`} 
                          className="object-cover w-full h-full" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/128?text=Image+Error";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-white p-1 rounded-full shadow hover:bg-red-100"
                        >
                          <FaTrash className="text-red-500 text-sm" />
                        </button>
                      </div>
                    ) : null
                  ))}
                  <label className="border-2 border-dashed border-gray-300 rounded-md flex justify-center items-center h-32 w-32 cursor-pointer overflow-hidden relative hover:border-blue-500">
                    <FaCamera className="text-teal-600 text-2xl" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleImageChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Variants and Settings */}
            <div className="space-y-6">
              {/* Inventory Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-3">Inventory</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Manage Stock</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={product.manage_stock === "No"}
                          onChange={() => handleProductChange('manage_stock', "No")}
                          className="mr-2"
                        />
                        No
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={product.manage_stock === "Yes"}
                          onChange={() => handleProductChange('manage_stock', "Yes")}
                          className="mr-2"
                        />
                        Yes
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Stock Availability</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={product.stock_available === "No"}
                          onChange={() => handleProductChange('stock_available', "No")}
                          className="mr-2"
                        />
                        No
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={product.stock_available === "Yes"}
                          onChange={() => handleProductChange('stock_available', "Yes")}
                          className="mr-2"
                        />
                        Yes
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-3">Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={product.product_status === "enabled"}
                          onChange={() => handleProductChange('product_status', "enabled")}
                          className="mr-2"
                        />
                        Enabled
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={product.product_status === "disabled"}
                          onChange={() => handleProductChange('product_status', "disabled")}
                          className="mr-2"
                        />
                        Disabled
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Visibility</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={product.product_visibility === "visible"}
                          onChange={() => handleProductChange('product_visibility', "visible")}
                          className="mr-2"
                        />
                        Visible
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={product.product_visibility === "not_visible"}
                          onChange={() => handleProductChange('product_visibility', "not_visible")}
                          className="mr-2"
                        />
                        Not Visible
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-3">Product Variants</h3>
                {attributes.map((attr) => (
                  <div key={attr.id} className="mb-4 p-3 border rounded bg-white">
                    <div className="flex items-center gap-3 mb-2">
                      <input
                        type="color"
                        value={attr.color_hex}
                        onChange={(e) => handleColorChange(attr.id, 'color_hex', e.target.value)}
                        className="w-8 h-8 border rounded cursor-pointer"
                      />
                      <Input
                        value={attr.color_name}
                        onChange={(e) => handleColorChange(attr.id, 'color_name', e.target.value)}
                        className="flex-1"
                      />
                      {attributes.length > 1 && (
                        <button 
                          onClick={() => removeColor(attr.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {attr.sizes.map((size) => (
                        <div key={size.id} className="flex items-center gap-2">
                          <select
                            value={size.size}
                            onChange={(e) => handleSizeChange(attr.id, size.id, 'size', e.target.value)}
                            className="flex-1 p-1 border rounded"
                          >
                            {SIZE_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <Input
                            type="number"
                            value={size.quantity}
                            onChange={(e) => handleSizeChange(attr.id, size.id, 'quantity', e.target.value)}
                            className="w-20"
                            min="0"
                          />
                          {attr.sizes.length > 1 && (
                            <button 
                              onClick={() => removeSize(attr.id, size.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => addSize(attr.id)}
                        className="text-sm text-blue-500 hover:text-blue-700"
                      >
                        + Add Size
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addColor}
                  className="w-full mt-2 text-sm text-blue-500 hover:text-blue-700"
                >
                  + Add Color Variant
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <CustomButton
              type="outline"
              title="Cancel"
              handleClick={handleCancel}
              customStyle="px-6 py-2"
            />
            <CustomButton
              type="filled"
              title={loading ? "Saving..." : "Save Product"}
              handleClick={handleSave}
              customStyle="px-6 py-2 bg-green-600 hover:bg-green-700"
              disabled={loading}
            />
          </div>
        </div>

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96 max-h-[80vh] flex flex-col">
              <h2 className="text-xl font-bold mb-4">Select Category</h2>
              <div className="flex-1 overflow-y-auto">
                <ul>
                  {categories.map((cat) => (
                    <li key={cat.id} className="mb-2">
                      <button
                        className="text-left w-full hover:bg-gray-100 p-2 rounded"
                        onClick={() => {
                          setSelectedCategoryId(cat.id);
                          setSelectedCategoryName(cat.name);
                          setShowCategoryModal(false);
                        }}
                      >
                        {cat.name}
                      </button>

                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <ul className="ml-4 mt-2">
                          {cat.subcategories.map((sub) => (
                            <li key={sub.id} className="mb-2">
                              <button
                                className="text-left w-full hover:bg-gray-100 p-2 rounded"
                                onClick={() => {
                                  setSelectedCategoryId(sub.id);
                                  setSelectedCategoryName(`${cat.name} > ${sub.name}`);
                                  setShowCategoryModal(false);
                                }}
                              >
                                {sub.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                className="mt-4 text-red-500 hover:underline self-start"
                onClick={() => setShowCategoryModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};


export default AddProductForm;