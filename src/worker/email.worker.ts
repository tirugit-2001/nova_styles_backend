import { Worker } from "bullmq";
import nodemailer from "nodemailer";
import config from "../config/config";

const connection = {
  host: config.redis_host,
  port: Number(config.redis_port),
  password: config.redis_password,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

const transporter = nodemailer.createTransport({
  host: config.smtp_host,
  port: Number(config.smtp_port),
  secure: Number(config.smtp_port) === 465,
  auth: {
    user: config.smtp_user,
    pass: config.smtp_pass,
  },
  connectionTimeout: 30_000, // 30 seconds
  socketTimeout: 30_000, // 30 seconds
  greetingTimeout: 10_000, // 10 seconds
});

let emailWorker: Worker | null = null;

try {
  emailWorker = new Worker(
    "emailQueue",
    async (job) => {
      const { to, subject, html, attachments } = job.data;
      
      // Normalize attachments if present
      const normalizedAttachments = attachments
        ? attachments.map((attachment: any) => {
            if (!attachment || !attachment.content) return attachment;

            // Handle Buffer
            if (attachment.content instanceof Buffer) {
              return attachment;
            }

            // Handle string content
            if (typeof attachment.content === "string") {
              return attachment;
            }

            // Handle serialized Buffer (from queue)
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

            // Fallback: convert to Buffer
            return {
              ...attachment,
              content: Buffer.from(String(attachment.content)),
            };
          })
        : undefined;

      await transporter.sendMail({
        from: config.smtp_user,
        to,
        subject,
        html,
        attachments: normalizedAttachments,
      });
      console.log(`✅ Email sent to ${to} (Job ID: ${job.id})`);
    },
    { 
      connection,
      concurrency: 5,
    }
  );

  emailWorker.on("completed", (job) => {
    console.log(`✅ Email job ${job.id} completed successfully`);
  });

  emailWorker.on("failed", (job, err) => {
    console.error(`❌ Email job ${job?.id} failed:`, err);
  });

  emailWorker.on("error", (err) => {
    console.error("❌ Email worker error:", err);
  });

  console.log("✅ Email Worker started and listening for jobs");
} catch (error) {
  // Don't crash the app - email worker is optional
  console.warn("⚠️  Email worker not available (Redis may be down). App will continue without email processing.");
  console.warn("⚠️  Error details:", error instanceof Error ? error.message : error);
  emailWorker = null;
}
