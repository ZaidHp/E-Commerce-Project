import React, { useState } from "react";
import { Link } from "react-router-dom";

const Table = ({
  columns,
  data,
  selectable,
  filters,
  page,
  searchTerm,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  currentPage,
  onPageChange,
  totalPages,
  selectedRows,
  onSelectedRowsChange,
}) => {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [expandedReviews, setExpandedReviews] = useState({});

  const getRowKey = (row) => row.id || row["Order ID"] || row["id"];

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      onSelectedRowsChange([]);
    } else {
      onSelectedRowsChange(data.map(getRowKey));
    }
  };

  const handleRowSelect = (row) => {
    const rowKey = getRowKey(row);
    if (selectedRows.includes(rowKey)) {
      onSelectedRowsChange(selectedRows.filter((id) => id !== rowKey));
    } else {
      onSelectedRowsChange([...selectedRows, rowKey]);
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // const getImageUrl = (path) => {
  //   const BACKEND_URL = "http://localhost:8080";
  //   return path?.startsWith("http") ? path : `${BACKEND_URL}${path}`;
  // };

  const getImageUrl = (path) => {
    // If path is already a full URL (http/https), return as-is
    if (path?.startsWith("http")) {
      return path;
    }
    return path;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full">
      {/* Search + Filter */}
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => {
            onSearchChange?.(e.target.value);
          }}
          className="border p-2 rounded-md w-1/3"
        />
        {filters && (
          <select
            className="border p-2 rounded-md"
            value={selectedFilter}
            onChange={(e) => {
              onFilterChange?.(e.target.value);
            }}
          >
            {filters.map((filter, index) => (
              <option key={index} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-center font-medium">
            {selectable && (
              <th className="p-2">
                <label className="relative cursor-pointer flex items-center justify-center w-5 h-5">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length}
                    onChange={handleSelectAll}
                    className="peer sr-only"
                  />
                  <span className="w-4 h-4 border-2 border-gray-400 rounded-full peer-checked:bg-black peer-checked:border-black transition-all duration-150"></span>
                </label>
              </th>
            )}
            {columns.map((col, index) => (
              <th
                key={index}
                className="p-2 text-center cursor-pointer select-none"
                onClick={() => handleSort(col)}
              >
                {col}
                {sortColumn === col && (sortDirection === "asc" ? " 🔼" : " 🔽")}
              </th>
            ))}
          </tr>
        </thead>


<tbody>
  {sortedData.length > 0 ? (
    sortedData.map((row, rowIndex) => (
      <tr key={rowIndex} className="border-t text-center hover:bg-gray-50">
        {selectable && (
          <td className="p-2">
            <label className="relative cursor-pointer flex items-center justify-center w-5 h-5">
              <input
                type="checkbox"
                checked={selectedRows.includes(getRowKey(row))}
                onChange={() => handleRowSelect(row)}
                className="peer sr-only"
              />
              <span className="w-4 h-4 border-2 border-gray-400 rounded-full peer-checked:bg-black peer-checked:border-black transition-all duration-150"></span>
            </label>
          </td>
        )}
        {columns.map((col, colIndex) => (
          <td key={colIndex} className="p-2">
            {page === "Product" && col === "NAME" ? (
              <Link
                to={`/new-product?id=${row.id}`}
                className="hover:text-blue-700 font-medium"
              >
                {row[col]}
              </Link>
            ) : col === "THUMBNAIL" ? (
              <img
                src={getImageUrl(row[col])}
                alt="thumbnail"
                className="w-12 h-12 object-cover mx-auto rounded"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/50x50?text=Img";
                }}
              />
            ) : col === "STATUS" ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    row[col] === "enabled" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
              </span>
            ) : col === "Payment Status" ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    row.payment_status === "completed"
                      ? "bg-green-500"
                      : row.payment_status === "failed"
                      ? "bg-red-500"
                      : row.payment_status === "refunded"
                      ? "bg-blue-500"
                      : "bg-yellow-500"
                  }`}
                ></span>
              </span>
            ) : col === "Status" ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    row.Status === "active"
                      ? "bg-green-500"
                      : row.Status === "inactive"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}
                ></span>
              </span>
            ) : col === "Review" ? (
              
              <div className="max-w-[300px] break-words">
                {expandedReviews[row.review_id] ? (
                  <>
                    {row[col]}{" "}
                    <button
                      className="text-blue-500 text-sm"
                      onClick={() =>
                        setExpandedReviews((prev) => ({
                          ...prev,
                          [row.review_id]: !prev[row.review_id],
                        }))
                      }
                    >
                      Show Less
                    </button>
                  </>
                ) : (
                  <>
                    {row[col] && row[col].length > 100
                      ? row[col].substring(0, 100) + "..."
                      : row[col]}{" "}
                    {row[col] && row[col].length > 100 && (
                      <button
                        className="text-blue-500 text-sm"
                        onClick={() =>
                          setExpandedReviews((prev) => ({
                            ...prev,
                            [row.review_id]: !prev[row.review_id],
                          }))
                        }
                      >
                        Read More
                      </button>
                    )}
                  </>
                )}
              </div>
              
            ) : (
              row[col]
            )}
          </td>
        ))}
      </tr>
    ))
  ) : (
    <tr>
      <td
        colSpan={columns.length + (selectable ? 1 : 0)}
        className="p-4 text-center text-gray-500"
      >
        There is no data to display
      </td>
    </tr>
  )}
</tbody>


      </table>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            className="px-3 py-1 border rounded"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1 ? "bg-gray-200 font-bold" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;
