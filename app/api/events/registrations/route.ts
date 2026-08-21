import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "@/lib/mongodb";
import EventRegistration from "@/models/EventRegistration.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ConnectDB();

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = {};
    if (eventId) filter.eventId = eventId;
    if (status === "attended") {
      // "Attended" is a derived state (confirmed + checked in), not a stored status value.
      filter.status = "confirmed";
      filter.checkedIn = true;
    } else if (status === "confirmed") {
      // Keep "Confirmed" and "Attended" mutually exclusive in the filter dropdown.
      filter.status = "confirmed";
      filter.checkedIn = { $ne: true };
    } else if (status) {
      filter.status = status;
    }

    const registrations = await EventRegistration.find(filter)
      .populate("eventId", "eventname eventdate eventtime eventvenue")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
