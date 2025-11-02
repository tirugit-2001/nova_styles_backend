import { deleteImage, uploadImage } from "../../../config/cloudinary";
import Apperror from "../../../utils/apperror";
import contentRepository from "../repository/content.repository";
import { emailQueue } from "../../../queues/email.queue";
import config from "../../../config/config";

const createContent = async (data: any, file?: Express.Multer.File) => {
  if (!file) {
    throw new Apperror("image is required ", 401);
  }
  const uploadResult: any = await uploadImage(file.buffer);
  data.image = uploadResult.secure_url;
  return await contentRepository.createSection(data);
};

const getContentBySection = async (section: string) => {
  return await contentRepository.findSection(section);
};
const getContentById = async (id: string) => {
  return await contentRepository.findById(id);
};

const updateContent = async (
  id: string,
  data: any,
  file?: Express.Multer.File
) => {
  const existingData = await contentRepository.findById(id);
  if (!existingData) {
    throw new Apperror("itme not found", 404);
  }

  if (file && existingData?.image) {
    await deleteImage(existingData.image);

    const uploadResult: any = await uploadImage(file.buffer);
    data.image = uploadResult.secure_url;
  }
  return await contentRepository.updateContent(id, data);
};

const deleteContent = async (id: string) => {
  await contentRepository.deleteContent(id);
  return true;
};

