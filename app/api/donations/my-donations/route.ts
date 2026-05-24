import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
    }

    // Verify the requested email matches the logged-in user's email
    if (email !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized to access this data" }, { status: 403 });
    }

    await ConnectDB();

    // Find donations by email, phone, or membership ID
    const donations = await Donation.find({
      $or: [
        { email: email },
        { phone: session.user.phone }
      ]
    }).sort({ date: -1 });

    // Calculate total amount
    const totalAmount = donations.reduce((sum, donation) => {
      return sum + (donation.amount || 0);
    }, 0);

    return NextResponse.json({
      donations: donations.map(donation => ({
        id: donation._id.toString(),
        amount: donation.amount,
        currency: donation.currency || "NOK",
        date: donation.date || donation.createdAt,
        paymentMethod: donation.paymentMethod || "Online",
        status: donation.status || "completed",
        description: donation.description,
        transactionId: donation.transactionId,
        membershipId: donation.membershipId,
        email: donation.email,
        phone: donation.phone,
      })),
      totalAmount,
      count: donations.length
    });

  } catch (error) {
    console.error("Error fetching donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}
