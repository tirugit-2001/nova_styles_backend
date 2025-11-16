import Sessionmodel from "../../../models/session.schema";
import user from "../../../models/user.schema";

const findByEmail = async (email: string): Promise<any> => {
  const existingUser = await user.findOne({ email });
  return existingUser;
};
const findById = async (id: string): Promise<any> => {
  const existingUser = await user.findById(id);
  return existingUser;
};
const createUser = async (
  username: string,
  email: string,
  password: string,
  phone: string
): Promise<any> => {
  const newUser = new user({ username, email, password, phone });
  return await newUser.save();
};

const updateSession = async (
  userId: string,
  deviceId: string,
  refreshToken: string
) => {
  const result = await Sessionmodel.updateOne(
    { userId, deviceId },
    {
      $set: {
        deviceId,
        userId,
        refreshToken,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
  return result;
};

const findSession = async (userId: string, deviceId: string) => {
  return await Sessionmodel.findOne({ userId, deviceId });
};

const deleteSession = async (userId: string, deviceId: string) => {
  return await Sessionmodel.findOneAndDelete({ userId, deviceId });
};

const deleteAllSession = async (userId: string) => {
  return await Sessionmodel.deleteMany({ userId });
};
export default {
  findByEmail,
  createUser,
  updateSession,
  findSession,
  deleteSession,
  deleteAllSession,
  findById,
};
