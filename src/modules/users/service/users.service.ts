import usersRepository from "../repository/users.repository";

const getAddress = async (userId: string) => {
  return await usersRepository.findAddressById(userId);
};
export default { getAddress };
