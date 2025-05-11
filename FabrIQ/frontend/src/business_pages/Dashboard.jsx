// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
//   PieChart, Pie, Cell, Legend
// } from "recharts";
// import { toast } from "react-toastify";

// const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"];
// const API_BASE_URL = "http://localhost:8080";
// const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// const generateEmptyData = (viewType, month, year) => {
//   if (viewType === "monthly") {
//     const daysInMonth = new Date(year, month, 0).getDate();
//     return Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, sales: 0 }));
//   } else {
//     return MONTHS.map((month, i) => ({ month, sales: 0 }));
//   }
// };

// const StatCard = ({ title, value }) => (
//   <div className="bg-white shadow rounded-2xl p-4 text-center">
//     <p className="text-sm text-gray-500">{title}</p>
//     <h3 className="text-xl font-semibold text-gray-900">{value}</h3>
//   </div>
// );

// const Dashboard = () => {
//   const [loading, setLoading] = useState(true);
//   const [data, setData] = useState(null);
//   const [salesData, setSalesData] = useState([]);
//   const [view, setView] = useState("monthly");
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//   const [chartKey, setChartKey] = useState(0);
//   const [yearlySales, setYearlySales] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       const businessId = localStorage.getItem("business_id");
//       if (!businessId) {
//         toast.error("Business ID not found.");
//         setLoading(false);
//         return;
//       }

