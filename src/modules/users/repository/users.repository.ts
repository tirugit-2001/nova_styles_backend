import Address from "../../../models/address.schema";
import Order from "../../../models/order.schema";

const findAddressById = async (id: string): Promise<any> => {
  return await Address.find({ user: id });
};

const findUserOrdersById = async (id: string): Promise<any> => {
  return await Order.find({ userId: id });
};
export default { findAddressById, findUserOrdersById };
