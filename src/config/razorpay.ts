import Razorpay from "razorpay";
import config from "./config";
const razorpayInstance = new Razorpay({
  key_id: config.razorpay_key_id!,
  key_secret: config.razorpay_key_secret!,
});

export default razorpayInstance;
