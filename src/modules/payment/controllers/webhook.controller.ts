import crypto from "crypto";
import mongoose from "mongoose";
import paymentRepository from "../repository/payment.repository";
import Payment from "../../../models/payment.schema";
import orderRepository from "../../orders/repository/order.repository";
import orderService from "../../orders/service/order.service";
import Product from "../../../models/product.schema";
import Apperror from "../../../utils/apperror";
import cartRepository from "../../cart/repository/cart.repository";
import {
  sendPaymentFailedEmail,
  sendPaymentSuccessEmail,
} from "../../../helpers/sendemail";

const RAZORPAY_WEBHOOK_SECRET: any = process.env.RAZORPAY_WEBHOOK_SECRET;
const razorpayWebhook = async (req: any, res: any) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");
    if (expectedSignature !== signature) {
      console.log("Invalid webhook signature");
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }
    const event = req.body.event;
    const paymentEntity = req.body.payload?.payment?.entity;

    console.log(`Webhook received: ${event} | Payment ID: ${paymentEntity.id}`);
    if (event === "payment.captured" || event === "order.paid") {
      const {
        id: paymentId,
        amount,
        order_id: razorpayOrderId,
        status,
        notes,
      } = paymentEntity;
      const userEmail = notes?.userEmail;
      const userId = notes?.userId;
      const addressOrId = notes?.addressId || null;
      const cartFlag = notes?.cartFlag === "true";
      const paymentMethod = notes?.paymentMethod || "razorpay";
      const items = notes?.items ? JSON.parse(notes.items) : [];

      if (!userId || !items.length) {
        console.warn("⚠️ Missing userId or items in notes, skipping...");
        return res
          .status(400)
          .json({ success: false, message: "Invalid notes" });
      }

      const existingPayment = await paymentRepository.findByRazorpayOrderId(
        razorpayOrderId
      );

      if (existingPayment && existingPayment.status === "success") {
        console.log("Payment already processed:", paymentId);
        return res.status(200).json({ success: true });
      }

      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const paymentData: any = await Payment.findOneAndUpdate(
          { razorpay_order_id: razorpayOrderId },
          {
            razorpay_payment_id: paymentId,
            status: "success",
            amount: amount / 100,
            method: paymentMethod,
            user: userId,
            verifiedVia: "webhook",
          },
          { upsert: true, new: true, session }
        );

        const findOrder: any = await orderRepository.findById(paymentData._id);
        if (findOrder?.status == "processed") {
          console.log("order successfully");
          return res.status(200).json({ success: true });
        }

        const order = await orderService.createOrder(
          userId,
          items,
          addressOrId,
          paymentMethod,
          paymentData._id,
          session
        );

        if (userEmail) {
          console.log("sendidnddnnddndndndndnd");
          console.log(userEmail);
          sendPaymentSuccessEmail(userEmail.email, order).catch((err) =>
            console.error("Error adding email job:", err)
          );
        }
        if (paymentData?.amount != order.totalAmount) {
          throw new Apperror("Amount mismatch", 400);
        }
        if (cartFlag) {
          await cartRepository.clearCart(userId, session);
        }
        await session.commitTransaction();
        console.log("Order created successfully via webhook:", paymentId);
      } catch (err) {
        await session.abortTransaction();
        console.error("Webhook order creation failed:", err);
      } finally {
        session.endSession();
      }
    } else if (event === "payment.failed") {
      const reason =
        paymentEntity.error_reason ||
        paymentEntity.error_description ||
        "Unknown";
      const { id: paymentId, order_id: razorpayOrderId, notes } = paymentEntity;
      const userEmail = notes?.userEmail;
      const existingPayment = await Payment.findOneAndUpdate(
        { razorpayOrderId },
        {
          status: "failed",
          error: {
            code: "UNKNOWN",
            description: reason,
          },
        },
        { new: true }
      );
      console.log("Payment failed:", paymentId);
      if (existingPayment) {
        const order = await orderRepository.findById(razorpayOrderId);
        if (order) {
          const session = await mongoose.startSession();
          session.startTransaction();
          try {
            order.status = "Cancelled";
            await order.save({ session });
            for (const item of order.items) {
              await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: item.quantity } },
                { session }
              );
            }
            if (userEmail) {
              sendPaymentFailedEmail(userEmail);
            }
            await session.commitTransaction();
            console.log(`Order ${order._id} cancelled and stock restored`);
          } catch (err) {
            await session.abortTransaction();
            console.error("Failed to restock items:", err);
          } finally {
            session.endSession();
          }
        }
      }
      return res.status(200).json({ success: true });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export default { razorpayWebhook };