//       try {
//         const res = await axios.get(`${API_BASE_URL}/api/dashboard/business/${businessId}`);
//         setData(res.data);
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to load dashboard data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   useEffect(() => {
//     const fetchSalesData = async () => {
//       const businessId = localStorage.getItem("business_id");
//       if (!businessId) {
//         toast.error("Business ID not found.");
//         setLoading(false);
//         return;
//       }

//       try {
//         const queryParams = new URLSearchParams({
//           view,
//           year: selectedYear,
//         });
//         if (view === "monthly") queryParams.append("month", selectedMonth);

//         const res = await axios.get(`${API_BASE_URL}/api/dashboard/business/${businessId}/sales-trend?${queryParams}`);
        
//         const emptyData = generateEmptyData(view, selectedMonth, selectedYear);
//         const mappedData = emptyData.map(entry => {
//           const found = res.data.find(d =>
//             view === "monthly" ? d.day === entry.day : d.month === (MONTHS.indexOf(entry.month) + 1)
//           );
//           return found ? { ...entry, sales: found.sales } : entry;
//         });
        
//         setSalesData(mappedData);
//       } catch (err) {
//         console.error("Sales Data Fetch Error:", err);
//         toast.error("Failed to load sales trend data.");
//       }
//     };

//     fetchSalesData();
//   }, [view, selectedMonth, selectedYear]);

//   useEffect(() => {
//     const fetchYearlySales = async () => {
//       const businessId = localStorage.getItem("business_id");
//       if (!businessId) {
//         toast.error("Business ID not found.");
//         return;
//       }
  
//       try {
//         const res = await axios.get(`${API_BASE_URL}/api/dashboard/business/${businessId}/lifetime-sales`);
//         setYearlySales(res.data);
//       } catch (err) {
//         console.error("Error fetching yearly sales:", err);
//         toast.error("Failed to load lifetime sales data.");
//       }
//     };
  
//     fetchYearlySales();
//   }, []);
  

//   useEffect(() => {
//     const handleResize = () => {
//       setChartKey(prev => prev + 1);
//     };
  
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   if (loading) return <div className="text-center py-20">Loading dashboard...</div>;
//   if (!data) return <div className="text-center py-20 text-red-500">No data available</div>;

//   const {
//     total_sales,
//     total_earnings,
//     monthly_sales,
//     monthly_earnings,
//     best_selling_product,
//     category_sales = [],
//     average_order_value,
//     weekly_sales = {},
//     customer_retention_rate
//   } = data;

//   const maxSales = Math.max(...yearlySales.map(sale => Number(sale.total_sales)));

//   const normalizedDataSales = yearlySales.map(sale => ({
//     year: sale.year,
//     total_sales: Number(sale.total_sales),
//     normalized_sales: (Number(sale.total_sales) / maxSales) * 100,
//   }));

//   const formattedCategorySales = category_sales.map((sale) => ({
//     category_name: sale.category_name,
//     sales: Number(sale.sales),
//   }));  

//   const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, year, total_sales }) => {
//     const RADIAN = Math.PI / 180;
//     const radius = innerRadius + (outerRadius - innerRadius) / 2;
//     const x = cx + radius * Math.cos(-midAngle * RADIAN);
//     const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
  
//     return (
//       <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
//         {` $${total_sales}`}
//       </text>
//     );
//   };

//   const renderCategoryLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, category_name, sales }) => {
//     const RADIAN = Math.PI / 180;
//     const radius = innerRadius + (outerRadius - innerRadius) / 2;
//     const x = cx + radius * Math.cos(-midAngle * RADIAN);
//     const y = cy + radius * Math.sin(-midAngle * RADIAN);

//     return (
//       <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
//         {`${sales}`} 
//       </text>
//     );
// };


//   return (
//     <div className="p-6 pl-20 space-y-6">
//       <h2 className="text-2xl font-semibold mb-4">Business Dashboard</h2>

//       {/* Stat Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         <StatCard title="Total Sales" value={`$${Number(total_sales || 0).toFixed(2)}`} />
//         <StatCard title="Total Earnings" value={`$${Number(total_earnings || 0).toFixed(2)}`} />
//         <StatCard title="Monthly Sales" value={`$${Number(monthly_sales || 0).toFixed(2)}`} />
//         <StatCard title="Monthly Earnings" value={`$${Number(monthly_earnings || 0).toFixed(2)}`} />
//         <StatCard title="Avg Order Value" value={`$${Number(average_order_value || 0).toFixed(2)}`} />
//         <StatCard title="Customer Retention" value={`${Number(customer_retention_rate || 0).toFixed(2)}%`} />
//       </div>

//       <div className="flex flex-wrap gap-4 w-full">
//       <div className="bg-white p-4 rounded-2xl shadow flex-1 min-w-[800px]">
//         <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
//           <h4 className="text-lg font-semibold">Sales Trend</h4>
//           <div className="flex space-x-4">
//             <select value={view} onChange={(e) => setView(e.target.value)}>
//               <option value="monthly">Monthly</option>
//               <option value="yearly">Yearly</option>
//             </select>

//             {view === "monthly" && (
//             <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
//               {MONTHS.map((name, i) => (
//                 <option key={i + 1} value={i + 1}>{name}</option>
//               ))}
//             </select>
//           )}

//           <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
//             {Array.from({ length: 5 }, (_, i) => (
//               <option key={i} value={new Date().getFullYear() - i}>
//                 {new Date().getFullYear() - i}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

        
//         <ResponsiveContainer key={chartKey} width="100%" height={300}>
//           <BarChart data={salesData}>
//             <XAxis dataKey={view === "monthly" ? "day" : "month"} />
//             <YAxis />
//             <Tooltip />
//             <Bar dataKey="sales">
//               {salesData.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//               ))}
//             </Bar>
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Lifetime Sales by Year */}
//       <div className="bg-white p-4 rounded-2xl shadow flex-1 min-w-[300px]">
//       <h4 className="text-lg font-semibold mb-2">Lifetime Sales by Year</h4>
//       <ResponsiveContainer width="100%" height={300}>
//         <PieChart>
//           <Pie
//             data={normalizedDataSales}
//             dataKey="normalized_sales"
//             nameKey="year"
//             cx="50%"
//             cy="50%"
//             outerRadius={100}
//             minAngle={10}
//             label={renderCustomLabel}
//             labelLine={false}
//           >
//             {normalizedDataSales.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//             ))}
//           </Pie>
//           <Legend />
//           <Tooltip formatter={(value, name, entry) => [`${entry.payload.total_sales}`, "Total Sales"]} />
//         </PieChart>
//       </ResponsiveContainer>
//   </div>


        
        
//       </div>

//       <div className="flex flex-wrap gap-4 w-full">
//         {/* Weekly Sales Comparison */}
//         <div className="bg-white p-4 rounded-2xl shadow flex-1 min-w-[300px]">
//           <h4 className="text-lg font-semibold mb-2">Weekly Sales Comparison</h4>
//           <div style={{ width: '100%', height: 250 }}>
//             <ResponsiveContainer width="100%" height="100%">
//             <BarChart
//               data={[
//                 { name: "Previous Week", sales: weekly_sales?.previous_week ?? 0 },
//                 { name: "This Week", sales: weekly_sales?.current_week ?? 0 },
//               ]}
//             >
//             <XAxis dataKey="name" />
//             <YAxis />
//             <Tooltip />
//             <Bar dataKey="sales">
//               <Cell fill="#FF5733" />
//               <Cell fill="#3B82F6" />
//             </Bar>
//             </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Category-wise Sales */}
//         <div className="bg-white p-4 rounded-2xl shadow flex-1 min-w-[300px]">
//           <h4 className="text-lg font-semibold mb-2">Category-wise Sales</h4>
//           <div style={{ width: '100%', height: 300 }}>
//             <ResponsiveContainer width="100%" height="100%">
//             <PieChart>
//             <Pie
//               data={formattedCategorySales}
//               dataKey="sales"
//               nameKey="category_name"
//               cx="50%"
//               cy="50%"
//               outerRadius={100}
//               label={renderCategoryLabel}
//               labelLine={false}
//             >
//               {formattedCategorySales.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//               ))}
//             </Pie>
//             <Legend />
//             <Tooltip />
//             </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
        
//         <div className="bg-white p-4 rounded-2xl shadow flex-1 min-w-[300px]">
          
//           {best_selling_product && best_selling_product.length > 0 ? (
//           <div className="bg-white p-4 rounded-2xl shadow">
//           <h4 className="text-lg font-semibold mb-2">Top Best-Selling Products</h4>
//           <ul className="space-y-1 text-gray-700">
//             {best_selling_product.map((product, index) => (
//             <li key={product.product_id} className="flex justify-between">
//             <span>
//               {index + 1}. <span className="font-medium">{product.product_name}</span>
//             </span>
//             <span className="text-sm text-gray-600">{product.total_sold ?? 0} sold</span>
//           </li>
//           ))}
//           </ul>
//           </div>
//           ) : (
//           <div className="bg-white p-4 rounded-2xl shadow text-gray-500 text-center">
//             No best-selling products available.
//           </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { toast } from "react-toastify";
import { FiTrendingUp, FiDollarSign, FiCalendar, FiShoppingBag, FiRepeat, FiAward } from "react-icons/fi";

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6", "#EC4899"];
const API_BASE_URL = "http://localhost:8080";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const generateEmptyData = (viewType, month, year) => {
  if (viewType === "monthly") {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, sales: 0 }));
  } else {
    return MONTHS.map((month, i) => ({ month, sales: 0 }));
  }
};

