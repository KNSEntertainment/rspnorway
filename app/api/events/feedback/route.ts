import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "@/lib/mongodb";
import Event from "@/models/Event.Model";
import EventFeedback from "@/models/EventFeedback.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { isEventPast } from "@/lib/eventStatus";
import { sanitizeFeedbackHtml, feedbackTextLength } from "@/lib/sanitizeFeedback";

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();

    const body = await request.json();
    const eventId: string | undefined = body?.eventId;
    const name: string | undefined = body?.name;
    const email: string | undefined = body?.email;
    const message: string | undefined = body?.message;
    const locale: string | undefined = body?.locale;

    if (!eventId || !name?.trim() || !message) {
      return NextResponse.json({ error: "Event, name and feedback message are required" }, { status: 400 });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!isEventPast(event.eventdate)) {
      return NextResponse.json({ error: "Feedback can only be submitted after the event has taken place" }, { status: 400 });
    }

    const sanitizedMessage = sanitizeFeedbackHtml(message);
    if (feedbackTextLength(sanitizedMessage) < 3) {
      return NextResponse.json({ error: "Please enter your feedback" }, { status: 400 });
    }

    const trimmedEmail = email?.trim();

    const feedback = await EventFeedback.create({
      eventId,
      name: name.trim(),
      ...(trimmedEmail ? { email: trimmedEmail } : {}),
      message: sanitizedMessage,
      ...(locale ? { locale } : {}),
    });

    return NextResponse.json({ success: true, feedbackId: feedback._id }, { status: 201 });
  } catch (error) {
    console.error("Error submitting event feedback:", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;
    if (!session?.user || !role || !["admin", "treasurer"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ConnectDB();

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    const feedback = await EventFeedback.find({ eventId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error fetching event feedback:", error);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}
