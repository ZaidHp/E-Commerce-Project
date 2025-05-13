const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const cron = require("node-cron");

const uploadRoutes = require('./routes/upload.routes');
const dalleRoutes = require("./routes/dalle.routes");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const dashboardRoutes = require('./routes/dashboard');
const reviewsProductRoutes = require("./routes/product_reviews");
const reviewsBusinessRoutes = require("./routes/business_reviews");
const paymentsRoutes = require("./routes/payments");
const categoriesRoutes = require('./routes/categories');
const productPageRoute = require('./routes/product_page');
const categorieRoutes = require('./routes/categorie');
const cartRoutes = require('./routes/cart');
const orderRouter = require('./routes/order');
const addressesRouter = require('./routes/addresses');
const wishlistRouter = require('./routes/wishlist');
const businessRouter = require('./routes/business');
const protectedRouteRouter = require('./routes/protected_route')
const customerReviewRouter = require('./routes/customers_reviews')
const customerOrderRouter = require('./routes/customers_orders')
const customerInfoRouter = require('./routes/customer_info')
const customerPaymentsRouter = require('./routes/customer_payments')
const AIOrderRouter = require('./routes/ai_order')
const SubscriptionRouter = require('./routes/subscriptions')

const deleteExpiredOtps = require('./utils/otpCleanup');
const deleteExpiredTokens = require("./utils/deleteExpiredTokens");

dotenv.config();

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static('public', {
  setHeaders: function (res, path, stat) {
  if (path.endsWith('.glb')) {
      res.set('Content-Type', 'model/gltf-binary');
  }
  }
}))

console.log("Is HF API Key loaded?", process.env.HF_API_KEY ? 'Yes' : 'No');

app.get("/", (req, res) => {
  res.status(200).send({ message: "Welcome to our API server" });
});

app.use('/api/v1/dalle', dalleRoutes);
app.use('/api/upload', uploadRoutes);

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use('/customers', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use("/api/product_reviews", reviewsProductRoutes);
app.use("/api/business_reviews", reviewsBusinessRoutes);
app.use("/api/payments", paymentsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/productPage', productPageRoute);
app.use('/api/categorie', categorieRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', orderRouter);
app.use('/api/addresses', addressesRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/business', businessRouter);
app.use('/api/protected_route', protectedRouteRouter)
app.use('/api/user/orders', customerOrderRouter)
app.use('/api/reviews', customerReviewRouter)
app.use('/api/user', customerInfoRouter)
app.use('/api/user/payments', customerPaymentsRouter)
app.use('/api/ai', AIOrderRouter)
app.use('/api/subscriptions', SubscriptionRouter)

cron.schedule('*/5 * * * *', () => {
  deleteExpiredOtps();
  deleteExpiredTokens();
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;