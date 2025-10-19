import { Queue, Worker } from "bullmq";
import nodemailer from "nodemailer";

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
};

// Create queue
export const emailQueue = new Queue("emailQueue", { connection });

// Setup transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Worker to process emails
new Worker(
  "emailQueue",
  async (job) => {
    const { to, subject, html } = job.data;
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log("Email sent to", to);
  },
  { connection }
);
