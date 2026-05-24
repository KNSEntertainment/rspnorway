import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import EventRegistration from "@/models/EventRegistration.Model";
import Expense from "@/models/Expense.Model";
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

    // Generate monthly data for the specified year
    const monthlyData = [];
    
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      
      // Fetch registrations for this month
      const registrations = await EventRegistration.find({
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: "cancelled" }
      });

      // Calculate monthly financial metrics
      let income = 0;
      let expenses = 0;
      let tickets = 0;
      let donations = 0;

      // Calculate ticket revenue and ticket count
      registrations.forEach((registration) => {
        const totalAmount = registration.totalAmount || 0;
        income += totalAmount;
        tickets += registration.adults + registration.children;
      });

      // Fetch real expenses for this month
      const monthExpenses = await Expense.find({
        date: { $gte: startDate, $lte: endDate },
        status: "approved"
      });

      monthExpenses.forEach((expense) => {
        expenses += expense.amount;
      });

      // Fetch real donation data for this month
      donations = await calculateMonthlyDonations(startDate, endDate);
      income += donations;

      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];

      monthlyData.push({
        month: monthNames[month],
        income,
        expenses,
        tickets,
        donations,
      });
    }

    return NextResponse.json(monthlyData);
  } catch (error: unknown) {
    console.error("Error fetching monthly data:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch monthly data" },
      { status: 500 }
    );
  }
}

// Helper function to calculate monthly donations
async function calculateMonthlyDonations(startDate: Date, endDate: Date): Promise<number> {
  try {
    // This would integrate with the actual donations API
    // For now, returning 0 until the donations API is properly integrated
    // TODO: Replace with actual donations API call
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/donations/summary?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
    if (response.ok) {
      const data = await response.json();
      return data.totalAmount || 0;
    }
  } catch {
    console.log("Donations API not available, using 0");
  }
  return 0; // Return 0 instead of mock data
}
