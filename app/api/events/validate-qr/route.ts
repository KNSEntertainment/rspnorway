import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "@/lib/mongodb";
import EventRegistration from "@/models/EventRegistration.Model";
import Event from "@/models/Event.Model";
import Membership from "@/models/Membership.Model";
import ExecutiveMember from "@/models/ExecutiveMember.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

interface MemberDoc {
  _id: unknown;
  fullName?: string;
  name?: string;
  email: string;
  phone?: string;
  membershipType?: string;
  membershipStatus?: string;
  position?: string;
  [key: string]: unknown;
}

function attendeeSummary(registration: InstanceType<typeof EventRegistration>) {
  const total =
    typeof registration.getTotalAttendees === "function"
      ? registration.getTotalAttendees()
      : (registration.adults || 1);

  return {
    registrationId: registration.registrationId,
    firstName: registration.firstName,
    lastName: registration.lastName,
    email: registration.email,
    phone: registration.phone,
    adults: registration.adults || 0,
    students: registration.students || 0,
    children: registration.children || 0,
    elders: registration.elders || 0,
    totalAttendees: total,
    status: registration.status,
    checkedIn: registration.checkedIn,
    checkedInAt: registration.checkedInAt,
    checkedInBy: registration.checkedInBy,
  };
}

function eventSummary(event: InstanceType<typeof Event>) {
  return {
    eventName: event.eventname,
    eventDate: event.eventdate,
    eventTime: event.eventtime,
    eventVenue: event.eventvenue,
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;
    if (!session?.user || !role || !["admin", "treasurer"].includes(role)) {
      return NextResponse.json({ status: "error", error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const rawQrData: string | undefined = body?.qrData ?? body?.registrationId;
    const selectedEventId: string | undefined = body?.eventId;

    if (!rawQrData || typeof rawQrData !== "string") {
      return NextResponse.json({ status: "invalid", error: "QR code is empty or unreadable" }, { status: 400 });
    }

    await ConnectDB();

    // 1. Check if the scanned QR is a Member ID Card (e.g. https://.../members/{id} or direct ID)
    const memberUrlMatch = rawQrData.match(/\/members\/([a-f0-9]{24})/i);
    const isMongoId = /^[a-f0-9]{24}$/i.test(rawQrData.trim());
    const candidateMemberId = memberUrlMatch ? memberUrlMatch[1] : (isMongoId ? rawQrData.trim() : null);

    if (candidateMemberId) {
      const membership = (await Membership.findById(candidateMemberId).lean()) as MemberDoc | null;
      const execMember = !membership
        ? ((await ExecutiveMember.findById(candidateMemberId).lean()) as MemberDoc | null)
        : null;
      const member = membership || execMember;

      if (member) {
        // Find target event for check-in
        let targetEvent = selectedEventId ? await Event.findById(selectedEventId) : null;
        if (!targetEvent) {
          targetEvent = await Event.findOne().sort({ createdAt: -1 });
        }

        if (targetEvent) {
          // Check if already registered
          const existingReg = await EventRegistration.findOne({
            eventId: targetEvent._id,
            $or: [{ email: member.email }, { userId: (member._id as object).toString() }],
          });

          if (existingReg) {
            if (existingReg.checkedIn) {
              return NextResponse.json({
                status: "already_checked_in",
                message: `${member.fullName || member.name} is already checked in for ${targetEvent.eventname}`,
                registration: attendeeSummary(existingReg),
                event: eventSummary(targetEvent),
              });
            }

            existingReg.checkedIn = true;
            existingReg.checkedInAt = new Date();
            existingReg.checkedInBy = session.user.email || session.user.fullName || "admin";
            await existingReg.save();

            return NextResponse.json({
              status: "success",
              message: `Member verified & checked in: ${member.fullName || member.name}`,
              registration: attendeeSummary(existingReg),
              event: eventSummary(targetEvent),
            });
          }

          // Auto-register and check in member on the spot!
          const names = (member.fullName || member.name || "Member").trim().split(" ");
          const firstName = names[0];
          const lastName = names.slice(1).join(" ") || firstName;
          const newRegId =
            "REG-" +
            Date.now().toString(36).toUpperCase() +
            "-" +
            Math.random().toString(36).substring(2, 5).toUpperCase();

          const newReg = new EventRegistration({
            registrationId: newRegId,
            eventId: targetEvent._id,
            userId: (member._id as object).toString(),
            firstName,
            lastName,
            email: member.email,
            phone: member.phone || "N/A",
            adults: 1,
            students: 0,
            children: 0,
            elders: 0,
            totalAmount: 0,
            status: "confirmed",
            checkedIn: true,
            checkedInAt: new Date(),
            checkedInBy: session.user.email || session.user.fullName || "admin",
          });
          await newReg.save();

          await Event.findByIdAndUpdate(targetEvent._id, {
            $inc: { registeredSeats: 1, totalRegistrations: 1 },
          });

          return NextResponse.json({
            status: "success",
            message: `Member Verified & Registered for ${targetEvent.eventname} on the spot!`,
            registration: attendeeSummary(newReg),
            event: eventSummary(targetEvent),
          });
        }

        // Verified member when no specific event is active
        return NextResponse.json({
          status: "success",
          message: `Membership Verified: ${member.fullName || member.name} (${member.membershipType || "Member"})`,
          registration: {
            registrationId: "MEM-" + (member._id as object).toString().slice(-6).toUpperCase(),
            firstName: (member.fullName || member.name || "Member").split(" ")[0],
            lastName: (member.fullName || member.name || "Member").split(" ").slice(1).join(" ") || "Member",
            email: member.email,
            phone: member.phone || "N/A",
            adults: 1,
            students: 0,
            children: 0,
            elders: 0,
            totalAttendees: 1,
            status: "confirmed",
            checkedIn: true,
            checkedInAt: new Date().toISOString(),
            checkedInBy: session.user.email || "admin",
          },
        });
      }
    }

    // 2. Standard Event Registration QR Validation
    let registrationId = rawQrData.trim();
    try {
      const parsed = JSON.parse(rawQrData);
      if (parsed && typeof parsed.registrationId === "string") {
        registrationId = parsed.registrationId;
      }
    } catch {
      // not JSON, treat rawQrData as the plain registrationId
    }

    const registration = await EventRegistration.findOne({ registrationId });

    if (!registration) {
      return NextResponse.json(
        { status: "invalid", error: "This QR code does not match any member or event ticket" },
        { status: 404 }
      );
    }

    const event = await Event.findById(registration.eventId);
    if (!event) {
      return NextResponse.json(
        { status: "invalid", error: "Event for this registration no longer exists" },
        { status: 404 }
      );
    }

    if (registration.status !== "confirmed") {
      return NextResponse.json(
        {
          status: "invalid",
          error:
            registration.status === "cancelled"
              ? "This registration was rejected/cancelled"
              : "This registration is still pending payment approval",
          registration: attendeeSummary(registration),
          event: eventSummary(event),
        },
        { status: 409 }
      );
    }

    if (registration.checkedIn) {
      return NextResponse.json({
        status: "already_checked_in",
        message: "Already checked in",
        registration: attendeeSummary(registration),
        event: eventSummary(event),
      });
    }

    // Mark as checked in
    registration.checkedIn = true;
    registration.checkedInAt = new Date();
    registration.checkedInBy = session.user.email || session.user.fullName || "admin";
    await registration.save();

    return NextResponse.json({
      status: "success",
      message: "Check-in successful",
      registration: attendeeSummary(registration),
      event: eventSummary(event),
    });
  } catch (error) {
    console.error("QR validation error:", error);
    return NextResponse.json({ status: "error", error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "QR validation endpoint is working",
    method: "POST",
    required: { qrData: "Scanned QR text (Member URL or registrationId)" },
  });
}
