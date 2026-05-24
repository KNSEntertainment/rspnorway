import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import EventRegistration from "@/models/EventRegistration.Model";
import Event from "@/models/Event.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const year = parseInt(req.nextUrl.searchParams.get("year") || new Date().getFullYear().toString());

    // Get all registrations for the year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const registrations = await EventRegistration.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $ne: "cancelled" }
    }).populate({
      path: "eventId",
      model: Event,
    });

    // Calculate totals
    let totalRevenue = 0;
    let totalTickets = 0;
    const registrationCount = registrations.length;

    const registrationDetails = registrations.map((reg) => {
      const event = reg.eventId as {
        _id: string;
        eventname: string;
        eventdate: string;
        [key: string]: unknown;
      };
      const totalAmount = reg.totalAmount || 0;
      const tickets = reg.adults + reg.children;
      
      totalRevenue += totalAmount;
      totalTickets += tickets;
      
      return {
        registrationId: reg.registrationId,
        eventName: event?.eventname || "Unknown Event",
        totalAmount,
        adults: reg.adults,
        children: reg.children,
        tickets,
        createdAt: reg.createdAt,
      };
    });

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalTickets,
        registrationCount,
        averageTicketPrice: totalTickets > 0 ? totalRevenue / totalTickets : 0,
      },
      registrations: registrationDetails,
    });
  } catch (error: unknown) {
    console.error("Error debugging ticket data:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to debug ticket data" },
      { status: 500 }
    );
  }
}
