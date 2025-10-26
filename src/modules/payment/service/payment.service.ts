import crypto from "crypto";
import razorpay from "../../../config/razorpay";
import paymentRepo from "../repository/payment.repository";
import orderService from "../../orders/service/order.service";
import mongoose from "mongoose";
import Apperror from "../../../utils/apperror";
import productRepository from "../../products/repository/product.repository";
import { emailQueue } from "../../../queues/email.queue";
const createPaymentOrder = async (userId: string, items: any[]) => {
  const products = await Promise.all(
    items.map(async (item) => {
      const product = await productRepository.findById(item.productId);
      if (!product) throw new Apperror("Product not found", 404);
      return { price: product.price, quantity: item.quantity };
    })
  );
  const amount = products.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: `order_rcpt_${Date.now()}`,
  };

  const razorpayOrder = await razorpay.orders.create(options);

  const payment = await paymentRepo.create({
    userId,
    razorpayOrderId: razorpayOrder.id,
    amount,
    currency: "INR",
    status: "created",
  });

  return { razorpayOrder, payment };
};

const sendPaymentSuccessEmail = async (userEmail: string, order: any) => {
  await emailQueue.add("sendPaymentEmail", {
    to: userEmail,
    subject: "Payment Successful! Order Confirmed",
    html: `
      <h1>Thank you for your order!</h1>
      <p>Your payment has been successfully processed.</p>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
      <p>We will start processing your order soon.</p>
    `,
  });
};
const verifyPayment = async (data: any) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
    address,
    items,
    userEmail,
    paymentMethod,
  } = data;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await paymentRepo.updateStatus(razorpay_order_id, {
        status: "failed",
        error: { code: "SIGNATURE_MISMATCH", description: "Invalid signature" },
      });
      throw new Apperror("Payment verification failed", 400);
    }

    // update payment to success
    const paymentDoc = await paymentRepo.updateStatus(razorpay_order_id, {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "success",
    });

    // create order safely
    const order = await orderService.createOrder(
      userId,
      items,
      address,
      paymentMethod,
      paymentDoc?._id as string,
      session
    );

    if (paymentDoc?.amount != order.totalAmount) {
      throw new Apperror("Amount mismatch", 400);
    }
    await session.commitTransaction();
    session.endSession();
    if (userEmail) {
      sendPaymentSuccessEmail(userEmail, order).catch((err) =>
        console.error("Error adding email job:", err)
      );
    }

    return { payment: paymentDoc, order };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    await paymentRepo.updateStatus(razorpay_order_id, {
      status: "failed",
      error: {
        code: "UNKNOWN",
        description:
          err instanceof Error ? err.message : "Unknown error occurred",
      },
    });

    throw err;
  }
};

export default {
  createPaymentOrder,
  verifyPayment,
};
