import { Request, Response, NextFunction } from "express";
import usersService from "../service/users.service";
import Apperror from "../../../utils/apperror";
const getUserAddressById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Your logic to get the address
  try {
    if (!req.user?._id) {
      throw new Apperror("user not found ", 404);
    }
    const address = await usersService.getAddress(req?.user?._id);
    console.log(address);
    console.log("addresssss");
    return res.status(200).send({ address });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const getUserOrdersById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Your logic to get the address
  try {
    if (!req.user?._id) {
      throw new Apperror("user not found ", 404);
    }
    const orders = await usersService.getUserOrdersById(req?.user?._id);
    console.log(orders);
    console.log("orders");
    return res.status(200).send({ orders });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export default { getUserAddressById, getUserOrdersById };
