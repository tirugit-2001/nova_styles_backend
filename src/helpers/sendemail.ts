import { emailQueue } from "../queues/email.queue";

const sendPaymentSuccessEmail = async (userEmail: string, order: any) => {
  console.log("Attempting to add email job for:", userEmail);

  if (!emailQueue) {
    console.warn(
      "Email queue is not available (Redis not running). Email will not be sent."
    );
    return null;
  }

  try {
    const job = await emailQueue.add("sendPaymentEmail", {
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

    console.log("Email job added successfully:", job.id);
    return job;
  } catch (error) {
    console.error("Error adding email job:", error);
    throw error;
  }
};

const sendPaymentFailedEmail = async (userEmail: string) => {
  console.log("Attempting to add email job for:", userEmail);

  if (!emailQueue) {
    console.warn(
      "Email queue is not available (Redis not running). Email will not be sent."
    );
    return null;
  }

  try {
    const job = await emailQueue.add("sendPaymentEmail", {
      to: userEmail,
      subject: "Payment Failed! Order Not Processed",
      html: `
        <h1>Payment Failed</h1>
        <p>Unfortunately, your payment could not be processed.</p>
        <p>Please try again or contact support for assistance.</p>
      `,
    });

    console.log("Email job added successfully:", job.id);
    return job;
  } catch (error) {
    console.error("Error adding email job:", error);
    throw error;
  }
};
export { sendPaymentSuccessEmail, sendPaymentFailedEmail };
