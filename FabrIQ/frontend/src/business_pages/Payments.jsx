import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from '../business_components/Business_Panel_Table';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const business_id = localStorage.getItem("business_id");

  useEffect(() => {
    fetchPayments();
  }, [searchTerm, selectedFilter, currentPage]);

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/payments`, {
        params: {
          business_id,
          search: searchTerm,
          status: selectedFilter,
          page: currentPage,
        },
      });
      setPayments(response.data.payments);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching payments", error);
    }
  };

  return (
    <div className="p-4 w-[85%] mx-auto">
      <h1 className="text-2xl font-bold mb-4">Payments</h1>
      <Table
        columns={["Order ID", "Customer Email", "Payment Method", "Payment Status", "Amount Paid", "Payment Date"]}
        data={payments}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[{ label: "Select Payment Status", value: "" }, { label: "Pending", value: "pending" }, { label: "Completed", value: "completed" }, { label: "Failed", value: "failed" }, { label: "Refunded", value: "refunded" }]}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalPages={totalPages}
      />
    </div>
  );
};

export default Payments;