const StatCard = ({ title, value, icon, trend }) => {
  const Icon = icon;
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${trend === 'up' ? 'bg-green-100 text-green-600' : trend === 'down' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [view, setView] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartKey, setChartKey] = useState(0);
  const [yearlySales, setYearlySales] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const businessId = localStorage.getItem("business_id");
      if (!businessId) {
        toast.error("Business ID not found.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/api/dashboard/business/${businessId}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchSalesData = async () => {
      const businessId = localStorage.getItem("business_id");
      if (!businessId) {
        toast.error("Business ID not found.");
        setLoading(false);
        return;
      }

      try {
        const queryParams = new URLSearchParams({
          view,
          year: selectedYear,
        });
        if (view === "monthly") queryParams.append("month", selectedMonth);

        const res = await axios.get(`${API_BASE_URL}/api/dashboard/business/${businessId}/sales-trend?${queryParams}`);
        
        const emptyData = generateEmptyData(view, selectedMonth, selectedYear);
        const mappedData = emptyData.map(entry => {
          const found = res.data.find(d =>
            view === "monthly" ? d.day === entry.day : d.month === (MONTHS.indexOf(entry.month) + 1)
          );
          return found ? { ...entry, sales: found.sales } : entry;
        });
        
        setSalesData(mappedData);
      } catch (err) {
        console.error("Sales Data Fetch Error:", err);
        toast.error("Failed to load sales trend data.");
      }
    };

    fetchSalesData();
  }, [view, selectedMonth, selectedYear]);

  useEffect(() => {
    const fetchYearlySales = async () => {
      const businessId = localStorage.getItem("business_id");
      if (!businessId) {
        toast.error("Business ID not found.");
        return;
      }
  
      try {
        const res = await axios.get(`${API_BASE_URL}/api/dashboard/business/${businessId}/lifetime-sales`);
        setYearlySales(res.data);
      } catch (err) {
        console.error("Error fetching yearly sales:", err);
        toast.error("Failed to load lifetime sales data.");
      }
    };
  
    fetchYearlySales();
  }, []);
  
  useEffect(() => {
    const handleResize = () => {
      setChartKey(prev => prev + 1);
    };
  
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading dashboard...</p>
      </div>
    </div>
  );
  
  if (!data) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-6 bg-white rounded-xl shadow-sm max-w-md">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No data available</h3>
        <p className="text-gray-600">We couldn't load your dashboard data. Please try again later.</p>
      </div>
    </div>
  );

  const {
    total_sales,
    total_earnings,
    monthly_sales,
    monthly_earnings,
    best_selling_product,
    category_sales = [],
    average_order_value,
    weekly_sales = {},
    customer_retention_rate
  } = data;

  console.log(data);

  const maxSales = Math.max(...yearlySales.map(sale => Number(sale.total_sales)));

  const normalizedDataSales = yearlySales.map(sale => ({
    year: sale.year,
    total_sales: Number(sale.total_sales),
    normalized_sales: (Number(sale.total_sales) / maxSales) * 100,
  }));

  const formattedCategorySales = category_sales.map((sale) => ({
    category_name: sale.category_name,
    sales: Number(sale.sales),
  }));  

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, year, total_sales }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) / 2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>
        {`$${(total_sales / 1000).toFixed(1)}k`}
      </text>
    );
  };

  const renderCategoryLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, category_name, sales }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) / 2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>
        {`${(sales / 1000).toFixed(1)}k`}
      </text>
    );
  };

  const weeklyComparisonData = [
    { name: "Previous Week", sales: weekly_sales?.previous_week ?? 0 },
    { name: "This Week", sales: weekly_sales?.current_week ?? 0 },
  ];

  const weeklyChange = weekly_sales?.current_week && weekly_sales?.previous_week 
    ? ((weekly_sales.current_week - weekly_sales.previous_week) / weekly_sales.previous_week * 100).toFixed(1)
    : 0;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Business Dashboard</h2>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <FiCalendar className="text-gray-500" />
          <span className="text-gray-700 font-medium">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <StatCard 
          title="Total Sales" 
          value={`$${(Number(total_sales || 0) / 1000).toFixed(1)}k`} 
          icon={FiTrendingUp} 
          trend="up" 
        />
        <StatCard 
          title="Total Earnings" 
          value={`$${(Number(total_earnings || 0) / 1000).toFixed(1)}k`} 
          icon={FiDollarSign} 
          trend="up" 
        />
        <StatCard 
          title="Monthly Sales" 
          value={`$${Number(monthly_sales || 0).toFixed(2)}`} 
          icon={FiShoppingBag} 
          trend={monthly_sales > (total_sales / 12) ? 'up' : 'down'} 
        />
        <StatCard 
          title="Avg Order" 
          value={`$${Number(average_order_value || 0).toFixed(2)}`} 
          icon={FiDollarSign} 
        />
        <StatCard 
          title="Retention" 
          value={`${Number(customer_retention_rate || 0).toFixed(2)}%`} 
          icon={FiRepeat} 
          trend={customer_retention_rate > 50 ? 'up' : 'down'} 
        />
        <StatCard 
          title="Top Products" 
          value={best_selling_product?.length || 0} 
          icon={FiAward} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sales Trend Chart */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-800">Sales Trend</h4>
            <div className="flex items-center space-x-3 mt-3 sm:mt-0">
              <select 
                value={view} 
                onChange={(e) => setView(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>

              {view === "monthly" && (
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {MONTHS.map((name, i) => (
                    <option key={i + 1} value={i + 1}>{name}</option>
                  ))}
                </select>
              )}

              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option key={i} value={new Date().getFullYear() - i}>
                    {new Date().getFullYear() - i}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <XAxis 
                  dataKey={view === "monthly" ? "day" : "month"} 
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis 
                  tick={{ fill: '#6B7280' }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, "Sales"]}
                  labelFormatter={view === "monthly" ? (label) => `Day ${label}` : (label) => label}
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.96)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="sales" name="Sales" radius={[4, 4, 0, 0]}>
                  {salesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lifetime Sales by Year */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-6">Lifetime Sales by Year</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={normalizedDataSales}
                  dataKey="normalized_sales"
                  nameKey="year"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  minAngle={10}
                  label={renderCustomLabel}
                  labelLine={false}
                >
                  {normalizedDataSales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                <Tooltip 
                  formatter={(value, name, entry) => [`$${entry.payload.total_sales.toLocaleString()}`, "Total Sales"]}
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.96)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly Sales Comparison */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-800">Weekly Sales Comparison</h4>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              weeklyChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {weeklyChange >= 0 ? '↑' : '↓'} {Math.abs(weeklyChange)}%
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyComparisonData}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis 
                  tick={{ fill: '#6B7280' }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, "Sales"]}
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.96)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar 
                  dataKey="sales" 
                  name="Sales" 
                  radius={[4, 4, 0, 0]}
                >
                  <Cell fill="#3B82F6" />
                  <Cell fill="#10B981" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category-wise Sales */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-6">Sales by Category</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedCategorySales}
                  dataKey="sales"
                  nameKey="category_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  label={renderCategoryLabel}
                  labelLine={false}
                >
                  {formattedCategorySales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  wrapperStyle={{ paddingLeft: '20px' }}
                />
                <Tooltip 
                  formatter={(value, name, entry) => [`$${value.toLocaleString()}`, "Sales"]}
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.96)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-6">Top Selling Products</h4>
          {best_selling_product && best_selling_product.length > 0 ? (
            <div className="space-y-4">
              {best_selling_product.slice(0, 5).map((product, index) => (
                <div key={product.product_id} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    index === 0 ? 'bg-yellow-100 text-yellow-600' : 
                    index === 1 ? 'bg-gray-100 text-gray-600' : 
                    index === 2 ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.product_name}</p>
                    <p className="text-xs text-gray-500">{product.total_sold ?? 0} units sold</p>
                  </div>
                  <div className="text-sm font-semibold text-gray-700">
                    ${(Number(product.total_sales) || 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 text-sm">No best-selling products available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

