import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

console.log(process.env.PORT);
const config = {
  port: process.env.PORT || 5000,
  mongoURI: (process.env.MONGO_URI as string) || "",
  jwtAccessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || "",
  jwtRefreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
  node_env: process.env.NODE_ENV || "development",
  razorpay_key_id: process.env.RAZORPAY_KEY_ID!,
  razorpay_key_secret: process.env.RAZORPAY_KEY_SECRET!,
};

export default config;
