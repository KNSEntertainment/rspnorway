import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import EventRegistration from "@/models/EventRegistration.Model";
import Event from "@/models/Event.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

interface EventData {
  _id: string;
  eventname: string;
  eventdate: string;
  eventtime?: string;
  eventvenue?: string;
  eventdescription?: string;
  eventposterUrl?: string;
  eventposter2Url?: string;
  eventposter3Url?: string;
  price?: number;
  studentPrice?: number;
  maximumSeats?: number;
  registeredSeats?: number;
  registrationEnabled?: boolean;
  paymentCollectionEnabled?: boolean;
  practicalInfo?: string;
  [key: string]: unknown;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = req.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
    }

    // Verify that the requested email matches the authenticated user's email
    if (email !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find all event registrations for this user
    const registrations = await EventRegistration.find({ email })
      .populate({
        path: "eventId",
        model: Event,
      })
      .sort({ createdAt: -1 });

    // Transform the data to match the frontend Event interface
    const events = registrations
      .filter((registration) => registration.eventId) // Filter out registrations with null eventId
      .map((registration) => {
        const event = registration.eventId as EventData;
        
        // Skip if event data is null or missing
        if (!event) {
          return null;
        }

        const now = new Date();
        let eventDate: Date;
        
        // Handle event date parsing
        try {
          eventDate = new Date(event.eventdate);
          // If date is invalid, use current date
          if (isNaN(eventDate.getTime())) {
            eventDate = now;
          }
        } catch {
          eventDate = now;
        }
        
        // Determine event status based on date
        let status: "upcoming" | "ongoing" | "completed" | "cancelled";
        if (registration.status === "cancelled") {
          status = "cancelled";
        } else if (eventDate > now) {
          status = "upcoming";
        } else if (eventDate.toDateString() === now.toDateString()) {
          status = "ongoing";
        } else {
          status = "completed";
        }

        // Determine role based on registration details
        let role: string = "Participant";
        if (registration.adults > 1 || registration.children > 0) {
          role = "Group Leader";
        }
        if (registration.specialRequests && registration.specialRequests.includes("volunteer")) {
          role = "Volunteer";
        }

        return {
          id: registration._id.toString(),
          title: event.eventname || "Untitled Event",
          description: event.eventdescription || "No description available",
          date: event.eventdate || new Date().toISOString().split('T')[0],
          time: event.eventtime || "TBD",
          location: event.eventvenue || "TBD",
          status: status,
          category: "Event", // Default category, can be enhanced later
          participantCount: registration.adults + registration.children,
          maxParticipants: event.maximumSeats || 0,
          registrationDate: registration.createdAt.toISOString().split('T')[0],
          role: role,
          image: event.eventposterUrl || "",
          organizer: "PNSB Norway", // Default organizer, can be enhanced later
          registrationId: registration.registrationId,
          paymentStatus: registration.paymentStatus,
          checkedIn: registration.checkedIn,
          qrCode: registration.qrCode,
          totalAmount: registration.totalAmount,
          price: event.price || 0,
        };
      })
      .filter((event) => event !== null); // Remove any null entries

    return NextResponse.json({
      success: true,
      events: events,
      total: events.length,
    });
  } catch (error: unknown) {
    console.error("Error fetching user events:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch events" },
      { status: 500 }
    );
  }
}
