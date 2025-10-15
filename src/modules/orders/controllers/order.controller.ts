import { Request, Response, NextFunction } from "express";
import orderService from "../service/order.service";

const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await orderService.getAllOrders();
    res
      .status(200)
      .send({
        orders,
        success: true,
        message: "All Orders fetched successfully",
      });
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res
      .status(200)
      .send({ message: "Order fetched successfully", success: true, order });
  } catch (err) {
    next(err);
  }
};

const getOrdersByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await orderService.getOrdersByUser(req.params.userId);
    res
      .status(200)
      .send({
        orders,
        success: true,
        message: "User Orders fetched successfully",
      });
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id,
      req.body.status
    );
    res
      .status(200)
      .send({ message: "Order status updated", order, success: true });
  } catch (err) {
    next(err);
  }
};

const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await orderService.deleteOrder(req.params.id);
    res.status(200).send({ success: true, message: "Order deleted" });
  } catch (err) {
    next(err);
  }
};

export default {
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder,
};
