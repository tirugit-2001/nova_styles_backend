import { Request, Response, NextFunction } from "express";
import paymentService from "../service/payment.service";
import Apperror from "../../../utils/apperror";

/********create payment order**********/
const createPaymentOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { items, address, cartFlag } = req.body;
    const userId = req.user?._id;
    const userEmail = req.user?.email;
    if (!userId || !userEmail) {
      throw new Apperror("userId or userEmail not found", 404);
    }
    const { razorpayOrder, payment } = await paymentService.createPaymentOrder(
      userId,
      items,
      address,
      cartFlag,
      userEmail
    );
    res.status(200).send({
      message: "Payment order created",
      order: razorpayOrder,
      payment,
    });
  } catch (err: any) {
    // If it's already an Apperror, pass it through
    if (err instanceof Apperror) {
      return next(err);
    }
    // Handle Razorpay errors that might have slipped through
    if (err && typeof err === 'object' && 'error' in err) {
      const razorpayError = err as any;
      const errorMessage = 
        razorpayError.error?.description || 
        razorpayError.description || 
        razorpayError.message || 
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
      
      return next(new Apperror(errorMessage, httpStatusCode));
    }
    // Convert unknown errors to Apperror
    const errorMessage = err?.message || err?.toString() || "Payment order creation failed";
    next(new Apperror(errorMessage, 400));
  }
};

/********verify payment**********/
const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      address,
      totalAmount,
      paymentMethod,
      cartFlag,
    } = req.body;
    const userId = req.user?._id;
    const userEmail = req.user?.email;
    const result = await paymentService.verifyPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      address,
      totalAmount,
      paymentMethod,
      userId,
      userEmail,
      cartFlag,
    });
    console.log("result");
    console.log(result);
    res.status(200).send({
      message: "Payment verified & order created",
      ...result,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export default { createPaymentOrder, verifyPayment };
