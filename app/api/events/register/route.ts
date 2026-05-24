import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "@/lib/mongodb";
import Event from "@/models/Event.Model";
import EventRegistration from "@/models/EventRegistration.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import QRCode from "qrcode";
import nodemailer from "nodemailer";
import { v2 as cloudinary } from "cloudinary";

interface RegistrationData {
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  adults: number;
  children: number;
  specialRequests?: string;
  totalAmount: number;
}

const getTicketPrice = (value: unknown) => {
  const price = Number(value || 0);
  return Number.isFinite(price) && price >= 0 ? price : 0;
};

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadQrCodeToCloudinary(qrCodeDataURL: string, registrationId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      qrCodeDataURL,
      {
        folder: "event-registration-qr-codes",
        public_id: registrationId,
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log("Session in API route:", session);

    const body: RegistrationData = await request.json();
    const { eventId, firstName, lastName, email, phone, adults, children, specialRequests } = body;

    // Validate required fields
    if (!eventId || !firstName || !lastName || !email || !phone || adults === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await ConnectDB();

    // Check if event exists and is valid for registration
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (event.registrationEnabled === false) {
      return NextResponse.json({ error: "Registration is closed for this event" }, { status: 400 });
    }

    // Check if event date is in the past
    const eventDate = new Date(event.eventdate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate.getTime() < today.getTime()) {
      return NextResponse.json({ error: "Cannot register for past events" }, { status: 400 });
    }

    const adultCount = Number(adults || 0);
    const childCount = Number(children || 0);
    const totalSeats = adultCount + childCount;
    const maximumSeats = Number(event.maximumSeats || 0);
    const registeredSeats = Number(event.registeredSeats || 0);
    if (adultCount < 1 || childCount < 0) {
      return NextResponse.json({ error: "Invalid attendee count" }, { status: 400 });
    }
    if (maximumSeats > 0 && registeredSeats + totalSeats > maximumSeats) {
      return NextResponse.json({ error: "Not enough seats available for this event" }, { status: 400 });
    }
    const adultPrice = event.paymentCollectionEnabled === false ? 0 : getTicketPrice(event.price);
    const childPrice = event.paymentCollectionEnabled === false ? 0 : getTicketPrice(event.childPrice);
    const totalAmount = adultCount * adultPrice + childCount * childPrice;

    // Generate unique registration ID
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    const registrationId = `REG-${timestamp}-${randomStr}`.toUpperCase();
    
    // Create QR code data - simplify to just registration ID to avoid QR code issues
    const qrData = registrationId;

    // Generate QR code - use PNG for better email client compatibility
    let qrCodeDataURL = "";
    let qrCodeUrl = "";
    try {
      qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      console.log('QR code generated successfully (PNG), length:', qrCodeDataURL.length);
      qrCodeUrl = await uploadQrCodeToCloudinary(qrCodeDataURL, registrationId);
      console.log('QR code uploaded to Cloudinary:', qrCodeUrl);
    } catch (error) {
      console.error('QR code generation or upload failed:', error);
      return NextResponse.json({ error: "Failed to generate registration QR code" }, { status: 500 });
    }

    // Create registration record
    const registration = new EventRegistration({
      registrationId,
      eventId,
      userId: session?.user?.id || session?.user?.email || email,
      firstName,
      lastName,
      email,
      phone,
      adults: adultCount,
      children: childCount,
      adultPrice,
      childPrice,
      totalSeats,
      specialRequests,
      totalAmount,
      qrCode: qrCodeUrl,
      status: "confirmed",
      paymentStatus: "pending",
    });

    // Save registration to database
    await registration.save();
    await Event.findByIdAndUpdate(eventId, {
      $inc: {
        registeredSeats: totalSeats,
        totalRegistrations: 1,
        totalCollection: totalAmount,
      },
    });
    
    // Send email with QR code and receipt
    try {
      console.log('Attempting to send email to:', email);

      // Create transporter using the working Gmail configuration
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
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
        }
        .success-banner {
            background-color: #10b981;
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 30px;
            font-size: 18px;
            font-weight: bold;
        }
        .event-details {
            background-color: #f8fafc;
            padding: 20px;
            border-left: 4px solid #2563eb;
            margin: 20px 0;
        }
        .event-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #1f2937;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
        }
        .detail-label {
            font-weight: bold;
            color: #6b7280;
        }
        .detail-value {
            color: #1f2937;
        }
        .attendees-section {
            background-color: #fef3c7;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .qr-section {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            border: 2px dashed #2563eb;
            border-radius: 8px;
        }
        .qr-code {
            max-width: 200px;
            margin: 20px auto;
            display: block;
        }
        .qr-instructions {
            font-size: 14px;
            color: #6b7280;
            margin-top: 15px;
        }
        .total-section {
            background-color: #1f2937;
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 18px;
        }
        .total-amount {
            font-weight: bold;
            font-size: 24px;
            color: #10b981;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
        }
        .registration-id {
            font-family: monospace;
            background-color: #f3f4f6;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">PNSB-Norway</div>
        </div>
        
        <div class="success-banner">
            🎉 Registration Successful!
        </div>
        
        <p>Dear ${firstName} ${lastName},</p>
        
        <p>Thank you for registering for our event. Your registration has been confirmed.</p>
        
        <div class="event-details">
            <div class="event-title">${event.eventname}</div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${new Date(event.eventdate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            ${event.eventtime ? `
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${event.eventtime}</span>
            </div>` : ''}
            ${event.eventvenue ? `
            <div class="detail-row">
                <span class="detail-label">Venue:</span>
                <span class="detail-value">${event.eventvenue}</span>
            </div>` : ''}
        </div>
        
        <div class="attendees-section">
            <h3>Attendees</h3>
            <div class="detail-row">
                <span class="detail-label">Adults:</span>
                <span class="detail-value">${adults}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Children:</span>
                <span class="detail-value">${children}</span>
            </div>
        </div>
        
        <div class="total-section">
            <div class="total-row">
                <span>Total Amount:</span>
                <span class="total-amount">NOK ${totalAmount}</span>
            </div>
        </div>
        
        ${qrCodeUrl ? `
        <div class="qr-section">
            <h3>Your Entry QR Code</h3>
            <p class="qr-instructions">Please present this QR code at the event entrance for quick check-in</p>
            <img src="${qrCodeUrl}" alt="Registration QR Code" class="qr-code">
            <div class="qr-instructions">
                <strong>Registration ID:</strong> <span class="registration-id">${registrationId}</span>
            </div>
        </div>` : `
        <div class="qr-section">
            <h3>Your Entry QR Code</h3>
            <p class="qr-instructions">Please present this registration ID at the event entrance for check-in</p>
            <div class="qr-instructions">
                <strong>Registration ID:</strong> <span class="registration-id">${registrationId}</span>
            </div>
        </div>`}
        
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
            <p>This email serves as your official registration receipt.</p>
            <p>© 2024 PNSB-Norway. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
      `;

      const mailOptions = {
        from: `"PNSB-Norway" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Event Registration Confirmation - ${event.eventname}`,
        html: emailHtml,
      };

      await transporter.sendMail(mailOptions);
      console.log('Registration email sent successfully to:', email);
    } catch (emailError) {
      console.error('Error sending registration email:', emailError);
    }

    return NextResponse.json({
      success: true,
      registrationId,
      qrCode: qrCodeUrl,
      message: "Registration successful! Check your email for confirmation and QR code."
    });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to process registration" },
      { status: 500 }
    );
  }
}
