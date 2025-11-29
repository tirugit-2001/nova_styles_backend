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
  redis_host: process.env.REDIS_HOST,
  redis_port: process.env.REDIS_PORT,
  redis_password: process.env.REDIS_PASSWORD,
  smtp_host: process.env.SMTP_HOST,
  smtp_port: process.env.SMTP_PORT,
  smtp_user: process.env.SMTP_USER,
  smtp_pass: process.env.SMTP_PASS,
  claudinary_url: process.env.CLOUDINARY_URL,
  claudinary_api_key: process.env.CLOUDINARY_API_KEY,
  claudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  claudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  adminEmail: process.env.ADMIN_EMAIL,
};

export default config;
