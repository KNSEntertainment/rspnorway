import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import EventRegistration from "@/models/EventRegistration.Model";
import Donation from "@/models/Donation.Model";
import FinancialTransaction from "@/models/FinancialTransaction.Model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const { syncType } = await request.json();
    
    let results = {
      eventRegistrations: { synced: 0, skipped: 0, total: 0 },
      donations: { synced: 0, skipped: 0, total: 0 }
    };

    if (syncType === "event-registrations" || syncType === "all") {
      // Sync event registrations
      const registrations = await EventRegistration.find({
        paymentStatus: "completed",
        totalAmount: { $gt: 0 }
      }).populate('eventId');

      results.eventRegistrations.total = registrations.length;

      for (const registration of registrations) {
        try {
          const existingTransaction = await FinancialTransaction.findOne({
            referenceNumber: registration.registrationId
          });

          if (existingTransaction) {
            results.eventRegistrations.skipped++;
            continue;
          }

          const transaction = new FinancialTransaction({
            type: "income",
            category: "event revenue",
            subcategory: "ticket sales",
            amount: registration.totalAmount,
            description: `Event registration for ${registration.eventId?.eventname || 'Unknown Event'} - ${registration.adults} adult(s)${registration.children > 0 ? `, ${registration.children} child(ren)` : ''}`,
            date: registration.createdAt,
            paymentMethod: "online",
            referenceNumber: registration.registrationId,
            relatedTo: "event",
            relatedId: registration.eventId?._id,
            eventId: registration.eventId?._id,
            status: "verified",
            verifiedBy: "system",
            verifiedAt: registration.createdAt,
            notes: `Registration ID: ${registration.registrationId}, Attendees: ${registration.firstName} ${registration.lastName} (${registration.email})`,
            tags: ["event-registration", "ticket-sales", registration.eventId?.eventname?.toLowerCase().replace(/\s+/g, '-') || 'unknown-event'],
            createdBy: "system@rspnorway.org",
          });

          await transaction.save();
          results.eventRegistrations.synced++;

        } catch (error) {
          console.error(`Error syncing registration ${registration.registrationId}:`, error);
        }
      }
    }

    if (syncType === "donations" || syncType === "all") {
      // Sync donations
      const donations = await Donation.find({
        paymentStatus: "completed",
        amount: { $gt: 0 }
      });

      results.donations.total = donations.length;

      for (const donation of donations) {
        try {
          const existingTransaction = await FinancialTransaction.findOne({
            referenceNumber: donation.stripePaymentIntentId || donation.stripeSessionId
          });

          if (existingTransaction) {
            results.donations.skipped++;
            continue;
          }

          const transaction = new FinancialTransaction({
            type: "income",
            category: "donations",
            subcategory: donation.donationType === "cause_specific" ? "cause donations" : "general donations",
            amount: donation.amount,
            description: `${donation.donationType === "cause_specific" ? "Cause-specific" : "General"} donation ${donation.isAnonymous ? "from anonymous donor" : `from ${donation.firstName} ${donation.lastName}`}`,
            date: donation.createdAt,
            paymentMethod: "card",
            referenceNumber: donation.stripePaymentIntentId || donation.stripeSessionId || `DON-${donation._id}`,
            relatedTo: "donation",
            relatedId: donation.causeId,
            status: "verified",
            verifiedBy: "system",
            verifiedAt: donation.createdAt,
            notes: `Donation ID: ${donation._id}, Email: ${donation.email}`,
            tags: ["donation", "stripe", donation.donationType],
            createdBy: "system@rspnorway.org",
          });

          await transaction.save();
          results.donations.synced++;

        } catch (error) {
          console.error(`Error syncing donation ${donation._id}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Financial data synchronization completed",
      results
    });

  } catch (error) {
    console.error("Error syncing financial data:", error);
    return NextResponse.json({ 
      error: "Failed to sync financial data" 
    }, { status: 500 });
  }
}