const sendInteriorDesignNotification = async (formData: any) => {
  if (!emailQueue) {
    console.warn(
      "⚠️  Email queue is not available (Redis not running). Email will not be sent."
    );
    throw new Apperror("Email service is currently unavailable", 503);
  }

  if (!config.adminEmail) {
    throw new Apperror("Admin email is not configured", 500);
  }

  const now = new Date();
  const timeString = now.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Format addons list if any
  const addonsList =
    formData.addons && formData.addons.length > 0
      ? formData.addons
          .map((addon: string) => `<li>${addon}</li>`)
          .join("")
      : "<li>None selected</li>";

  // Format prices in Indian currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const packagePrice = formData.packagePrice || 0;
  const addonsTotal = formData.addonsTotal || 0;
  const totalPrice = formData.totalPrice || 0;

  // Create HTML email template
  const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🏠 Interior Design Consultation Request</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 20px;">
              <!-- Project Details Section -->
              <div style="margin-bottom: 30px;">
                <h2 style="color: #333333; font-size: 20px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #667eea;">📋 Project Details</h2>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666666; font-weight: bold; width: 40%;">Floorplan:</td>
                    <td style="color: #333333;">${formData.floorplan}</td>
                  </tr>
                  ${formData.purpose ? `
                  <tr>
                    <td style="color: #666666; font-weight: bold;">Purpose:</td>
                    <td style="color: #333333;">${formData.purpose}</td>
                  </tr>
                  ` : ""}
                </table>
              </div>

              <!-- Selected Package Section -->
              <div style="margin-bottom: 30px; background-color: #f8f9fa; padding: 20px; border-radius: 6px;">
                <h2 style="color: #333333; font-size: 20px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #667eea;">📦 Selected Package</h2>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #333333; font-size: 16px; font-weight: bold;">
                      ${formData.selectedPackage}
                    </td>
                    <td style="color: #333333; font-size: 16px; font-weight: bold; text-align: right;">
                      ${formatPrice(packagePrice)}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Selected Add-ons Section -->
              ${formData.addons && formData.addons.length > 0 ? `
              <div style="margin-bottom: 30px;">
                <h2 style="color: #333333; font-size: 20px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #667eea;">🔧 Selected Add-ons</h2>
                <ul style="margin: 0 0 15px 0; padding-left: 20px; color: #333333;">
                  ${addonsList}
                </ul>
                <div style="text-align: right; padding-top: 10px; border-top: 1px solid #e0e0e0;">
                  <span style="color: #666666; font-weight: bold;">Add-ons Total: </span>
                  <span style="color: #333333; font-weight: bold; font-size: 16px;">${formatPrice(addonsTotal)}</span>
                </div>
              </div>
              ` : ""}

              <!-- Total Estimation Section -->
              <div style="margin-bottom: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 8px;">
                <h2 style="color: #ffffff; font-size: 22px; margin: 0 0 20px 0; text-align: center;">💰 Total Estimated Cost</h2>
                <table width="100%" cellpadding="10" cellspacing="0" style="background-color: rgba(255, 255, 255, 0.1); border-radius: 6px;">
                  ${packagePrice > 0 ? `
                  <tr>
                    <td style="color: #ffffff; font-size: 15px; padding: 8px;">Package:</td>
                    <td style="color: #ffffff; font-size: 15px; font-weight: bold; text-align: right; padding: 8px;">${formatPrice(packagePrice)}</td>
                  </tr>
                  ` : ""}
                  ${addonsTotal > 0 ? `
                  <tr>
                    <td style="color: #ffffff; font-size: 15px; padding: 8px;">Add-ons:</td>
                    <td style="color: #ffffff; font-size: 15px; font-weight: bold; text-align: right; padding: 8px;">${formatPrice(addonsTotal)}</td>
                  </tr>
                  ` : ""}
                  <tr style="border-top: 2px solid rgba(255, 255, 255, 0.3);">
                    <td style="color: #ffffff; font-size: 18px; font-weight: bold; padding: 12px 8px;">Total:</td>
                    <td style="color: #ffffff; font-size: 24px; font-weight: bold; text-align: right; padding: 12px 8px;">${formatPrice(totalPrice)}</td>
                  </tr>
                </table>
                <p style="margin: 15px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 12px; text-align: center; font-style: italic;">
                  * Final pricing may vary based on specific requirements and site conditions
                </p>
              </div>

              <!-- Contact Information Section -->
              <div style="margin-bottom: 30px;">
                <h2 style="color: #333333; font-size: 20px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #667eea;">📞 Contact Information</h2>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666666; font-weight: bold; width: 40%;">Name:</td>
                    <td style="color: #333333;">${formData.name}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-weight: bold;">Email:</td>
                    <td style="color: #333333;"><a href="mailto:${formData.email}" style="color: #667eea; text-decoration: none;">${formData.email}</a></td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-weight: bold;">Mobile:</td>
                    <td style="color: #333333;"><a href="tel:${formData.mobile}" style="color: #667eea; text-decoration: none;">${formData.mobile}</a></td>
                  </tr>
                  ${formData.pincode ? `
                  <tr>
                    <td style="color: #666666; font-weight: bold;">Pincode:</td>
                    <td style="color: #333333;">${formData.pincode}</td>
                  </tr>
                  ` : ""}
                  <tr>
                    <td style="color: #666666; font-weight: bold;">WhatsApp Updates:</td>
                    <td style="color: #333333;">${formData.whatsappUpdates ? "✅ Yes" : "❌ No"}</td>
                  </tr>
                </table>
              </div>

              <!-- Timestamp -->
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">
                  Submitted on: ${timeString} IST
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                This is an automated notification from Nova Styles Interior Design Consultation Form
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const job = await emailQueue.add("interiorDesignNotification", {
      to: config.adminEmail,
      subject: `New Interior Design Consultation Request - ${formData.floorplan} - ${formData.name}`,
      html: htmlEmail,
    });

    console.log("✅ Interior design notification email job added successfully:", job.id);
    return job;
  } catch (error) {
    console.error("❌ Error adding interior design notification email job:", error);
    throw error;
  }
};

