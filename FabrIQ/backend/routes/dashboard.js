const express = require('express');
const router = express.Router();
const db = require('../db');

function getMonthDateRange(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { firstDay, lastDay };
}

function getDateNDaysAgo(n) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().split('T')[0];
}

router.get('/business/:businessId', async (req, res) => {
  const { businessId } = req.params;

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const { firstDay: monthStart, lastDay: monthEnd } = getMonthDateRange(now);
  const prevMonthDate = new Date(thisYear, thisMonth - 1, 1);
  const { firstDay: prevMonthStart, lastDay: prevMonthEnd } = getMonthDateRange(prevMonthDate);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.toISOString().split('T')[0];

  try {
    const [totalStats] = await db.query(`
        SELECT 
          SUM(o.total_amount) AS total_sales,
          SUM(o.platform_commission_amount) AS total_commission,
          SUM(o.business_earnings) AS total_earnings
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN products p ON oi.product_id = p.product_id
        WHERE p.business_id = ?;
      `, [businessId]);

    const [monthlyStats] = await db.query(`
        SELECT 
          SUM(o.total_amount) AS monthly_sales,
          SUM(o.business_earnings) AS monthly_earnings
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN products p ON oi.product_id = p.product_id
        WHERE p.business_id = ?
          AND o.created_at BETWEEN ? AND ?
      `, [businessId, monthStart, monthEnd]);

    const [prevMonthStats] = await db.query(`
        SELECT SUM(o.total_amount) AS prev_month_sales
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN products p ON oi.product_id = p.product_id
        WHERE p.business_id = ?
          AND o.created_at BETWEEN ? AND ?
      `, [businessId, prevMonthStart, prevMonthEnd]);
      

    const monthlySales = monthlyStats[0].monthly_sales || 0;
    const prevMonthlySales = prevMonthStats[0].prev_month_sales || 1;
    const monthlyGrowth = ((monthlySales - prevMonthlySales) / prevMonthlySales) * 100;

    const [bestProduct] = await db.query(`
        SELECT p.product_id, p.product_name, SUM(oi.quantity) AS total_sold, sum(o.business_earnings) AS total_sales
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE p.business_id = ?
        GROUP BY p.product_id, p.product_name
        ORDER BY total_sold DESC
        LIMIT 5
        `, [businessId]);

    const [categorySales] = await db.query(`
        SELECT c.category_name, SUM(oi.quantity * oi.item_price) AS sales
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        JOIN categories c ON p.category_id = c.category_id  -- Ensure this join is valid
        JOIN orders o ON oi.order_id = o.order_id
        WHERE p.business_id = ?
        GROUP BY c.category_name
      `, [businessId]);
      

    const [orderStats] = await db.query(`
        SELECT COUNT(DISTINCT o.order_id) AS total_orders, AVG(o.total_amount) AS avg_order_value
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN products p ON oi.product_id = p.product_id
        WHERE p.business_id = ?
      `, [businessId]);
      

    const [weeklySales] = await db.query(`
        SELECT 
          SUM(CASE WHEN o.created_at BETWEEN ? AND ? THEN o.total_amount ELSE 0 END) AS current_week,
          SUM(CASE WHEN o.created_at BETWEEN ? AND ? THEN o.total_amount ELSE 0 END) AS previous_week
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN products p ON oi.product_id = p.product_id
        WHERE p.business_id = ?
      `, [
        getDateNDaysAgo(7), now.toISOString().split('T')[0], 
        getDateNDaysAgo(14), getDateNDaysAgo(7), 
        businessId
      ]);
      

    const [customerStats] = await db.query(`
        SELECT 
          COUNT(DISTINCT CASE WHEN o.created_at >= ? THEN o.user_id END) AS active_customers,
          COUNT(DISTINCT o.user_id) AS total_customers
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN products p ON oi.product_id = p.product_id
        WHERE p.business_id = ?
      `, [sixMonthsAgo, businessId]);
      

    const activeCustomers = customerStats[0].active_customers || 0;
    const totalCustomers = customerStats[0].total_customers || 1;
    const retentionRate = (activeCustomers / totalCustomers) * 100;

    const responseData = {
      total_sales: totalStats[0].total_sales || 0,
      total_earnings: totalStats[0].total_earnings || 0,
      monthly_sales: monthlySales,
      monthly_earnings: monthlyStats[0].monthly_earnings || 0,
      monthly_growth: monthlyGrowth.toFixed(2),
      best_selling_product: bestProduct || [],
      category_sales: categorySales,
      average_order_value: orderStats[0].avg_order_value || 0,
      weekly_sales: {
        current_week: weeklySales[0].current_week || 0,
        previous_week: weeklySales[0].previous_week || 0
      },
      customer_retention_rate: retentionRate.toFixed(2)
    };

    res.json(responseData);
  } catch (err) {
    console.error('Dashboard fetch error:', err);
    res.status(500).json({ error: 'Server error fetching dashboard data' });
  }
});

router.get('/business/:businessId/sales-trend', async (req, res) => {
    const { businessId } = req.params;
    let { year, month, view } = req.query;
  
    const now = new Date();
    year = year ? parseInt(year) : now.getFullYear();
    month = month ? parseInt(month) : now.getMonth() + 1;
  
    try {
      let query = "";
      let params = [businessId, year];
  
      if (view === "monthly") {
        query = `
          SELECT DAY(o.created_at) AS day, SUM(o.total_amount) AS sales
          FROM orders o
          JOIN order_items oi ON o.order_id = oi.order_id
          JOIN products p ON oi.product_id = p.product_id
          WHERE p.business_id = ? 
            AND YEAR(o.created_at) = ? 
            AND MONTH(o.created_at) = ?
          GROUP BY day
          ORDER BY day;
        `;
        params.push(month);
      } else {
        query = `
          SELECT MONTH(o.created_at) AS month, SUM(o.total_amount) AS sales
          FROM orders o
          JOIN order_items oi ON o.order_id = oi.order_id
          JOIN products p ON oi.product_id = p.product_id
          WHERE p.business_id = ? 
            AND YEAR(o.created_at) = ?
          GROUP BY month
          ORDER BY month;
        `;
      }
  
      const [salesTrend] = await db.query(query, params);
      res.json(salesTrend);
    } catch (err) {
      console.error('Sales trend fetch error:', err);
      res.status(500).json({ error: 'Server error fetching sales trend data' });
    }
  });
  
  router.get('/business/:businessId/lifetime-sales', async (req, res) => {
    const { businessId } = req.params;
  
    try {
      const [yearlySales] = await db.query(
        `SELECT YEAR(o.created_at) AS year, SUM(o.total_amount) AS total_sales
         FROM orders o
         JOIN order_items oi ON o.order_id = oi.order_id
         JOIN products p ON oi.product_id = p.product_id
         WHERE p.business_id = ?
         GROUP BY YEAR(o.created_at)
         ORDER BY year ASC;`,
        [businessId]
      );
  
      res.json(yearlySales);
    } catch (err) {
      console.error("Error fetching lifetime sales by year:", err);
      res.status(500).json({ error: "Failed to fetch lifetime sales data" });
    }
  });
  

module.exports = router;