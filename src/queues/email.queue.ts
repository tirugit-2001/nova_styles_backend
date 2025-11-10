import { Queue } from "bullmq";
import config from "../config/config";

const connection = {
  host: config.redis_host,
  port: Number(config.redis_port),
  password: config.redis_password,
  tls: {
    rejectUnauthorized: false, // allow secure connection
  },
};

export const emailQueue = new Queue("emailQueue", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});
