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
  } catch (err) {
    next(err);
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
