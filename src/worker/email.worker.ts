import { Worker } from "bullmq";
import nodemailer from "nodemailer";
import config from "../config/config";

const connection = {
  host: config.redis_host,
  port: Number(config.redis_port),
  password: config.redis_password,
};

const transporter = nodemailer.createTransport({
  host: config.smtp_host,
  port: Number(config.smtp_port),
  secure: Number(config.smtp_port) === 465,
  auth: {
    user: config.smtp_user,
    pass: config.smtp_pass,
  },
});

const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    const { to, subject, html } = job.data;
    await transporter.sendMail({
      from: config.smtp_user,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  },
  { connection }
);

emailWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed`, err);
});

console.log("Email Worker Running...");
