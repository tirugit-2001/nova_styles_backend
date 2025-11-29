import crypto from "crypto";
import razorpay from "../../../config/razorpay";
import paymentRepo from "../repository/payment.repository";
import orderService from "../../orders/service/order.service";
import mongoose from "mongoose";
import Apperror from "../../../utils/apperror";
import productRepository from "../../products/repository/product.repository";
import cartRepository from "../../cart/repository/cart.repository";
import { sendPaymentSuccessEmail } from "../../../helpers/sendemail";
/********create payment order**********/
const createPaymentOrder = async (
  userId: string,
  items: any[],
  addressOrId: string,
  cartFlag: boolean,
  userEmail: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const products = [];

    for (const item of items) {
      const product = await productRepository.findById(item._id, session);
      if (!product) throw new Apperror("Product not found", 404);

      if (product.stock < item.quantity) {
        throw new Apperror(
          `Only ${product.stock} items left in stock for ${product.name}`,
          400
        );
      }

      products.push({
        _id: item._id,
        price: product.price,
        quantity: item.quantity,
        area: item.area,
        selectedColor: item.selectedColor,
        selectedTexture: item.selectedTexture,
        image: item.image,
        name: product.name,
      });
    }

    const amount = products.reduce(
      (sum, item) =>
        sum + item.price * item.quantity * (item.area == 0 ? 1 : item.area),
      0
    );

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `order_rcpt_${Date.now()}`,
      notes: {
        userEmail,
        userId,
        addressId: addressOrId || "",
        items: JSON.stringify(items),
        paymentMethod: "razorpay",
        cartFlag: cartFlag ? "true" : "false",
      },
    };

    let razorpayOrder;
    try {
      console.log("Creating Razorpay order with amount:", amount, "INR");
      razorpayOrder = await razorpay.orders.create(options);
      console.log("Razorpay order created successfully:", razorpayOrder.id);
    } catch (razorpayError: any) {
      // Handle Razorpay-specific errors
      const errorMessage = 
        razorpayError?.error?.description || 
        razorpayError?.description || 
        razorpayError?.message || 
        "Failed to create Razorpay order";
      
      // Map Razorpay error codes to HTTP status codes
      let httpStatusCode = 400; // default
      if (razorpayError?.statusCode && typeof razorpayError.statusCode === 'number') {
        httpStatusCode = razorpayError.statusCode;
      } else if (razorpayError?.error?.code) {
        // Map Razorpay error codes to HTTP status codes
        const razorpayCode = razorpayError.error.code;
        if (razorpayCode === 'BAD_REQUEST_ERROR' || razorpayCode === 'AUTHENTICATION_ERROR') {
          httpStatusCode = 401;
        } else if (razorpayCode === 'GATEWAY_ERROR' || razorpayCode === 'SERVER_ERROR') {
          httpStatusCode = 500;
        } else if (razorpayCode === 'NOT_FOUND_ERROR') {
          httpStatusCode = 404;
        }
      }
      
      // Enhanced error logging for debugging
      console.error("❌ Razorpay API Error:");
      console.error("   Message:", errorMessage);
      console.error("   Code:", razorpayError?.error?.code || "N/A");
      console.error("   Status Code:", razorpayError?.statusCode || httpStatusCode);
      if (razorpayError?.error?.field) {
        console.error("   Field:", razorpayError.error.field);
      }
      console.error("   Full error:", JSON.stringify(razorpayError, null, 2));
      
      // Provide helpful error message based on error type
      let userFriendlyMessage = errorMessage;
      if (razorpayError?.error?.code === 'BAD_REQUEST_ERROR' && errorMessage.includes('Authentication')) {
        userFriendlyMessage = "Razorpay authentication failed. Please check your API keys in the server configuration.";
      }
      
      throw new Apperror(userFriendlyMessage, httpStatusCode);
    }

    const payment = await paymentRepo.create(
      {
        userId,
        razorpayOrderId: razorpayOrder.id,
        amount,
        currency: "INR",
        status: "created",
      },
      session
    );

    await session.commitTransaction();
    session.endSession();

    return { razorpayOrder, payment };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    // If it's already an Apperror, re-throw it
    if (err instanceof Apperror) {
      throw err;
    }
    // Handle other errors (including Razorpay errors that weren't caught above)
    if (err && typeof err === 'object' && 'error' in err) {
      const razorpayError = err as any;
      const errorMessage = 
        razorpayError?.error?.description || 
        razorpayError?.description || 
        razorpayError?.message || 
        "Payment order creation failed";
      
      // Map Razorpay error codes to HTTP status codes
      let httpStatusCode = 400; // default
      if (razorpayError?.statusCode && typeof razorpayError.statusCode === 'number') {
        httpStatusCode = razorpayError.statusCode;
      } else if (razorpayError?.error?.code) {
        const razorpayCode = razorpayError.error.code;
        if (razorpayCode === 'BAD_REQUEST_ERROR' || razorpayCode === 'AUTHENTICATION_ERROR') {
          httpStatusCode = 401;
        } else if (razorpayCode === 'GATEWAY_ERROR' || razorpayCode === 'SERVER_ERROR') {
          httpStatusCode = 500;
        } else if (razorpayCode === 'NOT_FOUND_ERROR') {
          httpStatusCode = 404;
        }
      }
      
      throw new Apperror(errorMessage, httpStatusCode);
    }
    // Convert unknown errors to Apperror
    const errorMessage = err instanceof Error ? err.message : "Payment order creation failed";
    throw new Apperror(errorMessage, 400);
  }
};

// const sendPaymentSuccessEmail = async (userEmail: string, order: any) => {
//   console.log("Attempting to add email job for:", userEmail);

//   if (!emailQueue) {
//     console.warn(
//       "Email queue is not available (Redis not running). Email will not be sent."
//     );
//     return null;
//   }

//   try {
//     const job = await emailQueue.add("sendPaymentEmail", {
//       to: userEmail,
//       subject: "Payment Successful! Order Confirmed",
//       html: `
//         <h1>Thank you for your order!</h1>
//         <p>Your payment has been successfully processed.</p>
//         <p><strong>Order ID:</strong> ${order._id}</p>
//         <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
//         <p>We will start processing your order soon.</p>
//       `,
//     });

//     console.log("Email job added successfully:", job.id);
//     return job;
//   } catch (error) {
//     console.error("Error adding email job:", error);
//     throw error;
//   }
// };

/********verify payment**********/
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
    cartFlag,
  } = data;
  console.log(userEmail);
  console.log("cart flag", cartFlag);
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

    const paymentDoc = await paymentRepo.updateStatus(razorpay_order_id, {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "success",
      verifiedVia: "client-verify",
    });

    console.log(paymentDoc);

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
    if (cartFlag) await cartRepository.clearCart(userId, session);

    await session.commitTransaction();
    session.endSession();
    if (userEmail) {
      console.log("sendidnddnnddndndndndnd");
      console.log(userEmail);
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
