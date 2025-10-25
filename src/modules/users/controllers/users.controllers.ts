import { Request, Response, NextFunction } from "express";
import userRepository from "../../auth/repository/user.repository";
import usersService from "../service/users.service";
const getAddress = async (req: Request, res: Response, next: NextFunction) => {
  // Your logic to get the address
  try {
    const address = await usersService.getAddress(req.user!._id);
    return res.status(200).send({ address });
  } catch (error) {
    next(error);
  }
};

export default { getAddress };
