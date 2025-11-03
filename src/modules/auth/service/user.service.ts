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
    throw new Apperror("User already exists", 409);
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
    role: existingUser.role || "user", // Include user role in token
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

const refreshRefreshToken = async (refreshToken: string): Promise<any> => {
  const payload = verifyRefreshToken(refreshToken) as any;
  const session = await userRepository.findSession(
    payload.userId,
    payload.deviceId
  );
  if (!session) throw new Apperror("Invalid session or token expired", 403);
  // Include role from payload (refresh token) or default to "user"
  const { accessToken, refreshToken: newRefresh } = generateTokens({
    userId: payload.userId,
    username: payload.username,
    email: payload.email,
    deviceId: payload.deviceId,
    role: payload.role || "user", // Include role when refreshing tokens
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

const checkSession = async (useremail: string) => {
  const userData = await userRepository.findByEmail(useremail);
  if (!userData) {
    throw new Apperror("No session found", 404);
  }
  return userData;
};

/***********create admin *********/
const createAdmin = async (email: string, password: string): Promise<any> => {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new Apperror("User already exists", 409);
  }
  const hashedPassword = hashPassword(password);
  // Create admin with default phone number (can be updated later)
  const adminUser = await userRepository.createUser(
    "Admin User",
    email,
    hashedPassword,
    "9999999999"
  );
  // Update role to admin
  await userRepository.updateUser(adminUser._id.toString(), { role: "admin" });
  adminUser.role = "admin";
  return adminUser;
};

/***********change password *********/
const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<any> => {
  const existingUser = await user.findById(userId);
  if (!existingUser) {
    throw new Apperror("User not found", 404);
  }

  // Verify current password
  const isPasswordValid = comparePassword(currentPassword, existingUser.password);
  if (!isPasswordValid) {
    throw new Apperror("Current password is incorrect", 401);
  }

  // Hash new password
  const hashedPassword = hashPassword(newPassword);

  // Update password
  await userRepository.updateUserPassword(userId, hashedPassword);

  return { message: "Password changed successfully" };
};

export default {
  createUser,
  loginUser,
  refreshRefreshToken,
  logoutFromDevice,
  logoutAllDevices,
  checkSession,
  createAdmin,
  changePassword,
};
