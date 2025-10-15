import SessionModel from "../../../models/session.schema";

const updateSession = async (
  userId: string,
  deviceId: string,
  refreshToken: string
) => {
  return await SessionModel.updateOne(
    { userId, deviceId },
    { $set: { refreshToken, updatedAt: new Date() } },
    { upsert: true }
  );
};

const findSession = async (userId: string, deviceId: string) => {
  return await SessionModel.findOne({ userId, deviceId });
};

const deleteSession = async (userId: string, deviceId: string) => {
  return await SessionModel.deleteOne({ userId, deviceId });
};

const deleteAllSession = async (userId: string) => {
  return await SessionModel.deleteMany({ userId });
};

const getUserSessions = async (userId: string) => {
  return await SessionModel.find({ userId });
};

export default {
  updateSession,
  findSession,
  deleteSession,
  deleteAllSession,
  getUserSessions,
};
