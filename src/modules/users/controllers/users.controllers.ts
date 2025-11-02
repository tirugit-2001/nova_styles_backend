import { Request, Response, NextFunction } from "express";
import userRepository from "../../auth/repository/user.repository";
import usersService from "../service/users.service";
import Apperror from "../../../utils/apperror";
const getAddress = async (req: Request, res: Response, next: NextFunction) => {
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

export default { getAddress };
