import Address from "../../../models/address.schema";

const findAddressById = async (id: string): Promise<any> => {
  return await Address.find({ _id: id });
};
export default { findAddressById };
