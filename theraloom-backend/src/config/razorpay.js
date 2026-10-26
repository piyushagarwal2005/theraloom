const Razorpay = require('razorpay');

let razorpayInstance = null;

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_theraloom_key123';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_theraloom456';

try {
  razorpayInstance = new Razorpay({
    key_id,
    key_secret,
  });
} catch (err) {
  console.warn('[Razorpay] Failed to initialize live client, using test adapter:', err.message);
}

module.exports = {
  razorpayInstance,
  key_id,
  key_secret,
};