const sendConstructionNotification = async (formData: any) => {
  if (!emailQueue) {
    console.warn(
      "⚠️  Email queue is not available (Redis not running). Email will not be sent."
    );
    throw new Apperror("Email service is currently unavailable", 503);
  }

  if (!config.adminEmail) {
    throw new Apperror("Admin email is not configured", 500);
  }

  const now = new Date();
  const timeString = now.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Format prices in Indian currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const packagePrice = formData.packagePrice || 0;
  const totalPrice = formData.totalPrice || 0;

  // Format requirements list
  const requirementsList = Object.entries(formData.requirements || {})
    .map(([key, value]) => `<tr><td style="color: #666666; font-weight: bold; width: 50%; padding: 8px;">${key}:</td><td style="color: #333333; padding: 8px;">${value}</td></tr>`)
    .join("");

  // Create HTML email template
  const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🏗️ Construction Project Consultation Request</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 20px;">
              <!-- Project Details Section -->
              <div style="margin-bottom: 30px;">
                <h2 style="color: #333333; font-size: 20px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #f59e0b;">📋 Project Details</h2>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666666; font-weight: bold; width: 40%;">Project Type:</td>
                    <td style="color: #333333;">${formData.projectType}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-weight: bold;">Plot Size:</td>
                    <td style="color: #333333;">${formData.plotSize}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-weight: bold;">Built-up Area:</td>
                    <td style="color: #333333;">${formData.builtUpArea} sq ft</td>
                  </tr>
                </table>
              </div>

              <!-- Requirements Section -->
              <div style="margin-bottom: 30px; background-color: #f8f9fa; padding: 20px; border-radius: 6px;">
                <h2 style="color: #333333; font-size: 20px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #f59e0b;">🏠 Construction Requirements</h2>
                <table width="100%" cellpadding="8" cellspacing="0">
                  ${requirementsList}
                </table>
              </div>

              <!-- Selected Package Section -->
              <div style="margin-bottom: 30px; background-color: #f8f9fa; padding: 20px; border-radius: 6px;">
                <h2 style="color: #333333; font-size: 20px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #f59e0b;">📦 Selected Package</h2>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #333333; font-size: 16px; font-weight: bold;">
                      ${formData.selectedPackage}
                    </td>
                    <td style="color: #333333; font-size: 16px; font-weight: bold; text-align: right;">
                      ${formatPrice(packagePrice)}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Total Estimation Section -->
              <div style="margin-bottom: 30px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 25px; border-radius: 8px;">
                <h2 style="color: #ffffff; font-size: 22px; margin: 0 0 20px 0; text-align: center;">💰 Total Estimated Cost</h2>
                <table width="100%" cellpadding="10" cellspacing="0" style="background-color: rgba(255, 255, 255, 0.1); border-radius: 6px;">
                  ${packagePrice > 0 ? `
                  <tr>
                    <td style="color: #ffffff; font-size: 15px; padding: 8px;">Package:</td>
                    <td style="color: #ffffff; font-size: 15px; font-weight: bold; text-align: right; padding: 8px;">${formatPrice(packagePrice)}</td>
                  </tr>
                  ` : ""}
                  <tr style="border-top: 2px solid rgba(255, 255, 255, 0.3);">
                    <td style="color: #ffffff; font-size: 18px; font-weight: bold; padding: 12px 8px;">Total:</td>
                    <td style="color: #ffffff; font-size: 24px; font-weight: bold; text-align: right; padding: 12px 8px;">${formatPrice(totalPrice)}</td>
                  </tr>
                </table>
                <p style="margin: 15px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 12px; text-align: center; font-style: italic;">
                  * Final pricing may vary based on specific requirements and site conditions
                </p>
              </div>

              <!-- Contact Information Section -->
              <div style="margin-bottom: 30px;">
                <h2 style="color: #333333; font-size: 20px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #f59e0b;">📞 Contact Information</h2>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666666; font-weight: bold; width: 40%;">Name:</td>
                    <td style="color: #333333;">${formData.name}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-weight: bold;">Email:</td>
                    <td style="color: #333333;"><a href="mailto:${formData.email}" style="color: #f59e0b; text-decoration: none;">${formData.email}</a></td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-weight: bold;">Mobile:</td>
                    <td style="color: #333333;"><a href="tel:${formData.mobile}" style="color: #f59e0b; text-decoration: none;">${formData.mobile}</a></td>
                  </tr>
                  ${formData.pincode ? `
                  <tr>
                    <td style="color: #666666; font-weight: bold;">Pincode:</td>
                    <td style="color: #333333;">${formData.pincode}</td>
                  </tr>
                  ` : ""}
                  <tr>
                    <td style="color: #666666; font-weight: bold;">WhatsApp Updates:</td>
                    <td style="color: #333333;">${formData.whatsappUpdates ? "✅ Yes" : "❌ No"}</td>
                  </tr>
                </table>
              </div>

              <!-- Timestamp -->
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">
                  Submitted on: ${timeString} IST
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                This is an automated notification from Nova Styles Construction Consultation Form
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const job = await emailQueue.add("constructionNotification", {
      to: config.adminEmail,
      subject: `New Construction Consultation Request - ${formData.projectType} - ${formData.name}`,
      html: htmlEmail,
    });

    console.log("✅ Construction notification email job added successfully:", job.id);
    return job;
  } catch (error) {
    console.error("❌ Error adding construction notification email job:", error);
    throw error;
  }
};

export default {
  createContent,
  getContentBySection,
  updateContent,
  deleteContent,
  getContentById,
  sendInteriorDesignNotification,
  sendConstructionNotification,
};
