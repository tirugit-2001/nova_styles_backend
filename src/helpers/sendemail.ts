import nodemailer from "nodemailer";
import config from "../config/config";

type BaseEmailPayload = {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
};

const transporter = nodemailer.createTransport({
  host: config.smtp_host,
  port: Number(config.smtp_port),
  secure: Number(config.smtp_port) === 465,
  auth: {
    user: config.smtp_user,
    pass: config.smtp_pass,
  },
  connectionTimeout: 20_000,
  logger: true,
  debug: true,
});

const sendEmail = async (payload: any) => {
  try {
    await transporter.sendMail({
      from: config.smtp_user,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      attachments: payload.attachments,
    });
    console.log(
      `Email sent to ${payload.to} with subject "${payload.subject}"`
    );
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const sendPaymentSuccessEmail = async (userEmail: string, order: any) => {
  return sendEmail({
    to: userEmail,
    subject: "Payment Successful! Order Confirmed",
    html: `
      <h1>Thank you for your order!</h1>
      <p>Your payment has been successfully processed.</p>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
      <p>We will start processing your order soon.</p>
    `,
  });
};

const sendPaymentFailedEmail = async (userEmail: string) => {
  return sendEmail({
    to: userEmail,
    subject: "Payment Failed! Order Not Processed",
    html: `
      <h1>Payment Failed</h1>
      <p>Unfortunately, your payment could not be processed.</p>
      <p>Please try again or contact support for assistance.</p>
    `,
  });
};

const sendOrderUpdateEmail = async (
  userEmail: string,
  payload: {
    orderNumber: string;
    status: string;
    totalAmount?: number;
    tracking?: {
      location?: string;
      status?: string;
      updatedAt?: Date | string;
      notes?: string;
    };
    customerName?: string;
    message?: string;
  }
) => {
  const { orderNumber, status, totalAmount, tracking, customerName, message } =
    payload;

  const trackingHtml = tracking
    ? `
      <h3>Latest Tracking Update</h3>
      <ul>
        <li><strong>Location:</strong> ${tracking.location || "N/A"}</li>
        <li><strong>Status:</strong> ${tracking.status || "N/A"}</li>
        <li><strong>Updated At:</strong> ${
          tracking.updatedAt
            ? new Date(tracking.updatedAt).toLocaleString()
            : "N/A"
        }</li>
        ${
          tracking.notes
            ? `<li><strong>Notes:</strong> ${tracking.notes}</li>`
            : ""
        }
      </ul>
    `
    : "<p>No tracking updates are available yet.</p>";

  const customMessage = message
    ? `<p>${message}</p>`
    : "<p>We wanted to let you know the latest status of your order.</p>";

  return sendEmail({
    to: userEmail,
    subject: `Update for Order ${orderNumber}`,
    html: `
      <h2>Hello ${customerName || "Customer"},</h2>
      ${customMessage}
      <p><strong>Order Number:</strong> ${orderNumber}</p>
      <p><strong>Current Status:</strong> ${status}</p>
      ${
        typeof totalAmount === "number"
          ? `<p><strong>Total Amount:</strong> ₹${totalAmount.toLocaleString()}</p>`
          : ""
      }
      ${trackingHtml}
      <p>If you have any questions, feel free to reply to this email.</p>
      <p>Thank you for shopping with us!</p>
    `,
  });
};

export {
  sendEmail,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendOrderUpdateEmail,
};
