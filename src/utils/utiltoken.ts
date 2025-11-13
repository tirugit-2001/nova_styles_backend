import jwt from "jsonwebtoken";

import config from "../config/config";

/*******generate tokens******** */
const generateTokens = (payload: {
  userId: string;
  email: string;
  username: string;
  deviceId: string;
  role?: string;
}) => {
  const accessToken = jwt.sign(
    {
      _id: payload.userId,
      username: payload.username,
      email: payload.email,
      deviceId: payload.deviceId,
      role: payload.role || "user", // Include role in token, default to "user"
    },
    config.jwtAccessTokenSecret,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
      deviceId: payload.deviceId,
      role: payload.role || "user", // Include role in refresh token too
    },
    config.jwtRefreshTokenSecret as string,
    {
      expiresIn: "7d",
    }
  );
  return { accessToken, refreshToken };
};

/*********verify access token***********/
const verifyAccessToken = (token: string) =>
  jwt.verify(token, config.jwtAccessTokenSecret);
/*********verify refresh token***********/
const verifyRefreshToken = (token: string) =>
  jwt.verify(token, config.jwtRefreshTokenSecret as string);
export { generateTokens, verifyAccessToken, verifyRefreshToken };
