import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "@/lib/mongodb";
import Event from "@/models/Event.Model";
import EventRegistration from "@/models/EventRegistration.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import nodemailer from "nodemailer";
import { v2 as cloudinary } from "cloudinary";

const getTicketPrice = (value: unknown) => {
  const price = Number(value || 0);
  return Number.isFinite(price) && price >= 0 ? price : 0;
};

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(file: File, folder: string, publicId: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        overwrite: true,
        resource_type: "auto",
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
    uploadStream.end(buffer);
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const formData = await request.formData();

    const eventId = formData.get("eventId") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const adults = parseInt(formData.get("adults") as string || "0");
    const students = parseInt(formData.get("students") as string || "0");
    const children = parseInt(formData.get("children") as string || "0");
    const elders = parseInt(formData.get("elders") as string || "0");
    const totalAmount = parseFloat(formData.get("totalAmount") as string || "0");
    const specialRequests = formData.get("specialRequests") as string || "";
    const paymentProofFile = formData.get("paymentProof") as File | null;

    if (!eventId || !firstName || !lastName || !email || !phone || adults < 1) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await ConnectDB();

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (event.registrationEnabled === false) {
      return NextResponse.json({ error: "Registration is closed for this event" }, { status: 400 });
    }

    const eventDate = new Date(event.eventdate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (eventDate.getTime() < today.getTime()) {
      return NextResponse.json({ error: "Cannot register for past events" }, { status: 400 });
    }

    const totalSeats = adults + students + children + elders;
    const maximumSeats = Number(event.maximumSeats || 0);
    const registeredSeats = Number(event.registeredSeats || 0);
    if (maximumSeats > 0 && registeredSeats + totalSeats > maximumSeats) {
      return NextResponse.json({ error: "Not enough seats available for this event" }, { status: 400 });
    }

    const needsPayment = totalAmount > 0 && event.paymentCollectionEnabled !== false;

    let paymentProofUrl = "";
    if (needsPayment && paymentProofFile) {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 8);
      const proofId = `PP-${timestamp}-${randomStr}`.toUpperCase();
      paymentProofUrl = await uploadToCloudinary(paymentProofFile, "event-payment-proofs", proofId);
    }

    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    const registrationId = `REG-${timestamp}-${randomStr}`.toUpperCase();

    const registration = new EventRegistration({
      registrationId,
      eventId,
      userId: session?.user?.id || session?.user?.email || email,
      firstName,
      lastName,
      email,
      phone,
      adults,
      students,
      children,
      elders,
      adultPrice: getTicketPrice(event.price),
      studentPrice: getTicketPrice(event.studentPrice),
      totalSeats,
      specialRequests: specialRequests || undefined,
      totalAmount,
      paymentProofUrl: paymentProofUrl || undefined,
      status: needsPayment ? "pending" : "confirmed",
      paymentStatus: needsPayment ? "pending" : "completed",
    });

    await registration.save();

    if (!needsPayment) {
      await Event.findByIdAndUpdate(eventId, {
        $inc: {
          registeredSeats: totalSeats,
          totalRegistrations: 1,
        },
      });
    }

    if (!needsPayment) {
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
    <title>Event Registration Confirmation</title>
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
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
        .registration-id { font-family: monospace; background-color: #f3f4f6; padding: 5px 10px; border-radius: 4px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><div class="logo">PNSB-Norway</div></div>
        <div class="success-banner">Registration Confirmed!</div>
        <p>Dear ${firstName} ${lastName},</p>
        <p>Your registration for <strong>${event.eventname}</strong> has been confirmed.</p>
        <div class="event-details">
            <div class="detail-row"><span class="detail-label">Event:</span><span class="detail-value">${event.eventname}</span></div>
            <div class="detail-row"><span class="detail-label">Date:</span><span class="detail-value">${new Date(event.eventdate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
            ${event.eventtime ? `<div class="detail-row"><span class="detail-label">Time:</span><span class="detail-value">${event.eventtime}</span></div>` : ''}
            ${event.eventvenue ? `<div class="detail-row"><span class="detail-label">Venue:</span><span class="detail-value">${event.eventvenue}</span></div>` : ''}
            <div class="detail-row"><span class="detail-label">Adults:</span><span class="detail-value">${adults}</span></div>
            ${students > 0 ? `<div class="detail-row"><span class="detail-label">Students:</span><span class="detail-value">${students}</span></div>` : ''}
            ${children > 0 ? `<div class="detail-row"><span class="detail-label">Children:</span><span class="detail-value">${children}</span></div>` : ''}
            ${elders > 0 ? `<div class="detail-row"><span class="detail-label">Elderly:</span><span class="detail-value">${elders}</span></div>` : ''}
        </div>
        <div class="footer">
            <p>Registration ID: <span class="registration-id">${registrationId}</span></p>
            <p>© 2024 PNSB-Norway. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

        await transporter.sendMail({
          from: `"PNSB-Norway" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: `Event Registration Confirmed - ${event.eventname}`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error("Error sending registration email:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      registrationId,
      message: needsPayment
        ? "Registration submitted! Your payment is pending verification. You will receive a confirmation email once approved."
        : "Registration successful! Check your email for confirmation.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to process registration" },
      { status: 500 }
    );
  }
}
