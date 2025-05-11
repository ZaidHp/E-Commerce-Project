import React, { useEffect, useState } from 'react';
import Table from '../business_components/Business_Panel_Table';
import axios from 'axios';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("select");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const businessId = localStorage.getItem("business_id");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/customers/${businessId}`);
        setCustomers(res.data);
        setFilteredCustomers(res.data);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };
    fetchCustomers();
  }, [businessId]);

  useEffect(() => {
    let filtered = [...customers];
    if (selectedFilter !== "select") {
      filtered = filtered.filter((c) => c.Status === selectedFilter);
    }

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c["Full Name"].toLowerCase().includes(lowerSearch) ||
          c.Email.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredCustomers(filtered);
    setCurrentPage(1);
  }, [selectedFilter, searchTerm, customers]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedData = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 w-[85%] mx-auto">
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      <Table
        columns={["Full Name", "Email", "Status", "Average Order Value"]}
        data={paginatedData}
        selectable={false}
        filters={[
          { label: "Select Status", value: "select" },
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" }
        ]}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedRows={[]}
        onSelectedRowsChange={() => {}}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Customers;
