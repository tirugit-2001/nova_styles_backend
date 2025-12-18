import { deleteImage, uploadImage } from "../../../config/cloudinary";
import Apperror from "../../../utils/apperror";
import contentRepository from "../repository/content.repository";
import { emailQueue } from "../../../queues/email.queue";
import config from "../../../config/config";
import InteriorEstimation from "../../../models/InteriorEstimation.schema";
import ConstructionEstimation from "../../../models/ConstructionEstimation.schema";
import fs from "fs";
import path from "path";

const escapeHtml = (text?: string) => {
  if (!text) return "";
  return text
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const formatMessage = (text?: string) => {
  if (!text) return "";
  return escapeHtml(text).replace(/\n/g, "<br>");
};

// Helper function to save PDF attachment to filesystem
const saveAttachmentToFile = async (
  attachment: Express.Multer.File,
  estimationId: string,
  type: "interior" | "construction"
): Promise<string> => {
  // Create attachments directory if it doesn't exist
  const attachmentsDir = path.join(process.cwd(), "attachments", type);
  if (!fs.existsSync(attachmentsDir)) {
    fs.mkdirSync(attachmentsDir, { recursive: true });
  }

  // Generate unique filename: timestamp-estimationId-originalname
  const timestamp = Date.now();
  const sanitizedOriginalName = (attachment.originalname || "attachment.pdf")
    .replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileName = `${timestamp}-${estimationId}-${sanitizedOriginalName}`;
  const filePath = path.join(attachmentsDir, fileName);

  // Write file to disk
  fs.writeFileSync(filePath, attachment.buffer);

  // Return relative path for storage in database
  return path.join("attachments", type, fileName);
};

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

const sendInteriorDesignNotification = async (
  formData: any,
  attachment?: Express.Multer.File
) => {
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

  const isCustomizedInterior = formData.interiorType === "customized interior" || formData.interiorType === "customised-premium";
  const packagePrice = formData.packagePrice || 0;
  const addonsTotal = formData.addonsTotal || 0;
  const totalPrice = formData.totalPrice || 0;

  // Format addons list if any
  const addonsList =
    formData.addons && formData.addons.length > 0
      ? formData.addons
          .map((addon: string) => `<li>${addon}</li>`)
          .join("")
      : "<li>None selected</li>";

  const clientNotes =
    formData.message ||
    formData.suggestions ||
    formData.additionalNotes ||
    "";

  const attachmentNotice = attachment
    ? `<div style="margin-bottom: 25px; background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 6px;">
        <p style="margin: 0; color: #065f46; font-size: 14px;">
          📎 Client uploaded a project brief (PDF): <strong>${
            attachment.originalname || "project-brief.pdf"
          }</strong>
        </p>
      </div>`
    : "";

  let htmlEmail: string;
  let emailSubject: string;

  if (isCustomizedInterior) {
    // Customized Interior Email Template with Premium Styling
    emailSubject = `✨ Customized Interior Request - ${formData.name}`;
    htmlEmail = `
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
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.15);">
          <!-- Premium Header with Badge -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%); padding: 40px 20px; text-align: center; position: relative;">
              <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 20px; padding: 8px 20px; display: inline-block; margin-bottom: 15px;">
                <span style="color: #ffffff; font-size: 14px; font-weight: bold; letter-spacing: 1px;">⭐ PREMIUM REQUEST ⭐</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">✨ Customized Interior Design Request</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.95); font-size: 16px; font-weight: 500;">Tailored to Your Unique Vision</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 20px;">
              <!-- Special Message Section - Prominently Displayed -->
              ${formData.message ? `
              <div style="margin-bottom: 30px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 5px solid #f59e0b; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <span style="font-size: 24px; margin-right: 10px;">💬</span>
                  <h2 style="color: #92400e; font-size: 22px; margin: 0; font-weight: bold;">Client's Custom Requirements</h2>
                </div>
                <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; border: 2px solid #f59e0b; margin-top: 15px;">
                  <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${formatMessage(formData.message)}</p>
                </div>
              </div>
              ` : ""}

              <!-- Interior Type Badge -->
              <div style="margin-bottom: 30px; text-align: center;">
                <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; padding: 12px 30px; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);">
                  🎨 Customized Interior Design
                </div>
              </div>

              <!-- Contact Information Section -->
              <div style="margin-bottom: 30px; background-color: #f8f9fa; padding: 25px; border-radius: 8px; border: 2px solid #f59e0b;">
                <h2 style="color: #92400e; font-size: 20px; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 3px solid #f59e0b;">📞 Contact Information</h2>
                <table width="100%" cellpadding="10" cellspacing="0">
                  <tr>
                    <td style="color: #666666; font-weight: bold; width: 40%; font-size: 15px;">Name:</td>
                    <td style="color: #333333; font-size: 16px; font-weight: 600;">${formData.name}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-weight: bold;">Email:</td>
                    <td style="color: #333333;"><a href="mailto:${formData.email}" style="color: #d97706; text-decoration: none; font-weight: 600;">${formData.email}</a></td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-weight: bold;">Mobile:</td>
                    <td style="color: #333333;"><a href="tel:${formData.mobile}" style="color: #d97706; text-decoration: none; font-weight: 600; font-size: 16px;">${formData.mobile}</a></td>
                  </tr>
                  ${formData.pincode ? `
                  <tr>
                    <td style="color: #666666; font-weight: bold;">Pincode:</td>
                    <td style="color: #333333; font-size: 16px;">${formData.pincode}</td>
                  </tr>
                  ` : ""}
                  <tr>
                    <td style="color: #666666; font-weight: bold;">WhatsApp Updates:</td>
                    <td style="color: #333333; font-size: 16px;">${formData.whatsappUpdates ? "✅ Yes" : "❌ No"}</td>
                  </tr>
                </table>
              </div>

              ${attachmentNotice}

              <!-- Call to Action Box -->
              <div style="margin-bottom: 30px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 25px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: bold;">
                  🎯 This is a premium customized request - Please prioritize follow-up!
                </p>
              </div>

              <!-- Timestamp -->
              <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #f59e0b;">
                <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">
                  Submitted on: ${timeString} IST
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; text-align: center; border-top: 2px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 600;">
                ⭐ Premium Customized Interior Request - Nova Styles ⭐
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
  } else {
    // Modular Interior Email Template (Existing)
    emailSubject = `New Modular Interior Design Request - ${formData.floorplan || "N/A"} - ${formData.name}`;
    htmlEmail = `
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
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🏠 Modular Interior Design Consultation Request</h1>
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
                    <td style="color: #333333;">${formData.floorplan || "N/A"}</td>
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
                      ${formData.selectedPackage || "N/A"}
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

              ${
                clientNotes
                  ? `
              <!-- Message Section (if provided) -->
              <div style="margin-bottom: 30px; background-color: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #667eea;">
                <h2 style="color: #333333; font-size: 18px; margin: 0 0 10px 0;">💬 Additional Message:</h2>
                <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${formatMessage(clientNotes)}</p>
              </div>
              `
                  : ""
              }

              ${attachmentNotice}

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
  }

  try {
    const jobData: Record<string, any> = {
      to: config.adminEmail,
      subject: emailSubject,
      html: htmlEmail,
    };

    if (attachment) {
      jobData.attachments = [
        {
          filename: attachment.originalname || "project-brief.pdf",
          content: attachment.buffer,
          contentType: attachment.mimetype || "application/pdf",
        },
      ];
    }

    const job = await emailQueue.add("interiorDesignNotification", jobData);

    console.log("✅ Interior design notification email job added successfully:", job.id);

    // Save to database after successfully queuing email
    try {
      const estimationData: any = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        pincode: formData.pincode,
        whatsappUpdates: formData.whatsappUpdates || false,
        interiorType: formData.interiorType,
        floorplan: formData.floorplan,
        purpose: formData.purpose,
        selectedPackage: formData.selectedPackage,
        addons: formData.addons || [],
        packagePrice: formData.packagePrice,
        addonsTotal: formData.addonsTotal,
        totalPrice: formData.totalPrice,
        message: formData.message,
        hasAttachment: !!attachment,
        attachmentFilename: attachment ? (attachment.originalname || "project-brief.pdf") : undefined,
      };

      // Create estimation first to get ID
      const createdEstimation = await InteriorEstimation.create(estimationData);
      
      // Save attachment to filesystem if present
      if (attachment) {
        try {
          const attachmentFilePath = await saveAttachmentToFile(
            attachment,
            String(createdEstimation._id),
            "interior"
          );
          
          // Update estimation with file path
          createdEstimation.attachmentFilePath = attachmentFilePath;
          await createdEstimation.save();
          
          console.log("✅ Interior estimation saved to database with attachment");
        } catch (fileError) {
          console.error("❌ Error saving attachment file:", fileError);
          // Estimation is already saved, just without file path
        }
      } else {
        console.log("✅ Interior estimation saved to database");
      }
    } catch (dbError) {
      // Log error but don't fail the request - email was already queued
      console.error("❌ Error saving interior estimation to database:", dbError);
    }

    return job;
  } catch (error) {
    console.error("❌ Error adding interior design notification email job:", error);
    throw error;
  }
};

const sendConstructionNotification = async (
  formData: any,
  attachment?: Express.Multer.File
) => {
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
  const totalPrice = formData.totalPrice || formData.estimatedPrice || 0;

  const projectDetailsRows =
    [
      formData.projectType
        ? `<tr>
            <td style="color: #666666; font-weight: bold; width: 40%;">Project Type:</td>
            <td style="color: #333333;">${formData.projectType}</td>
          </tr>`
        : "",
      formData.buildingType
        ? `<tr>
            <td style="color: #666666; font-weight: bold; width: 40%;">Building Type:</td>
            <td style="color: #333333;">${formData.buildingType}</td>
          </tr>`
        : "",
      formData.plotSize
        ? `<tr>
            <td style="color: #666666; font-weight: bold; width: 40%;">Plot Size:</td>
            <td style="color: #333333;">${formData.plotSize}</td>
          </tr>`
        : "",
      formData.builtUpArea
        ? `<tr>
            <td style="color: #666666; font-weight: bold; width: 40%;">Built-up Area:</td>
            <td style="color: #333333;">${formData.builtUpArea}</td>
          </tr>`
        : "",
      formData.sqft
        ? `<tr>
            <td style="color: #666666; font-weight: bold; width: 40%;">Project Size:</td>
            <td style="color: #333333;">${formData.sqft} sq ft</td>
          </tr>`
        : "",
      formData.ratePerSqft
        ? `<tr>
            <td style="color: #666666; font-weight: bold; width: 40%;">Rate / sq ft:</td>
            <td style="color: #333333;">${formatPrice(formData.ratePerSqft)}</td>
          </tr>`
        : "",
    ]
      .filter(Boolean)
      .join("") ||
    `<tr>
      <td style="color: #666666; font-weight: bold; width: 40%;">Project Type:</td>
      <td style="color: #333333;">Not specified</td>
    </tr>`;

  const requirementsEntries =
    formData.requirements && Object.keys(formData.requirements).length > 0
      ? Object.entries(formData.requirements)
          .map(
            ([key, value]) => `<tr>
          <td style="color: #666666; font-weight: bold; width: 50%; padding: 8px;">${key}:</td>
          <td style="color: #333333; padding: 8px;">${value}</td>
        </tr>`
          )
          .join("")
      : `<tr>
          <td colspan="2" style="color: #666666; padding: 8px; font-style: italic;">
            No detailed requirements were provided.
          </td>
        </tr>`;

  const clientNotes = formData.suggestions || formData.message;
  const {
    selectedPackage,
    ratePerSqft,
    buildingType,
    sqft,
    estimatedPrice,
    name,
    email,
    mobile,
    pincode,
    whatsappUpdates,
    suggestions,
    constructionType,
  } = formData;

  const isPremiumConstruction = constructionType === "customised-premium";

  const attachmentNotice = attachment
    ? `<div style="margin-bottom: 25px; background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 6px;">
        <p style="margin: 0; color: #065f46; font-size: 14px;">
          📎 Client uploaded a project brief (PDF): <strong>${attachment.originalname || "project-brief.pdf"}</strong>
        </p>
      </div>`
    : "";

  const premiumSnapshotRows =
    [
      buildingType
        ? `<tr>
            <td style="color: #666666; font-weight: bold; width: 45%;">Preferred Build:</td>
            <td style="color: #333333;">${buildingType}</td>
          </tr>`
        : "",
      typeof sqft === "number" && sqft > 0
        ? `<tr>
            <td style="color: #666666; font-weight: bold;">Approx. Size:</td>
            <td style="color: #333333;">${sqft.toLocaleString("en-IN")} sq.ft</td>
          </tr>`
        : "",
      selectedPackage
        ? `<tr>
            <td style="color: #666666; font-weight: bold;">Interested Package:</td>
            <td style="color: #333333;">${selectedPackage}</td>
          </tr>`
        : "",
      typeof ratePerSqft === "number" && ratePerSqft > 0
        ? `<tr>
            <td style="color: #666666; font-weight: bold;">Indicative Rate:</td>
            <td style="color: #333333;">${formatPrice(ratePerSqft)} / sq.ft</td>
          </tr>`
        : "",
      typeof estimatedPrice === "number" && estimatedPrice > 0
        ? `<tr>
            <td style="color: #666666; font-weight: bold;">Budget Estimate:</td>
            <td style="color: #333333; font-weight: 600;">${formatPrice(estimatedPrice)}</td>
          </tr>`
        : "",
    ]
      .filter(Boolean)
      .join("") ||
    `<tr>
        <td style="color: #666666; font-weight: bold; width: 45%;">Project Snapshot:</td>
        <td style="color: #333333;">Details not provided</td>
      </tr>`;

  const premiumNotesSection =
    suggestions || clientNotes
      ? `
        <div style="margin-bottom: 30px; background: #fff7ed; border-left: 5px solid #f97316; padding: 20px; border-radius: 8px;">
          <h2 style="color: #9a3412; font-size: 18px; margin: 0 0 10px 0;">📝 Client Brief</h2>
          <p style="margin: 0; color: #4a5568; line-height: 1.6;">${formatMessage(
            suggestions || clientNotes
          )}</p>
        </div>
      `
      : "";

  let htmlEmail: string;
  let emailSubject: string;

  if (isPremiumConstruction) {
    emailSubject = `⭐ Premium Construction Request - ${name}`;
    htmlEmail = `
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
        <table width="620" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.12);">
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 40%, #b45309 100%); padding: 40px 30px; text-align: center;">
              <div style="display: inline-block; padding: 6px 16px; background-color: rgba(255,255,255,0.2); border-radius: 999px; font-size: 13px; letter-spacing: 1px; color: #fff; margin-bottom: 12px;">PREMIUM CONSTRUCTION</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 30px; font-weight: 700;">High-Priority Consultation Request</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 10px 0 0 0; font-size: 16px;">Client opted for the Customised Premium Construction flow</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 30px;">
              <div style="margin-bottom: 28px; background: #fef3c7; border: 1px solid #facc15; border-radius: 10px; padding: 20px;">
                <h2 style="margin: 0 0 8px 0; color: #92400e; font-size: 20px;">Client Summary</h2>
                <p style="margin: 0; color: #7c2d12; font-size: 15px;">Please prioritize outreach within 1 business hour.</p>
              </div>

              <div style="margin-bottom: 30px;">
                <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 12px 0;">📞 Contact Information</h3>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #6b7280; font-weight: bold; width: 45%;">Name</td>
                    <td style="color: #111827; font-weight: 600;">${name}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-weight: bold;">Email</td>
                    <td style="color: #2563eb;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-weight: bold;">Mobile</td>
                    <td style="color: #111827; font-weight: 600;"><a href="tel:${mobile}" style="color: inherit; text-decoration: none;">${mobile}</a></td>
                  </tr>
                  ${
                    pincode
                      ? `<tr>
                    <td style="color: #6b7280; font-weight: bold;">Pincode</td>
                    <td style="color: #111827;">${pincode}</td>
                  </tr>`
                      : ""
                  }
                  <tr>
                    <td style="color: #6b7280; font-weight: bold;">WhatsApp Updates</td>
                    <td style="color: #111827;">${whatsappUpdates ? "✅ Yes" : "❌ No"}</td>
                  </tr>
                </table>
              </div>

              <div style="margin-bottom: 30px;">
                <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 12px 0;">🏗️ Project Snapshot</h3>
                <table width="100%" cellpadding="8" cellspacing="0" style="border: 1px solid #f3f4f6; border-radius: 8px;">
                  ${premiumSnapshotRows}
                </table>
              </div>

              ${premiumNotesSection}

              ${attachmentNotice}

              <div style="margin-bottom: 25px; background: linear-gradient(135deg, #fbbf24, #f97316); border-radius: 10px; padding: 20px; color: #fff; text-align: center;">
                <p style="margin: 0; font-size: 16px; font-weight: 600;">⭐ Premium lead alert: This client expects concierge-level guidance.</p>
              </div>

              <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; text-align: center;">
                <p style="margin: 0; color: #9ca3af; font-size: 12px;">Submitted on ${timeString} IST</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  } else {
    emailSubject = `New Construction Consultation Request - ${
      formData.projectType || formData.buildingType || "Construction"
    } - ${formData.name}`;
    htmlEmail = `
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
                  ${projectDetailsRows}
                </table>
              </div>

              <!-- Requirements Section -->
              <div style="margin-bottom: 30px; background-color: #f8f9fa; padding: 20px; border-radius: 6px;">
                <h2 style="color: #333333; font-size: 20px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #f59e0b;">🏠 Construction Requirements</h2>
                <table width="100%" cellpadding="8" cellspacing="0">
                  ${requirementsEntries}
                </table>
              </div>

              <!-- Selected Package Section -->
              <div style="margin-bottom: 30px; background-color: #f8f9fa; padding: 20px; border-radius: 6px;">
                <h2 style="color: #333333; font-size: 20px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #f59e0b;">📦 Selected Package</h2>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #333333; font-size: 16px; font-weight: bold;">
                      ${selectedPackage}
                    </td>
                    <td style="color: #333333; font-size: 16px; font-weight: bold; text-align: right;">
                      ${formatPrice(ratePerSqft || 0)} per sq.ft
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Total Estimation Section -->
              <!-- Project Snapshot -->
              <div style="margin-bottom: 30px;">
                <h2 style="color: #333333; font-size: 20px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #f59e0b;">📋 Project Snapshot</h2>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666666; font-weight: bold; width: 40%;">Building Type:</td>
                    <td style="color: #333333;">${buildingType}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-weight: bold;">Built-up Area:</td>
                    <td style="color: #333333;">${sqft?.toLocaleString("en-IN")} sq.ft</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-weight: bold;">Rate / Sq.ft:</td>
                    <td style="color: #333333;">${formatPrice(ratePerSqft || 0)}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-weight: bold;">Estimated Cost:</td>
                    <td style="color: #333333; font-weight: bold;">${formatPrice(estimatedPrice || 0)}</td>
                  </tr>
                </table>
              </div>

              <!-- Contact Information Section -->
              <div style="margin-bottom: 30px;">
                <h2 style="color: #333333; font-size: 20px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #f59e0b;">📞 Contact Information</h2>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666666; font-weight: bold; width: 40%;">Name:</td>
                    <td style="color: #333333;">${name}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-weight: bold;">Email:</td>
                    <td style="color: #333333;"><a href="mailto:${email}" style="color: #f59e0b; text-decoration: none;">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-weight: bold;">Mobile:</td>
                    <td style="color: #333333;"><a href="tel:${mobile}" style="color: #f59e0b; text-decoration: none;">${mobile}</a></td>
                  </tr>
                  ${
                    pincode
                      ? `
                  <tr>
                    <td style="color: #666666; font-weight: bold;">Pincode:</td>
                    <td style="color: #333333;">${pincode}</td>
                  </tr>
                  `
                      : ""
                  }
                  <tr>
                    <td style="color: #666666; font-weight: bold;">WhatsApp Updates:</td>
                    <td style="color: #333333;">${whatsappUpdates ? "✅ Yes" : "❌ No"}</td>
                  </tr>
                </table>
              </div>

              ${
                suggestions
                  ? `
              <!-- Additional Notes -->
              <div style="margin-bottom: 30px; background-color: #fff8e5; padding: 20px; border-radius: 6px;">
                <h2 style="color: #d97706; font-size: 18px; margin: 0 0 10px 0;">📝 Customer Notes</h2>
                <p style="color: #333333; margin: 0;">${suggestions}</p>
              </div>
              `
                  : ""
              }

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
  }

  try {
    const jobData: Record<string, any> = {
      to: config.adminEmail,
      subject: emailSubject,
      html: htmlEmail,
    };

    if (attachment) {
      jobData.attachments = [
        {
          filename: attachment.originalname || "project-brief.pdf",
          content: attachment.buffer,
          contentType: "application/pdf",
        },
      ];
    }

    const job = await emailQueue.add("constructionNotification", jobData);

    console.log("✅ Construction notification email job added successfully:", job.id);

    // Save to database after successfully queuing email
    try {
      const estimationData: any = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        pincode: formData.pincode,
        whatsappUpdates: formData.whatsappUpdates || false,
        projectType: formData.projectType,
        buildingType: formData.buildingType,
        plotSize: formData.plotSize,
        builtUpArea: formData.builtUpArea,
        sqft: formData.sqft,
        ratePerSqft: formData.ratePerSqft,
        selectedPackage: formData.selectedPackage,
        packagePrice: formData.packagePrice,
        totalPrice: formData.totalPrice || formData.estimatedPrice,
        estimatedPrice: formData.estimatedPrice,
        requirements: formData.requirements,
        message: formData.message,
        suggestions: formData.suggestions,
        constructionType: formData.constructionType,
        hasAttachment: !!attachment,
        attachmentFilename: attachment ? (attachment.originalname || "project-brief.pdf") : undefined,
      };

      // Create estimation first to get ID
      const createdEstimation = await ConstructionEstimation.create(estimationData);
      
      // Save attachment to filesystem if present
      if (attachment) {
        try {
          const attachmentFilePath = await saveAttachmentToFile(
            attachment,
            String(createdEstimation._id),
            "construction"
          );
          
          // Update estimation with file path
          createdEstimation.attachmentFilePath = attachmentFilePath;
          await createdEstimation.save();
          
          console.log("✅ Construction estimation saved to database with attachment");
        } catch (fileError) {
          console.error("❌ Error saving attachment file:", fileError);
          // Estimation is already saved, just without file path
        }
      } else {
        console.log("✅ Construction estimation saved to database");
      }
    } catch (dbError) {
      // Log error but don't fail the request - email was already queued
      console.error("❌ Error saving construction estimation to database:", dbError);
    }

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
