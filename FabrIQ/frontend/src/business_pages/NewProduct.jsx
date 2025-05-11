import React, { useState, useEffect } from "react";
import { FaCamera, FaTrash } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import colorNamer from 'color-namer';

const SIZE_OPTIONS = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
  '28', '30', '32', '34', '36', '38', '40',
  'One Size'
];

const NewProduct = ({ onChange, initialAttributes = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const productFromState = location.state?.product;
  const [existingProduct, setExistingProduct] = useState(productFromState || null);
  const [isLoading, setIsLoading] = useState(true);

  const [product, setProduct] = useState({
    product_name: "",
    sku: "",
    product_price: "",
    weight: "",
    product_description: "",
    url_key: "",
    product_status: "disabled",
    product_visibility: "not_visible",
    manage_stock: "No",
    stock_available: "No",
  });

  const [images, setImages] = useState([]);
  const [removedImageUrls, setRemovedImageUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attributes, setAttributes] = useState(() => {
    const initial = initialAttributes.length > 0 
      ? initialAttributes 
      : [{ 
          id: Date.now(), 
          color_name: '', 
          color_hex: '#000000', 
          sizes: [{ id: Date.now() + 1, size: '', quantity: 0 }] 
        }];
    
    return initial.map(attr => ({
      ...attr,
      id: attr.id || Date.now() + Math.random(),
      sizes: attr.sizes.map(size => ({
        ...size,
        id: size.id || Date.now() + Math.random()
      }))
    }));
  });
  const [errors, setErrors] = useState([]);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');

  useEffect(() => {
    if (initialAttributes.length > 0) {
      setAttributes(initialAttributes);
    }
  }, [initialAttributes]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const productId = searchParams.get("id");

    if (!productFromState && productId) {
      fetch(`http://localhost:8080/api/products/${productId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setExistingProduct(data);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching product:", err);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [productFromState, location.search]);

  useEffect(() => {
    if (existingProduct && !isLoading) {
      const BACKEND_URL = "http://localhost:8080";
      
      setProduct({
        product_name: existingProduct.product_name || "",
        sku: existingProduct.sku || "",
        product_price: existingProduct.product_price || "",
        weight: existingProduct.weight || "",
        product_description: existingProduct.product_description || "",
        url_key: existingProduct.url_key || "",
        product_status: existingProduct.product_status || "disabled",
        product_visibility: existingProduct.product_visibility || "not_visible",
        manage_stock: existingProduct.manage_stock || "No",
        stock_available: existingProduct.stock_availability || "No",
      });

      if (existingProduct.images && Array.isArray(existingProduct.images)) {
        const formatted = existingProduct.images.map((imgUrl) => ({
          file: null,
          preview: imgUrl.startsWith("http") ? imgUrl : `${BACKEND_URL}${imgUrl}`,
        }));
        setImages(formatted);
      }

      if (existingProduct.category) {
        const { id: parentId, name: parentName, subcategories } = existingProduct.category;
      
        if (subcategories && subcategories.length > 0) {
          setSelectedCategoryId(subcategories[0].id);
          setSelectedCategoryName(`${parentName} > ${subcategories[0].name}`);
        } else {
          setSelectedCategoryId(parentId);
          setSelectedCategoryName(parentName);
        }
      }

      if (existingProduct.attributes && Array.isArray(existingProduct.attributes)) {
        setAttributes(existingProduct.attributes.length > 0 
          ? existingProduct.attributes.map(attr => ({
              ...attr,
              id: attr.id || Date.now() + Math.random(),
              sizes: attr.sizes.map(size => ({
                ...size,
                id: size.id || Date.now() + Math.random()
              }))
            }))
          : [{ 
              id: Date.now(), 
              color_name: '', 
              color_hex: '#000000', 
              sizes: [{ id: Date.now() + 1, size: '', quantity: 0 }] 
            }]
        );
      }
    }
  }, [existingProduct, isLoading]);

  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image.preview && image.preview.startsWith('blob:')) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [images]);

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
        sizes: [{ id: Date.now() + 1, size: '', quantity: 0 }]
      }
    ]);
    
    setTimeout(() => {
      const container = document.querySelector('.attributes-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 0);
  };

  const removeColor = (colorId) => {
    setAttributes(prev => 
      prev.length > 1 
        ? prev.filter(attr => attr.id !== colorId)
        : [{ 
            id: Date.now(),
            color_name: '', 
            color_hex: '#000000', 
            sizes: [{ id: Date.now() + 1, size: '', quantity: 0 }]
          }]
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
                { id: Date.now(), size: '', quantity: 0 }
              ]
            }
          : attr
      )
    );
    
    setTimeout(() => {
      const container = document.querySelector('.attributes-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 0);
  };

  const removeSize = (colorId, sizeId) => {
    setAttributes(prev => 
      prev.map(attr => 
        attr.id === colorId
          ? {
              ...attr,
              sizes: attr.sizes.length > 1 
                ? attr.sizes.filter(size => size.id !== sizeId)
                : [{ id: Date.now(), size: '', quantity: 0 }]
            }
          : attr
      )
    );
  };

  const validate = () => {
    const newErrors = [];
    let isValid = true;

    attributes.forEach((attr, i) => {
      const attrErrors = { color_name: '', sizes: [] };

      if (!attr.color_name.trim()) {
        attrErrors.color_name = 'Color name is required';
        isValid = false;
      }

      attr.sizes.forEach((sz, j) => {
        const sizeError = { size: '', quantity: '' };
        if (!sz.size.trim()) {
          sizeError.size = 'Size required';
          isValid = false;
        }
        if (isNaN(sz.quantity)) {
          sizeError.quantity = 'Invalid quantity';
          isValid = false;
        }
        attrErrors.sizes.push(sizeError);
      });

      newErrors.push(attrErrors);
    });

    setErrors(newErrors);
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
    if (!validate()) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    const formData = new FormData();
    const business_id = localStorage.getItem("business_id");
    
    if (!business_id) {
      toast.error("Business ID not found. Please login again.");
      return;
    }

    if (!selectedCategoryId) {
      toast.error("Please select a category");
      return;
    }

    // Basic validation
    const requiredFields = [
      { field: 'sku', name: 'SKU' },
      { field: 'product_name', name: 'Name' },
      { field: 'product_description', name: 'Description' },
      { field: 'product_price', name: 'Price' },
      { field: 'weight', name: 'Weight' },
      { field: 'url_key', name: 'URL Key' }
    ];

    const missingFields = requiredFields
      .filter(({ field }) => !product[field])
      .map(({ name }) => name);

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(", ")}`);
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

    if (removedImageUrls.length > 0) {
      formData.append("removedImages", JSON.stringify(removedImageUrls));
    }

    images.forEach((img) => {
      if (img.file) {
        formData.append("images", img.file);
      } else if (img.preview && !img.preview.startsWith('blob:')) {
        formData.append("existingImages", img.preview);
      }
    });

    setLoading(true);
    try {
      const isEditing = !!existingProduct;
      const productId = isEditing ? existingProduct.product_id : null;

      const response = await fetch(
        isEditing
          ? `http://localhost:8080/api/products/${productId}`
          : "http://localhost:8080/api/products",
        {
          method: isEditing ? "PUT" : "POST",
          body: formData,
        }
      );

      if (response.ok) {
        toast.success(isEditing ? "Product updated successfully!" : "Product created successfully!");
        navigate("/products");
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

  const resetForm = () => {
    setProduct({
      product_name: "",
      sku: "",
      product_price: "",
      weight: "",
      product_description: "",
      url_key: "",
      product_status: "disabled",
      product_visibility: "not_visible",
      manage_stock: "No",
      stock_available: "No",
    });
    setImages([]);
    setExistingProduct(null);
    setRemovedImageUrls([]);
    setSelectedCategoryId(null);
    setSelectedCategoryName('');
    setAttributes([{ 
      id: Date.now(),
      color_name: '', 
      color_hex: '#000000', 
      sizes: [{ id: Date.now() + 1, size: '', quantity: 0 }] 
    }]);
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
      if (existingProduct) {
        navigate("/products");
      } else {
        resetForm();
      }
    }
  };

  if (isLoading) {
    return <div className="ml-[220px] p-6">Loading product data...</div>;
  }

  return (
    <div className="flex ml-[220px] bg-gray-100 min-h-screen p-6">
      <div className="flex w-full gap-6">
        {/* Left Panel */}
        <div className="w-2/3 bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-left">
            {existingProduct ? "Edit Product" : "Create a new product"}
          </h2>
          
          {/* General Information */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <label className="text-lg font-medium mb-3 text-left block">General</label>
            
            <label className="text-lg font-medium mb-3 text-left block mt-4">Name</label>
            <input 
              type="text" 
              value={product.product_name} 
              onChange={(e) => handleProductChange('product_name', e.target.value)} 
              placeholder="Name" 
              className="w-full p-2 border mb-2 rounded" 
              required
            />

            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <label className="text-lg font-medium text-left block">SKU</label>
                <input 
                  type="text" 
                  value={product.sku} 
                  onChange={(e) => handleProductChange('sku', e.target.value)} 
                  placeholder="SKU" 
                  className="w-full p-2 border rounded" 
                  required
                />
              </div>
              <div>
                <label className="text-lg font-medium text-left block">Price</label>
                <input 
                  type="number" 
                  value={product.product_price} 
                  onChange={(e) => handleProductChange('product_price', e.target.value)} 
                  placeholder="Price (USD)" 
                  className="w-full p-2 border rounded" 
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-lg font-medium text-left block">Weight</label>
                <input 
                  type="number" 
                  value={product.weight} 
                  onChange={(e) => handleProductChange('weight', e.target.value)} 
                  placeholder="Weight (kg)" 
                  className="w-full p-2 border rounded" 
                  required
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <label className="text-lg font-medium mb-3 text-left block">Category</label>
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowCategoryModal(true);
                fetchCategories();
              }}
              className="text-blue-500 text-left w-full p-2 border rounded bg-white hover:bg-gray-50"
            >
              {selectedCategoryName || "Select category"}
            </button>

            <div className="mt-4">
              <label className="text-lg font-medium text-left block mb-2">Description</label>
              <textarea
                value={product.product_description}
                onChange={(e) => handleProductChange('product_description', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your description here..."
                required
              />
            </div>
          </div>

          {/* Media Upload */}
          <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm mb-6">
            <label className="text-lg font-medium text-left block mb-2">Media</label>
            <div className="flex gap-4 flex-wrap">
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
              {images.map((img, index) => (
                <div key={index} className="relative h-32 w-32 rounded-md overflow-hidden border">
                  <img 
                    src={img.preview} 
                    alt={`preview-${index}`} 
                    className="object-cover w-full h-full" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150";
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
              ))}
            </div>
          </div>

          {/* SEO */}
          <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm mb-6">
            <h2 className="text-lg font-medium text-left block mb-2">Search Engine Optimization</h2>
            <label className="text-left block font-medium mb-1">URL Key</label>
            <input 
              type="text" 
              value={product.url_key} 
              onChange={(e) => handleProductChange('url_key', e.target.value)} 
              className="w-full p-2 border mb-2 rounded" 
              required
            />
          </div>

          <hr className="border-gray-300 my-6" />

          <div className="flex justify-between w-full p-4">
            <button
              type="button"
              className="px-6 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50"
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button 
              type="button" 
              disabled={loading} 
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              onClick={handleSave}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-1/3 space-y-6">
          {/* Product Status */}
          <div className="bg-white p-4 shadow-lg rounded-lg">
            <h2 className="text-lg font-medium mb-3 text-left">Product Status</h2>
            <h3 className="text-md font-medium mt-3 text-left">Status</h3>
            <label className="text-left block">
              <input 
                className="m-2" 
                type="radio" 
                checked={product.product_status === "disabled"} 
                onChange={() => handleProductChange('product_status', "disabled")} 
              /> Disabled
            </label>
            <label className="text-left block">
              <input 
                className="m-2" 
                type="radio" 
                checked={product.product_status === "enabled"} 
                onChange={() => handleProductChange('product_status', "enabled")} 
              /> Enabled
            </label>

            <hr className="border-gray-300 my-3" />

            <h3 className="text-md font-medium text-left">Visibility</h3>
            <label className="text-left block">
              <input 
                className="m-2" 
                type="radio" 
                checked={product.product_visibility === "not_visible"} 
                onChange={() => handleProductChange('product_visibility', "not_visible")} 
              /> Not Visible
            </label>
            <label className="text-left block">
              <input 
                className="m-2" 
                type="radio" 
                checked={product.product_visibility === "visible"} 
                onChange={() => handleProductChange('product_visibility', "visible")} 
              /> Visible
            </label>
          </div>

          {/* Inventory */}
          <div className="bg-white p-4 shadow-lg rounded-lg">
            <h2 className="text-lg font-medium mb-3 text-left">Inventory</h2>
            <h3 className="text-md font-medium text-left">Manage stock?</h3>
            <label className="text-left block">
              <input 
                className="m-2" 
                type="radio" 
                checked={product.manage_stock === "No"} 
                onChange={() => handleProductChange('manage_stock', "No")} 
              /> No
            </label>
            <label className="text-left block">
              <input 
                className="m-2" 
                type="radio" 
                checked={product.manage_stock === "Yes"} 
                onChange={() => handleProductChange('manage_stock', "Yes")} 
              /> Yes
            </label>

            <hr className="border-gray-300 my-3" />

            <h3 className="text-md font-medium text-left">Stock availability</h3>
            <label className="text-left block">
              <input 
                className="m-2" 
                type="radio" 
                checked={product.stock_available === "No"} 
                onChange={() => handleProductChange('stock_available', "No")} 
              /> No
            </label>
            <label className="text-left block">
              <input 
                className="m-2" 
                type="radio" 
                checked={product.stock_available === "Yes"} 
                onChange={() => handleProductChange('stock_available', "Yes")} 
              /> Yes
            </label>
          </div>

          {/* Attributes */}
          <div className="space-y-6 attributes-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {attributes.map((attr) => (
              <div key={`color-${attr.id}`} className="border p-4 rounded-lg space-y-3 bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Color Name"
                      value={attr.color_name}
                      onChange={(e) => handleColorChange(attr.id, 'color_name', e.target.value)}
                    />
                    {errors.find(e => e.id === attr.id)?.color_name && (
                      <span className="text-red-500 text-sm">
                        {errors.find(e => e.id === attr.id).color_name}
                      </span>
                    )}
                  </div>
                  <input
                    type="color"
                    value={attr.color_hex}
                    onChange={(e) => handleColorChange(attr.id, 'color_hex', e.target.value)}
                    className="w-10 h-10 border rounded"
                  />
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => removeColor(attr.id)}
                    disabled={attributes.length <= 1}
                  >
                    Remove
                  </Button>
                </div>

                <div className="space-y-2">
                  {attr.sizes.map((size) => (
                    <div key={`size-${size.id}`} className="flex items-center gap-4">
                      <div className="flex-1">
                        <select
                          value={size.size}
                          onChange={(e) => handleSizeChange(attr.id, size.id, 'size', e.target.value)}
                          className="w-full p-2 border rounded"
                        >
                          <option value="">Select size</option>
                          {SIZE_OPTIONS.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        {errors.find(e => e.id === attr.id)?.sizes?.find(s => s.id === size.id)?.size && (
                          <span className="text-red-500 text-sm">
                            {errors.find(e => e.id === attr.id).sizes.find(s => s.id === size.id).size}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="Quantity"
                          value={size.quantity}
                          onChange={(e) => handleSizeChange(attr.id, size.id, 'quantity', e.target.value)}
                          min="0"
                        />
                        {errors.find(e => e.id === attr.id)?.sizes?.find(s => s.id === size.id)?.quantity && (
                          <span className="text-red-500 text-sm">
                            {errors.find(e => e.id === attr.id).sizes.find(s => s.id === size.id).quantity}
                          </span>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeSize(attr.id, size.id)}
                        disabled={attr.sizes.length <= 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => addSize(attr.id)}
                  className="w-full"
                >
                  + Add Size
                </Button>
              </div>
            ))}

            <Button 
              variant="default" 
              onClick={addColor}
              className="w-full"
            >
              + Add Color
            </Button>
          </div>
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
    </div>
  );
};

export default NewProduct;