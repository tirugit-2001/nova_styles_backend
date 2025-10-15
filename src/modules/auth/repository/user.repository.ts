import Session from "../../../models/session.schema";
import user from "../../../models/user.schema";

const findByEmail = async (email: string): Promise<any> => {
  const existingUser = await user.findOne({ email });
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
  return await Session.updateOne(
    { userId, deviceId },
    { $set: { refreshToken, updatedAt: new Date() } },
    { upsert: true }
  );
};

const findSession = async (userId: string, deviceId: string) => {
  return await Session.findOne({ userId, deviceId });
};

const deleteSession = async (userId: string, deviceId: string) => {
  return await Session.deleteOne({ userId, deviceId });
};

const deleteAllSession = async (userId: string) => {
  return await Session.deleteMany({ userId });
};

const getUserSessions = async (userId: string) => {
  return await Session.find({ userId });
};

export default {
  findByEmail,
  createUser,
  updateSession,
  findSession,
  deleteSession,
  deleteAllSession,
  getUserSessions,
};
