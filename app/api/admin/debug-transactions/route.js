import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import FinancialTransaction from "@/models/FinancialTransaction.Model";
import EventRegistration from "@/models/EventRegistration.Model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    // Get all financial transactions
    const allTransactions = await FinancialTransaction.find({}).sort({ createdAt: -1 }).limit(20);
    
    // Get event-related transactions specifically
    const eventTransactions = await FinancialTransaction.find({ relatedTo: "event" }).sort({ createdAt: -1 }).limit(10);
    
    // Get donation-related transactions specifically
    const donationTransactions = await FinancialTransaction.find({ relatedTo: "donation" }).sort({ createdAt: -1 }).limit(10);
    
    // Get all event registrations
    const eventRegistrations = await EventRegistration.find({ paymentStatus: "completed", totalAmount: { $gt: 0 } }).sort({ createdAt: -1 }).limit(5);
    
    return NextResponse.json({
      success: true,
      data: {
        totalTransactions: allTransactions.length,
        eventTransactions: eventTransactions.length,
        donationTransactions: donationTransactions.length,
        eventRegistrations: eventRegistrations.length,
        sampleTransactions: allTransactions.map(t => ({
          id: t._id,
          type: t.type,
          category: t.category,
          amount: t.amount,
          relatedTo: t.relatedTo,
          eventId: t.eventId,
          description: t.description.substring(0, 50) + "...",
          date: t.date,
          referenceNumber: t.referenceNumber
        })),
        sampleEventTransactions: eventTransactions.map(t => ({
          id: t._id,
          type: t.type,
          amount: t.amount,
          eventId: t.eventId,
          description: t.description.substring(0, 50) + "...",
          date: t.date
        })),
        sampleRegistrations: eventRegistrations.map(r => ({
          id: r._id,
          registrationId: r.registrationId,
          totalAmount: r.totalAmount,
          paymentStatus: r.paymentStatus,
          eventId: r.eventId,
          createdAt: r.createdAt
        }))
      }
    });

  } catch (error) {
    console.error("Error debugging transactions:", error);
    return NextResponse.json({ 
      error: "Failed to debug transactions" 
    }, { status: 500 });
  }
}
