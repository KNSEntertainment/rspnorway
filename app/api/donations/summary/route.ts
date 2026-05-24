import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    // Fetch donations within the date range
    const donations = await Donation.find({
      ...dateFilter,
      paymentStatus: "completed", // Only include completed donations
    });

    // Calculate total donation amount
    const totalAmount = donations.reduce((sum, donation) => {
      // Only include donations in NOK currency
      if (donation.currency === "NOK") {
        return sum + donation.amount;
      }
      return sum;
    }, 0);

    // Get donation statistics
    const totalDonations = donations.length;
    const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;

    // Group by donation type
    const donationsByType = donations.reduce((acc, donation) => {
      const type = donation.donationType || "general";
      if (!acc[type]) {
        acc[type] = { count: 0, amount: 0 };
      }
      acc[type].count += 1;
      if (donation.currency === "NOK") {
        acc[type].amount += donation.amount;
      }
      return acc;
    }, {});

    // Group by month (for trend analysis)
    const donationsByMonth = donations.reduce((acc, donation) => {
      if (donation.currency !== "NOK") return acc;
      
      const monthKey = donation.createdAt.toISOString().slice(0, 7); // YYYY-MM format
      if (!acc[monthKey]) {
        acc[monthKey] = 0;
      }
      acc[monthKey] += donation.amount;
      return acc;
    }, {});

    return NextResponse.json({
      totalAmount,
      totalDonations,
      averageDonation,
      donationsByType,
      donationsByMonth,
      currency: "NOK",
      period: {
        startDate,
        endDate,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching donation summary:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch donation summary" },
      { status: 500 }
    );
  }
}
