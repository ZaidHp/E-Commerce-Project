import React, { useEffect, useState } from 'react';
import Table from '../business_components/Business_Panel_Table';
import axios from 'axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('select');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);

  const business_id = localStorage.getItem("business_id"); // or get from auth context

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, selectedFilter, currentPage]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/orders`, {
        params: {
          business_id,
          search: searchTerm,
          filter: selectedFilter,
          page: currentPage
        }
      });
      setOrders(res.data.orders);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 w-[85%] mx-auto">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      <Table
        page="Orders"
        columns={['Order ID', 'Created At', 'Customer Email', 'Order Status', 'Payment Status', 'Total Amount', 'Platform Commission', 'Total Earnings']}
        data={orders}
        selectable={true}
        filters={[
          { label: 'Select Status', value: 'select' },
          { label: 'Pending', value: 'pending' },
          { label: 'Shipped', value: 'shipped' },
          { label: 'Delivered', value: 'delivered' },
          { label: 'Cancelled', value: 'cancelled' }
        ]}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalPages={totalPages}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}

      />
    </div>
  );
};

export default Orders;
