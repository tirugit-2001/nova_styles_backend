import Razorpay from "razorpay";
import config from "./config";

// Validate Razorpay credentials
if (!config.razorpay_key_id || !config.razorpay_key_secret) {
  console.warn("⚠️  WARNING: Razorpay credentials are missing!");
  console.warn("   Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file");
  console.warn("   Without these, payment functionality will not work.");
} else {
  // Validate key format
  const keyId = config.razorpay_key_id;
  const keySecret = config.razorpay_key_secret;
  
  if (!keyId.startsWith('rzp_')) {
    console.warn("⚠️  WARNING: RAZORPAY_KEY_ID format looks incorrect!");
    console.warn("   Expected format: rzp_test_... or rzp_live_...");
    console.warn("   Current value starts with:", keyId.substring(0, 10));
  }
  
  if (keySecret.length < 20) {
    console.warn("⚠️  WARNING: RAZORPAY_KEY_SECRET seems too short!");
    console.warn("   Please verify your secret key is correct.");
  }
}

const razorpayInstance = new Razorpay({
  key_id: config.razorpay_key_id!,
  key_secret: config.razorpay_key_secret!,
});

// Log Razorpay initialization (without exposing secrets)
if (config.razorpay_key_id) {
  const keyPrefix = config.razorpay_key_id.substring(0, 12);
  const isTestKey = config.razorpay_key_id.startsWith('rzp_test_');
  const keyType = isTestKey ? 'TEST' : 'LIVE';
  console.log(`✓ Razorpay initialized with ${keyType} key: ${keyPrefix}...`);
  
  if (!config.razorpay_key_secret) {
    console.error("✗ Razorpay key_secret is missing!");
  }
} else {
  console.error("✗ Razorpay key_id is missing!");
}

export default razorpayInstance;
