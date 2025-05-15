import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import './SubscriptionPlans.css';

const stripePromise = loadStripe('your_stripe_publishable_key');

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    fetchPlans();
    checkSubscriptionStatus();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get('/api/subscriptions/plans');
      setPlans(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const response = await axios.get('/api/subscriptions/status');
      setSubscriptionStatus(response.data);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentForm(true);
  };

  const handleCancelSubscription = async () => {
    try {
      await axios.post('/api/subscriptions/cancel');
      setSubscriptionStatus({ hasSubscription: false });
      alert('Subscription cancelled successfully');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription');
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="subscription-container">
      <div className="subscription-header">
        <h1>FabrIQ AI Features</h1>
        <p>Enhance your ecommerce business with our powerful AI tools</p>
      </div>

      {subscriptionStatus?.hasSubscription ? (
        <div className="current-subscription">
          <h2>Your Current Subscription</h2>
          <div className="subscription-card active">
            <h3>{subscriptionStatus.plan_name}</h3>
            <p className="price">${subscriptionStatus.plan_price}</p>
            <p>Active until: {new Date(subscriptionStatus.end_date).toLocaleDateString()}</p>
            <button 
              className="cancel-btn"
              onClick={handleCancelSubscription}
            >
              Cancel Subscription
            </button>
          </div>
          <div className="ai-features">
            <h3>AI Features Now Active:</h3>
            <ul>
              <li>Product Recommendations Engine</li>
              <li>Automated Customer Support</li>
              <li>Sales Forecasting</li>
              <li>Personalized Marketing</li>
              <li>Inventory Optimization</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          {showPaymentForm ? (
            <Elements stripe={stripePromise}>
              <PaymentForm 
                plan={selectedPlan} 
                onSuccess={() => {
                  setShowPaymentForm(false);
                  checkSubscriptionStatus();
                }}
                onCancel={() => setShowPaymentForm(false)}
              />
            </Elements>
          ) : (
            <>
              <h2>Choose Your Plan</h2>
              <div className="plans-grid">
                {plans.map((plan) => (
                  <div key={plan.plan_id} className="plan-card">
                    <h3>{plan.plan_name}</h3>
                    <p className="price">${plan.plan_price}</p>
                    <p className="duration">{plan.plan_duration_days} days</p>
                    <ul className="features">
                      <li>All AI Features Included</li>
                      <li>24/7 Support</li>
                      <li>Regular Updates</li>
                      <li>Performance Analytics</li>
                    </ul>
                    <button 
                      className="subscribe-btn"
                      onClick={() => handleSubscribe(plan)}
                    >
                      Subscribe Now
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

const PaymentForm = ({ plan, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      return;
    }

    try {
      // Create payment intent on the server
      const { data: { clientSecret } } = await axios.post('/api/payments/create-intent', {
        amount: plan.plan_price * 100, // in cents
        currency: 'usd'
      });

      // Confirm the payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Create subscription
        await axios.post('/api/subscriptions/subscribe', {
          planId: plan.plan_id,
          paymentMethodId: paymentIntent.payment_method
        });
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <div className="payment-form-container">
      <h2>Subscribe to {plan.plan_name}</h2>
      <p className="payment-amount">${plan.plan_price}</p>
      
      <form onSubmit={handleSubmit}>
        <div className="card-element-container">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }} />
        </div>
        
        {error && <div className="payment-error">{error}</div>}
        
        <div className="payment-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={onCancel}
            disabled={processing}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="pay-btn"
            disabled={!stripe || processing}
          >
            {processing ? 'Processing...' : `Pay $${plan.plan_price}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubscriptionPlans;