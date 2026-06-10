import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "@/lib/mongodb";
import Event from "@/models/Event.Model";
import EventRegistration from "@/models/EventRegistration.Model";
import FinancialTransaction from "@/models/FinancialTransaction.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import QRCode from "qrcode";
import nodemailer from "nodemailer";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadToCloudinary(base64Data: string, folder: string, publicId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      base64Data,
      {
        folder,
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result?.secure_url) {
          reject(new Error("Cloudinary upload did not return a secure URL"));
          return;
        }
        resolve(result.secure_url);
      }
    );
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Use 'approve' or 'reject'." }, { status: 400 });
    }

    await ConnectDB();

    const registration = await EventRegistration.findById(id);
    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    if (registration.status !== "pending") {
      return NextResponse.json({ error: "Registration is not in pending state" }, { status: 400 });
    }

    if (action === "reject") {
      registration.status = "cancelled";
      registration.paymentStatus = "failed";
      await registration.save();

      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASS,
          },
        });

        const event = await Event.findById(registration.eventId);
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Registration Rejected</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
        .container { background-color: white; padding: 30px; border-radius: 10px; }
        .header { text-align: center; border-bottom: 3px solid #ef4444; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .rejected-banner { background-color: #ef4444; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 30px; font-size: 18px; font-weight: bold; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><div class="logo">PNSB-Norway</div></div>
        <div class="rejected-banner">Registration Rejected</div>
        <p>Dear ${registration.firstName} ${registration.lastName},</p>
        <p>We regret to inform you that your registration for <strong>${event?.eventname || "the event"}</strong> could not be confirmed at this time.</p>
        <p>This may be due to issues with your payment verification. Please contact us if you have any questions.</p>
        <div class="footer"><p>© 2024 PNSB-Norway. All rights reserved.</p></div>
    </div>
</body>
</html>`;

        await transporter.sendMail({
          from: `"PNSB-Norway" <${process.env.EMAIL_USER}>`,
          to: registration.email,
          subject: "Registration Rejected",
          html: emailHtml,
        });
      } catch (emailError) {
        console.error("Error sending rejection email:", emailError);
      }

      return NextResponse.json({ success: true, message: "Registration rejected" });
    }

    // Approve flow
    const qrData = registration.registrationId;
    let qrCodeDataURL = "";
    let qrCodeUrl = "";

    try {
      qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: "H",
        color: { dark: "#000000", light: "#FFFFFF" },
      });
      qrCodeUrl = await uploadToCloudinary(qrCodeDataURL, "event-registration-qr-codes", registration.registrationId);
    } catch (error) {
      console.error("QR code generation or upload failed:", error);
      return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
    }

    registration.qrCode = qrCodeUrl;
    registration.status = "confirmed";
    registration.paymentStatus = "completed";
    await registration.save();

    const totalSeats = (registration.adults || 0) + (registration.students || 0) + (registration.children || 0) + (registration.elders || 0);
    const event = await Event.findById(registration.eventId);
    if (event) {
      await Event.findByIdAndUpdate(registration.eventId, {
        $inc: {
          registeredSeats: totalSeats,
          totalRegistrations: 1,
          totalCollection: registration.totalAmount || 0,
        },
      });
    }

    if (registration.totalAmount > 0) {
      try {
        const attendeesDesc = `${registration.adults} adult(s)${registration.students > 0 ? `, ${registration.students} student(s)` : ""}${registration.children > 0 ? `, ${registration.children} child(ren)` : ""}${registration.elders > 0 ? `, ${registration.elders} elderly` : ""}`;
        const financialTransaction = new FinancialTransaction({
          type: "income",
          category: "event revenue",
          subcategory: "ticket sales",
          amount: registration.totalAmount,
          description: `Event registration for ${event?.eventname || "Unknown Event"} - ${attendeesDesc}`,
          date: new Date(),
          paymentMethod: "vipps",
          referenceNumber: registration.registrationId,
          relatedTo: "event",
          relatedId: registration.eventId,
          eventId: registration.eventId,
          status: "verified",
          verifiedBy: session.user.email || "system",
          verifiedAt: new Date(),
          notes: `Registration ID: ${registration.registrationId}, Attendees: ${registration.firstName} ${registration.lastName} (${registration.email})`,
          tags: ["event-registration", "ticket-sales", event?.eventname?.toLowerCase().replace(/\s+/g, "-") || "event"],
          createdBy: session.user.email || "system@pnsbnorway.org",
        });
        await financialTransaction.save();
      } catch (transactionError) {
        console.error("Error creating financial transaction:", transactionError);
      }
    }

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASS,
        },
      });

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Confirmed - Entry QR Code</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
        .container { background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .success-banner { background-color: #10b981; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 30px; font-size: 18px; font-weight: bold; }
        .event-details { background-color: #f8fafc; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 5px 0; }
        .detail-label { font-weight: bold; color: #6b7280; }
        .detail-value { color: #1f2937; }
        .attendees-section { background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .qr-section { text-align: center; margin: 30px 0; padding: 20px; border: 2px dashed #2563eb; border-radius: 8px; }
        .qr-code { max-width: 200px; margin: 20px auto; display: block; }
        .qr-instructions { font-size: 14px; color: #6b7280; margin-top: 15px; }
        .total-section { background-color: #1f2937; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .total-amount { font-weight: bold; font-size: 24px; color: #10b981; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
        .registration-id { font-family: monospace; background-color: #f3f4f6; padding: 5px 10px; border-radius: 4px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><div class="logo">PNSB-Norway</div></div>
        <div class="success-banner">Payment Verified - Registration Confirmed!</div>
        <p>Dear ${registration.firstName} ${registration.lastName},</p>
        <p>Great news! Your payment has been verified and your registration for <strong>${event?.eventname || "the event"}</strong> is now confirmed.</p>
        <div class="event-details">
            <div class="detail-row"><span class="detail-label">Event:</span><span class="detail-value">${event?.eventname || "N/A"}</span></div>
            <div class="detail-row"><span class="detail-label">Date:</span><span class="detail-value">${event?.eventdate ? new Date(event.eventdate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"}</span></div>
            ${event?.eventtime ? `<div class="detail-row"><span class="detail-label">Time:</span><span class="detail-value">${event.eventtime}</span></div>` : ''}
            ${event?.eventvenue ? `<div class="detail-row"><span class="detail-label">Venue:</span><span class="detail-value">${event.eventvenue}</span></div>` : ''}
        </div>
        <div class="attendees-section">
            <h3>Attendees</h3>
            <div class="detail-row"><span class="detail-label">Adults:</span><span class="detail-value">${registration.adults}</span></div>
            ${registration.children > 0 ? `<div class="detail-row"><span class="detail-label">Children:</span><span class="detail-value">${registration.children}</span></div>` : ''}
            ${registration.students > 0 ? `<div class="detail-row"><span class="detail-label">Students:</span><span class="detail-value">${registration.students}</span></div>` : ''}
            ${registration.elders > 0 ? `<div class="detail-row"><span class="detail-label">Elderly:</span><span class="detail-value">${registration.elders}</span></div>` : ''}
        </div>
        ${registration.totalAmount > 0 ? `
        <div class="total-section">
            <div style="text-align: center;">
                <div style="font-size: 14px; margin-bottom: 5px;">Total Amount Paid</div>
                <div class="total-amount">NOK ${registration.totalAmount}</div>
            </div>
        </div>` : ''}
        <div class="qr-section">
            <h3>Your Entry QR Code</h3>
            <p class="qr-instructions">Please present this QR code at the event entrance for quick check-in</p>
            <img src="${qrCodeUrl}" alt="Entry QR Code" class="qr-code">
            <div class="qr-instructions"><strong>Registration ID:</strong> <span class="registration-id">${registration.registrationId}</span></div>
        </div>
        <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Important Information:</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Please arrive 15 minutes before the event start time</li>
                <li>Bring this QR code (printed or on your mobile device)</li>
                <li>Keep this email for your records</li>
                <li>Contact us if you need to make any changes to your registration</li>
            </ul>
        </div>
        <div class="footer">
            <p>© 2024 PNSB-Norway. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

      await transporter.sendMail({
        from: `"PNSB-Norway" <${process.env.EMAIL_USER}>`,
        to: registration.email,
        subject: `Registration Confirmed - ${event?.eventname || "Event"}`,
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Registration approved and confirmed",
    });
  } catch (error) {
    console.error("Approval error:", error);
    return NextResponse.json(
      { error: "Failed to process registration" },
      { status: 500 }
    );
  }
}
