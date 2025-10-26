import { Request, Response, NextFunction } from "express";
import paymentService from "../service/payment.service";

const createPaymentOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, items } = req.body;
    const { razorpayOrder, payment } = await paymentService.createPaymentOrder(
      userId,
      items
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

const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await paymentService.verifyPayment(req.body);
    res.status(200).send({
      message: "Payment verified & order created",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export default { createPaymentOrder, verifyPayment };
