import { Queue } from "bullmq";
import config from "../config/config";

const connection: any = {
  host: config.redis_host,
  port: Number(config.redis_port),
  password: config.redis_password,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

let emailQueue: Queue | null = null;

try {
  emailQueue = new Queue("emailQueue", {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  });

  emailQueue.on("error", (err) => {
    // Don't crash - email is optional
    console.warn("⚠️  Email queue error (non-critical):", err instanceof Error ? err.message : String(err));
  });

  console.log("✅ Email queue initialized (Redis connection will be tested on first use)");
} catch (error) {
  // Don't crash the app - email is optional
  console.warn("⚠️  Email queue not available (Redis may be down). App will continue without email functionality.");
  console.warn("⚠️  Error details:", error instanceof Error ? error.message : error);
  emailQueue = null;
}

export { emailQueue };
