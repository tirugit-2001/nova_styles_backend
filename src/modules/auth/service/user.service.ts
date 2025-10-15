import Apperror from "../../../utils/apperror";
import { comparePassword, hashPassword } from "../../../utils/password";
import { generateTokens, verifyRefreshToken } from "../../../utils/utiltoken";
import userRepository from "../repository/user.repository";
import user from "../../../models/user.schema";
/***********create user  */
const createUser = async (
  username: string,
  email: string,
  password: string,
  phone: string
): Promise<any> => {
  const result = await userRepository.findByEmail(email);
  if (result) {
    throw new Error("User already exists");
  }
  const hashedPassword = hashPassword(password);
  return await userRepository.createUser(
    username,
    email,
    hashedPassword,
    phone
  );
};

/***********login user *********/
const loginUser = async (
  email: string,
  password: string,
  deviceId: string
): Promise<any> => {
  const existingUser = await userRepository.findByEmail(email);
  if (!existingUser) {
    throw new Apperror("User doesnot existed.", 404);
  }
  const isPasswordValid = comparePassword(password, existingUser.password);
  if (!isPasswordValid) {
    throw new Apperror("User doesnot existed.", 401);
  }
  const { refreshToken, accessToken } = generateTokens({
    userId: existingUser._id.toString(),
    email: existingUser.email,
    username: existingUser.username,
    deviceId: deviceId,
  });
  const result = await userRepository.updateSession(
    existingUser._id.toString(),
    deviceId,
    refreshToken
  );

  if (result.matchedCount === 0 && !result.upsertedId) {
    throw new Apperror("Unable to update or create session", 500);
  }
  return { refreshToken, accessToken };
};

/******************refresh***************** */
// const refreshRefreshToken = async (refreshToken: string): Promise<any> => {
//   console.log("refreshToken ", refreshToken);
//   const payload = verifyRefreshToken(refreshToken) as any;
//   console.log(payload);
//   const tokenDoc: any = await userRepository.findSession(
//     payload.userId,
//     payload.deviceId
//   );
//   console.log(tokenDoc);
//   if (!tokenDoc) throw new Apperror("Invalid token", 403);

//   const { accessToken, refreshToken: newRefresh } = generateTokens({
//     userId: payload.userId,
//     username: payload.username,
//     email: payload.email,
//     deviceId: payload.deviceId,
//   });
//   tokenDoc.refreshToken = newRefresh;
//   await tokenDoc.save();
//   return { accessToken, refreshToken: newRefresh };
// };

const refreshRefreshToken = async (refreshToken: string): Promise<any> => {
  const payload = verifyRefreshToken(refreshToken) as any;
  const session = await userRepository.findSession(
    payload.userId,
    payload.deviceId
  );
  if (!session) throw new Apperror("Invalid session or token expired", 403);
  const { accessToken, refreshToken: newRefresh } = generateTokens({
    userId: payload.userId,
    username: payload.username,
    email: payload.email,
    deviceId: payload.deviceId,
  });
  session.refreshToken = newRefresh;
  await session.save();
  return { accessToken, refreshToken: newRefresh };
};

/******************logout from particular device***************** */
const logoutFromDevice = async (
  userId: string,
  deviceId: string
): Promise<any> => {
  const result = await userRepository.deleteSession(userId, deviceId);
  console.log(result);
  if (!result || result.deletedCount == 0) {
    throw new Apperror("No sessions found", 404);
  }
  return result;
};
/******************logout from all device***************** */
const logoutAllDevices = async (userId: string): Promise<void> => {
  const data = await userRepository.deleteAllSession(userId);
  console.log(data);
  if (!data || data.deletedCount == 0) {
    throw new Apperror("No sessions found", 404);
  }
};

export default {
  createUser,
  loginUser,
  refreshRefreshToken,
  logoutFromDevice,
  logoutAllDevices,
};
