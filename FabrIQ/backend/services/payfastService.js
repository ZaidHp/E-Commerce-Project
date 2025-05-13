// const crypto = require('crypto');
// const querystring = require('querystring');

// class PayFastService {
//   constructor() {
//     this.merchant_id = process.env.PAYFAST_MERCHANT_ID;
//     this.merchant_key = process.env.PAYFAST_MERCHANT_KEY;
//     this.passphrase = process.env.PAYFAST_PASSPHRASE;
//     this.sandbox = true;
//   }

//   generateSignature(data) {
//     // Sort the data alphabetically by key
//     const orderedData = {};
//     Object.keys(data).sort().forEach(key => {
//       orderedData[key] = data[key];
//     });

//     // Create parameter string
//     let parameterString = querystring.stringify(orderedData);
    
//     // Add passphrase if it exists
//     if (this.passphrase) {
//       parameterString += `&passphrase=${this.passphrase}`;
//     }

//     // Create MD5 hash
//     return crypto.createHash('md5').update(parameterString).digest('hex');
//   }

//   generatePaymentData(order) {
//     const baseUrl = this.sandbox 
//       ? 'https://sandbox.payfast.co.za/eng/process' 
//       : 'https://www.payfast.co.za/eng/process';

//     const data = {
//       merchant_id: this.merchant_id,
//       merchant_key: this.merchant_key,
//       return_url: `${process.env.FRONTEND_URL}/payment/success`,
//       cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
//       notify_url: `${process.env.BACKEND_URL}/api/payments/notify`,
//       name_first: order.user.firstName,
//       name_last: order.user.lastName,
//       email_address: order.user.email,
//       m_payment_id: order.orderId,
//       amount: order.amount.toFixed(2),
//       item_name: `Order #${order.orderId}`,
//       item_description: `Purchase from ${order.businessName}`,
//     };

//     // Generate signature
//     data.signature = this.generateSignature(data);

//     return {
//       url: baseUrl,
//       data: data
//     };
//   }
// }

// module.exports = new PayFastService();

const crypto = require('crypto');
const querystring = require('querystring');

class PayFastService {
  constructor() {
    if (!process.env.PAYFAST_MERCHANT_ID || !process.env.PAYFAST_MERCHANT_KEY) {
      throw new Error('PayFast merchant credentials not configured');
    }

    this.merchant_id = process.env.PAYFAST_MERCHANT_ID;
    this.merchant_key = process.env.PAYFAST_MERCHANT_KEY;
    this.passphrase = process.env.PAYFAST_PASSPHRASE || '';
    this.sandbox = process.env.PAYFAST_ENV === 'sandbox' || true; // Default to sandbox for safety
  }

  generateSignature(data) {
    // Filter out empty values and sort the data alphabetically by key
    const orderedData = {};
    Object.keys(data)
      .filter(key => data[key] !== null && data[key] !== undefined && data[key] !== '')
      .sort()
      .forEach(key => {
        orderedData[key] = data[key].toString().trim();
      });

    // Create parameter string
    const parameterString = Object.entries(orderedData)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    // Add passphrase if it exists
    const signatureString = this.passphrase 
      ? `${parameterString}&passphrase=${encodeURIComponent(this.passphrase)}`
      : parameterString;

    // Create MD5 hash
    return crypto.createHash('md5').update(signatureString).digest('hex');
  }

  generatePaymentData(order) {
    if (!order || !order.orderId || !order.amount || !order.user || !order.businessName) {
      throw new Error('Invalid order data provided');
    }

    const baseUrl = this.sandbox 
      ? 'https://sandbox.payfast.co.za/eng/process' 
      : 'https://www.payfast.co.za/eng/process';

    if (!process.env.FRONTEND_URL || !process.env.BACKEND_URL) {
      throw new Error('Frontend or backend URLs not configured');
    }

    const data = {
      merchant_id: this.merchant_id,
      merchant_key: this.merchant_key,
      return_url: `${process.env.FRONTEND_URL}/payment/success/payFast/${order.orderId}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel/payFast`,
      notify_url: `${process.env.BACKEND_URL}/api/user/payments/notify`,
      name_first: order.user.firstName.substring(0, 100), // PayFast has length limits
      name_last: order.user.lastName.substring(0, 100),
      email_address: order.user.email.substring(0, 255),
      m_payment_id: order.orderId.toString().substring(0, 100),
      amount: parseFloat(order.amount).toFixed(2),
      item_name: `Order #${order.orderId}`.substring(0, 100),
      item_description: `Purchase from ${order.businessName}`.substring(0, 255),
    };

    // Validate amount
    if (isNaN(data.amount) || parseFloat(data.amount) <= 0) {
      throw new Error('Invalid payment amount');
    }

    // Generate signature
    // data.signature = this.generateSignature(data);

    return {
      url: baseUrl,
      data: data,
      method: 'POST' // PayFast requires POST
    };
  }
  
  async handlePaymentNotification(data) {
    try {
      // Verify the signature
      const receivedSignature = data.signature;
      const calculatedSignature = this.generateSignature(data);
      
      if (receivedSignature !== calculatedSignature) {
        throw new Error('Invalid signature');
      }

      const orderId = data.m_payment_id;
      const paymentStatus = data.payment_status.toLowerCase();
      const amount = parseFloat(data.amount_gross);
      const paymentReference = data.pf_payment_id;

      // Update payment status based on PayFast's notification
      let paymentStatusToSet;
      if (paymentStatus === 'complete') {
        paymentStatusToSet = 'completed';
      } else if (['failed', 'cancelled'].includes(paymentStatus)) {
        paymentStatusToSet = 'failed';
      } else {
        // For other statuses like 'pending', you might want to keep as is
        return { verified: true, status: 'unchanged' };
      }

      // Start transaction
      await db.beginTransaction();

      try {
        // Update payment status
        await db.query(`
          UPDATE payments 
          SET 
            payment_status = ?,
            payment_reference = ?,
            amount_paid = ?,
            updated_at = CURRENT_TIMESTAMP()
          WHERE order_id = ?
        `, [paymentStatusToSet, paymentReference, amount, orderId]);

        // If payment is completed, you might want to update order status too
        if (paymentStatusToSet === 'completed') {
          await db.query(`
            UPDATE orders 
            SET order_status = 'pending' 
            WHERE order_id = ?
          `, [orderId]);
        }

        await db.commit();
        return { verified: true, status: paymentStatusToSet };
      } catch (error) {
        await db.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Payment notification handling failed:', error);
      throw error;
    }
  }
}

module.exports = new PayFastService();