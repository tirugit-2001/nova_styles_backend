import mongoose from "mongoose";
import config from "./config";
// console.log(config);
const connectionToDb = async () => {
  try {
    await mongoose.connect(config.mongoURI);
    console.log("Database connected successfully");
  } catch (er) {
    console.log("Database connection failed");
    console.log(er);
  }
};
export default connectionToDb;
