import { Queue, Worker } from "bullmq";
import nodemailer from "nodemailer";
import config from "../config/config";

const connection = {
  host: config.redist_host || "127.0.0.1",
  port: Number(config.redis_port) || 6379,
};

// Error tracking for rate limiting error messages
let lastErrorLogTime = 0;
const ERROR_LOG_INTERVAL = 30000; // Log errors at most once every 30 seconds

function logErrorOnce(message: string, error?: Error) {
  const now = Date.now();
  if (now - lastErrorLogTime > ERROR_LOG_INTERVAL) {
    console.error(message, error || "");
    lastErrorLogTime = now;
  }
}

// Create queue with error handling
let emailQueue: Queue | null = null;
let emailWorker: Worker | null = null;

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

  // Setup transporter
  const transporter = nodemailer.createTransport({
    host: config.smtp_host,
    port: Number(config.smtp_port) || 587,
    secure: Number(config.smtp_port) === 465,
    auth: {
      user: config.smtp_user,
      pass: config.smtp_pass,
    },
  });

  // Verify transporter configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ SMTP configuration error:", error);
    } else {
      console.log("✅ SMTP server is ready to send emails");
    }
  });

  // Worker to process emails
  emailWorker = new Worker(
    "emailQueue",
    async (job) => {
      console.log("📧 Processing email job:", job.id);
      console.log("Job data:", job.data);

      const { to, subject, html } = job.data;

      try {
        const info = await transporter.sendMail({
          from: config.smtp_user,
          to,
          subject,
          html,
        });
        console.log("✅ Email sent successfully to", to);
        console.log("Message ID:", info.messageId);
        return info;
      } catch (error) {
        console.error("❌ Error sending email:", error);
        throw error; // Re-throw to mark job as failed
      }
    },
    {
      connection,
      concurrency: 5,
    }
  );

  // Add event listeners
  emailWorker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
  });

  emailWorker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed with error:`, err);
  });

  emailWorker.on("error", (err) => {
    // Rate limit connection error messages
    if (err.message.includes("ECONNREFUSED") || err.message.includes("6379")) {
      logErrorOnce("⚠️  Redis connection error (Redis not running). Email queue will not work until Redis is started.", err);
    } else {
      console.error("❌ Worker error:", err);
    }
  });

  console.log("🚀 Email worker started and listening for jobs");
} catch (error) {
  console.error("⚠️  Failed to initialize email queue. Email functionality will be unavailable.", error);
}

export { emailQueue, emailWorker };
