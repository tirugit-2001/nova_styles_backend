import Address from "../../../models/address.schema";

const findAddressById = async (id: string): Promise<any> => {
  return await Address.find({ user: id });
};
export default { findAddressById };
