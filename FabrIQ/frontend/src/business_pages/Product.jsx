import React, { useEffect, useState } from 'react';
import Table from '../business_components/Business_Panel_Table';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TrashIcon, EyeSlashIcon, EyeIcon } from "@heroicons/react/24/outline";

const Product = () => {
  const navigate = useNavigate();
  const [productData, setProductData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [selectedRows, setSelectedRows] = useState([]);

  const business_id = localStorage.getItem("business_id");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(`http://localhost:8080/api/products?business_id=${business_id}`);
        const data = await response.json();
        setProductData(data.products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    }

    if (business_id) {
      fetchProducts();
    }
  }, [business_id]);

  function handleAddProduct() {
    navigate('/new-product');
  }

  const handleUnlistProducts = async () => {
    if (selectedRows.length === 0) {
      toast.warn("Please select at least one product.");
      return;
    }
    console.log(selectedRows);
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will unlist the selected product(s). You can relist them later.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, unlist them!"
    });
  
    if (result.isConfirmed) {
      try {
        const response = await fetch("http://localhost:8080/api/products/unlist", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ product_id: selectedRows }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          toast.success(data.message || "Products unlisted successfully!");
          setProductData(prev =>
            prev.map(p => selectedRows.includes(p.id) ? { ...p, STATUS: "disabled" } : p)
          );
          setSelectedRows([]);
        } else {
          throw new Error(data.error || "Failed to unlist products");
        }
      } catch (error) {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const handleRelistProducts = async () => {
    if (selectedRows.length === 0) {
      toast.warn("Please select at least one product.");
      return;
    }
  
    const result = await Swal.fire({
      title: "Relist selected products?",
      text: "This will make the selected product(s) visible again.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, relist them!"
    });
  
    if (result.isConfirmed) {
      try {
        const response = await fetch("http://localhost:8080/api/products/relist", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: selectedRows })
        });
  
        const data = await response.json();
  
        if (response.ok) {
          toast.success(data.message || "Products relisted successfully!");
          setProductData(prev =>
            prev.map(p => selectedRows.includes(p.id) ? { ...p, STATUS: "enabled" } : p)
          );
          setSelectedRows([]);
        } else {
          throw new Error(data.error || "Failed to relist products");
        }
      } catch (error) {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  const handleDeleteProducts = async () => {
    if (selectedRows.length === 0) {
      toast.warn("Please select at least one product.");
      return;
    }
  
    const result = await Swal.fire({
      title: "Permanently delete?",
      text: "This will permanently delete the selected product(s). This action cannot be undone!",
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete them!"
    });
  
    if (result.isConfirmed) {
      try {
        const response = await fetch("http://localhost:8080/api/products/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: selectedRows })
        });
  
        const data = await response.json();
  
        if (response.ok) {
          toast.success(data.message || "Products deleted successfully!");
          setProductData(prev => prev.filter(p => !selectedRows.includes(p.id)));
          setSelectedRows([]);
        } else {
          throw new Error(data.error || "Failed to delete products");
        }
      } catch (error) {
        toast.error(error.message || "Something went wrong");
      }
    }
  };
  
  

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };


  const filteredData = productData.filter(product => {
    const lowerSearch = searchTerm.toLowerCase();
    const matchesSearch =
      product.NAME.toLowerCase().includes(lowerSearch) ||
      product.SKU.toLowerCase().includes(lowerSearch);
  
    const matchesFilter =
      statusFilter === "" || statusFilter === "select" || product.STATUS === statusFilter;
  
    return matchesSearch && matchesFilter;
  });
  

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="p-6 w-[85%] mx-auto">
      <div className='flex justify-between mb-8 mr-2'>
        <h1 className="text-2xl font-bold mb-4">Products</h1>
        <button
          className='bg-blue-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-600'
          onClick={handleAddProduct}
        >
          Add Product
        </button>
        
      </div>
      <div className="flex justify-end gap-2 mr-3 items-center">
        {/* Unlist */}
        <div className="relative group">
        <button
          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
          onClick={handleUnlistProducts}
        >
          <EyeSlashIcon className="h-5 w-5" />
        </button>
        <span className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50">
          Unlist
        </span>
      </div>

      {/* Relist */}
      <div className="relative group">
        <button
          className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full"
          onClick={handleRelistProducts}
        >
          <EyeIcon className="h-5 w-5" />
        </button>
        <span className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50">
          Relist
        </span>
      </div>

      {/* Delete */}
      <div className="relative group">
        <button
          className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-full"
          onClick={handleDeleteProducts}
        >   
          <TrashIcon className="h-5 w-5" />
        </button>
        <span className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50">
        Delete
        </span>
      </div>
    </div>
      <Table
        columns={['THUMBNAIL', 'NAME', 'PRICE', 'SKU', 'STOCK', 'AVERAGE_RATING', 'STATUS']}
        data={paginatedData.filter(p => p.STATUS !== "deleted")}
        selectable={true}
        filters={[
          { label: "Select Status", value: "select" },
          { label: "Enabled", value: "enabled" },
          { label: "Disabled", value: "disabled" }
        ]}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        selectedFilter={statusFilter}
        onFilterChange={handleFilterChange}
        page={"Product"}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}

      />

      
      
    </div>
  );
};

export default Product;
