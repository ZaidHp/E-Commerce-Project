import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Signup from "./components/Signup";
import Login from "./components/Login";
import AuthPage from "./pages/AuthPage";
import EmailVerify from "./components/EmailVerify";
import Main from "./components/Main/";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import GuestRoute from "./components/GuestRoute";
import ScrollToTop from "./components/ScrollToTopLink";

import Dashboard from "./business_pages/Dashboard";
import NewProduct from "./business_pages/NewProduct";
import Products from "./business_pages/Product";
import Orders from "./business_pages/Order";
import Customers from "./business_pages/Customers";
import Settings from "./business_pages/Settings";
import ProductReviews from "./business_pages/ProductReviews";
import BusinessReviews from "./business_pages/BusinessReviews";
import Payments from "./business_pages/Payments";
import AIProduct from "./business_pages/AIProduct";
// import SubscriptionPlans from "./business_pages/SubscriptionPlans";

import LandingPage from "./pages/landing";
import ProductsPage from "./customer_pages/ProductsPage";
import ProductDescription from './customer_pages/ProductDescription';
import CartPage from './customer_pages/CartPage';
import OrderPage from './customer_pages/OrderPage'
import WishlistPage from "./customer_pages/WishlistPage";
import BusinessStore from "./customer_pages/BusinessStore";
import AccountPage from "./customer_pages/AccountPage";
import CustomerInfo from "./customer_components/CustomerInfo";
import Order from "./customer_components/Orders";
import PaymentPage from "./customer_pages/PaymentPage";
import PaymentSuccess from "./customer_pages/PaymentSuccess"
import PaymentCancel from "./customer_pages/PaymentCancel"

import BusinessLayout from "./layouts/BusinessLayout";
import CustomerLayout from "./layouts/CustomerLayout";

import Canvas from './canvas';
import Home from './pages/Home';
import Customizer from './pages/Customizer';

function App() {
  return (
    <>
      <ToastContainer />
      <Router>
      <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          {/* <Route path="/signup" element={<Signup />} /> */}
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/verify-otp" element={<EmailVerify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* <Route path="/" element={<LandingPage />} /> */}
          <Route 
            path="/"
            element={
              <CustomerLayout>
                <LandingPage />
              </CustomerLayout>
          } />
          <Route 
            path="/product"
            element={
              <CustomerLayout>
                <ProductsPage />
              </CustomerLayout>
          } />
          <Route 
            path="/product/category/:category"
            element={
              <CustomerLayout>
                <ProductsPage />
              </CustomerLayout>
          } />
          <Route 
            path="/product/search"
            element={
              <CustomerLayout>
                <ProductsPage />
              </CustomerLayout>
          } />
          <Route 
            path="/product/viewProduct/:urlKey"
            element={
              <CustomerLayout>
                <ProductDescription />
              </CustomerLayout>
          } />
          <Route 
            path="/cart"
            element={
              <CustomerLayout>
                <CartPage />
              </CustomerLayout>
          } />
          <Route 
            path="/checkout"
            element={
              <CustomerLayout>
                <OrderPage/>
              </CustomerLayout>
          } />

          <Route 
            path="/wishlist"
            element={
              <CustomerLayout>
                <WishlistPage/>
              </CustomerLayout>
          } />

          <Route 
            path="/store/:business_name"
            element={
              <CustomerLayout>
                <BusinessStore/>
              </CustomerLayout>
          } />

          <Route 
            path="/payment"
            element={
              <CustomerLayout>
                <PaymentPage/>
              </CustomerLayout>
          } />

          <Route 
            path="/auth"
            element={
              <GuestRoute>
                <CustomerLayout>
                  <AuthPage/>
                </CustomerLayout>
              </GuestRoute>
          } />

          <Route 
            path="/auth/signup"
            element={
              <GuestRoute>
                <CustomerLayout>
                  <AuthPage/>
                </CustomerLayout>
              </GuestRoute>
          } />
          
          <Route 
            path="/payment/success" 
            element={
              <CustomerLayout>
                <PaymentSuccess />
              </CustomerLayout>
            } 
          />
          <Route 
            path="/payment/cancel" 
            element={
              <CustomerLayout>
                <PaymentCancel />
              </CustomerLayout>
            } 
          />

          {/* <Route 
            path="/account"
            element={
              <CustomerLayout>
                <AccountPage/>
              </CustomerLayout>
          } />

          <Route 
            path="/account/info"
            element={
              <CustomerLayout>
                <CustomerInfo/>
              </CustomerLayout>
          } />

          <Route 
            path="/account/order"
            element={
              <CustomerLayout>
                <Order/>
              </CustomerLayout>
          } /> */}

          
            <Route path="/account" element={<CustomerLayout>
                <AccountPage/>
              </CustomerLayout>}>
              <Route path="info" element={<CustomerInfo/>} />
              <Route path="order" element={<Order/>} />
              <Route index element={<CustomerInfo />} />
            </Route>
          

          {/* <Route path="/product/:urlKey" element={<ProductDescription />} /> */}
          {/* <Route path="/cart" element={<CartPage />} /> */}
          {/* <Route path="/checkout" element={<OrderPage/>} /> */}

          <Route path="/order-AIcustomize-product" element={
            <CustomerLayout>
              <main className='app transition-all ease-in'> 
                <Home />
                <Canvas /> 
                <Customizer nextStage="Order Now" />
              </main>
            </CustomerLayout>
          } />

          <Route path="/create-custom-AIproduct" element={
            <ProtectedRoute allowedUserType="business">
              <BusinessLayout>
                <main className='app transition-all ease-in'> 
                  <Home />
                  <Canvas /> 
                  <Customizer nextStage="Add Product" />
                </main>
                </BusinessLayout>
            </ProtectedRoute>
          } />

          <Route
            path="/main"
            element={
              <ProtectedRoute allowedUserType="customer">
                <Main />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedUserType="business">
                <BusinessLayout>
                  <Dashboard />
                </BusinessLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-product"
            element={
              <ProtectedRoute allowedUserType="business">
                <BusinessLayout>
                  <NewProduct />
                </BusinessLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedUserType="business">
                <BusinessLayout>
                  <Products />
                </BusinessLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedUserType="business">
                <BusinessLayout>
                  <Orders />
                </BusinessLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute allowedUserType="business">
                <BusinessLayout>
                  <Customers />
                </BusinessLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/product-reviews"
            element={
              <ProtectedRoute allowedUserType="business">
                <BusinessLayout>
                  <ProductReviews />
                </BusinessLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-reviews"
            element={
              <ProtectedRoute allowedUserType="business">
                <BusinessLayout>
                  <BusinessReviews />
                </BusinessLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute allowedUserType="business">
                <BusinessLayout>
                  <Payments />
                </BusinessLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-product"
            element={
              <ProtectedRoute allowedUserType="business">
                <BusinessLayout>
                  <AIProduct />
                </BusinessLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedUserType="business">
                <BusinessLayout>
                  <Settings />
                </BusinessLayout>
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/AI-Subscriptions"
            element={
              <ProtectedRoute allowedUserType="business">
                <BusinessLayout>
                  <SubscriptionPlans/>
                </BusinessLayout>
              </ProtectedRoute>
            }
          /> */}
        </Routes>
      </Router>
    </>
  );
}

export default App;