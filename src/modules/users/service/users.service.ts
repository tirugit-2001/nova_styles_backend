import usersRepository from "../repository/users.repository";

const getAddress = async (userId: string) => {
  return await usersRepository.findAddressById(userId);
};

const getUserOrdersById = async (userId: string) => {
  return await usersRepository.findUserOrdersById(userId);
};
export default { getAddress, getUserOrdersById };
