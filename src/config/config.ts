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
  redist_host: process.env.REDIS_HOST,
  redis_port: process.env.REDIS_PORT,
  smtp_host: process.env.SMTP_HOST,
  smtp_port: process.env.SMTP_PORT,
  smtp_user: process.env.SMTP_USER,
  smtp_pass: process.env.SMTP_PASS,
  claudinary_url: process.env.CLOUDINARY_URL,
  claudinary_api_key: process.env.CLOUDINARY_API_KEY,
  claudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  claudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
};

export default config;
// PORT=8500
// MONGO_URI=mongodb+srv://tiru:tiru9@cluster0.q8y0qjy.mongodb.net/nova_styles?retryWrites=true&w=majority&appName=Cluster0
// JWT_ACCESS_TOKEN_SECRET=fdafafa43389kdfja4389tuhgkdsgjks
// JWT_REFRESH_TOKEN_SECRET=fdaafdajfldkjkafj340934934034jg0934tu394u
// NODE_ENV=development
// CLOUDINARY_CLOUD_NAME=dcvkduuax
// CLOUDINARY_API_KEY=616798363497791
// CLOUDINARY_API_SECRET=g1SI3SJ6X_xj82N5PFT4i4iYMrU
// RAZORPAY_KEY_ID=rzp_test_RWCYoeAwCusnnW
// RAZORPAY_KEY_SECRET=5pQzpFpVW2rhf63dyMNXq0Kd

// CLOUDINARY_URL=cloudinary://616798363497791:g1SI3SJ6X_xj82N5PFT4i4iYMrU@dcvkduuax

// REDIS_HOST=127.0.0.1
// REDIS_PORT=6379

// SMTP_HOST=smtp.gmail.com
// SMTP_PORT=465
// SMTP_USER=etiru9.2001@gmail.com
// SMTP_PASS=bupu jjxs ouat kflf
