import { Queue, Worker } from "bullmq";
import nodemailer from "nodemailer";
import config from "../config/config";

const connection = {
  host: config.redis_host || "127.0.0.1",
  port: Number(config.redis_port) || 6379,
  // Only include password if it's set (Redis may not require authentication)
  ...(config.redis_password && { password: config.redis_password }),
  // tls: {
  //   rejectUnauthorized: false, // allow secure connection
  // },
};

const createLogOnce = () => {
  let logged = false;
  return (message: string, error?: unknown) => {
    if (logged) return;
    logged = true;
    console.error(message, error);
  };
};

let emailQueue: Queue | null = null;
let emailWorker: Worker | null = null;
const logErrorOnce = createLogOnce();

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

  const transporter = nodemailer.createTransport({
    host: config.smtp_host,
    port: Number(config.smtp_port) || 587,
    secure: Number(config.smtp_port) === 465,
    auth: {
      user: config.smtp_user,
      pass: config.smtp_pass,
    },
  });

  transporter.verify((error) => {
    if (error) {
      console.error("❌ SMTP configuration error:", error);
    } else {
      console.log("✅ SMTP server is ready to send emails");
    }
  });

  emailWorker = new Worker(
    "emailQueue",
    async (job) => {
      console.log("📧 Processing email job:", job.id);

      const { to, subject, html, attachments } = job.data;
      const normalizedAttachments = Array.isArray(attachments)
        ? attachments.map((attachment) => {
            if (!attachment || !attachment.content) return attachment;

            if (
              attachment.content instanceof Buffer ||
              typeof attachment.content === "string"
            ) {
              return attachment;
            }

            if (
              typeof attachment.content === "object" &&
              attachment.content.type === "Buffer" &&
              Array.isArray(attachment.content.data)
            ) {
              return {
                ...attachment,
                content: Buffer.from(attachment.content.data),
              };
            }

            return {
              ...attachment,
              content: Buffer.from(String(attachment.content)),
            };
          })
        : undefined;

      try {
        const info = await transporter.sendMail({
          from: config.smtp_user,
          to,
          subject,
          html,
          attachments: normalizedAttachments,
        });
        console.log("✅ Email sent successfully to", to);
        console.log("Message ID:", info.messageId);
        return info;
      } catch (error) {
        console.error("❌ Error sending email:", error);
        throw error;
      }
    },
    {
      connection,
      concurrency: 5,
    }
  );

  emailWorker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
  });

  emailWorker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed with error:`, err);
  });

  emailWorker.on("error", (err) => {
    if (
      err &&
      typeof err === "object" &&
      "message" in err &&
      typeof (err as Error).message === "string"
    ) {
      const errorMessage = (err as Error).message;
      
      if (errorMessage.includes("ECONNREFUSED") || errorMessage.includes("6379")) {
        logErrorOnce(
          "⚠️  Redis connection error (Redis not running). Email queue will not work until Redis is started.",
          err
        );
      } else if (errorMessage.includes("WRONGPASS") || errorMessage.includes("invalid username-password")) {
        logErrorOnce(
          "⚠️  Redis authentication failed. Check your REDIS_PASSWORD in .env file. If Redis doesn't require a password, remove REDIS_PASSWORD from .env or leave it empty.",
          err
        );
      } else {
        console.error("❌ Worker error:", err);
      }
    } else {
      console.error("❌ Worker error:", err);
    }
  });

  console.log("🚀 Email worker started and listening for jobs");
} catch (error) {
  console.error(
    "⚠️  Failed to initialize email queue. Email functionality will be unavailable.",
    error
  );
}

export { emailQueue, emailWorker };
