import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "@/lib/mongodb";
import EventRegistration from "@/models/EventRegistration.Model";
import Event from "@/models/Event.Model";

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();

    const { qrData } = await request.json();

    if (!qrData) {
      return NextResponse.json({ error: "QR data is required" }, { status: 400 });
    }

    // Parse QR data
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch {
      return NextResponse.json({ error: "Invalid QR code format" }, { status: 400 });
    }

    const { registrationId, eventId, email } = parsedData;

    if (!registrationId || !eventId || !email) {
      return NextResponse.json({ error: "Invalid QR code data" }, { status: 400 });
    }

    // Find registration
    const registration = await EventRegistration.findOne({
      registrationId,
      eventId,
      email,
      status: "confirmed"
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    // Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if already checked in
    if (registration.checkedIn) {
      return NextResponse.json({
        success: true,
        message: "Already checked in",
        checkedIn: true,
        checkedInTime: registration.checkedInTime,
        registration: {
          firstName: registration.firstName,
          lastName: registration.lastName,
          adults: registration.adults,
          children: registration.children,
          registrationId: registration.registrationId
        },
        event: {
          eventName: event.eventname,
          eventDate: event.eventdate,
          eventTime: event.eventtime,
          eventVenue: event.eventvenue
        }
      });
    }

    // Check if event is today
    const eventDate = new Date(event.eventdate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate.getTime() !== today.getTime()) {
      return NextResponse.json({
        error: "Event is not today. Check-in only available on event day.",
        eventDate: event.eventdate
      }, { status: 400 });
    }

    // Mark as checked in
    registration.checkedIn = true;
    registration.checkedInTime = new Date();
    await registration.save();

    return NextResponse.json({
      success: true,
      message: "Check-in successful",
      checkedIn: true,
      checkedInTime: registration.checkedInTime,
      registration: {
        firstName: registration.firstName,
        lastName: registration.lastName,
        adults: registration.adults,
        children: registration.children,
        registrationId: registration.registrationId
      },
      event: {
        eventName: event.eventname,
        eventDate: event.eventdate,
        eventTime: event.eventtime,
        eventVenue: event.eventvenue
      }
    });

  } catch (error) {
    console.error("QR validation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  // For testing QR validation endpoint
  return NextResponse.json({
    message: "QR validation endpoint is working",
    method: "POST",
    required: {
      qrData: "JSON string with registrationId, eventId, and email"
    }
  });
}
