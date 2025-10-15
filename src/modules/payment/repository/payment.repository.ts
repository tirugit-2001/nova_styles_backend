import Payment from "../../../models/payment.schema";

const create = async (data: any) => {
  return await Payment.create(data);
};

const updateStatus = async (razorpayOrderId: string, updateData: any) => {
  return await Payment.findOneAndUpdate({ razorpayOrderId }, updateData, {
    new: true,
  });
};

const findByRazorpayOrderId = async (razorpayOrderId: string) => {
  return await Payment.findOne({ razorpayOrderId });
};

export default { create, updateStatus, findByRazorpayOrderId };
