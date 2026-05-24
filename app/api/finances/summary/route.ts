import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import EventRegistration from "@/models/EventRegistration.Model";
import Event from "@/models/Event.Model";
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

    const searchParams = req.nextUrl.searchParams;
    const period = searchParams.get("period") || "month";
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case "month":
        startDate = new Date(year, now.getMonth(), 1);
        endDate = new Date(year, now.getMonth() + 1, 0);
        break;
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(year, quarter * 3, 1);
        endDate = new Date(year, (quarter + 1) * 3, 0);
        break;
      case "year":
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
        break;
      default:
        startDate = new Date(year, now.getMonth(), 1);
        endDate = new Date(year, now.getMonth() + 1, 0);
    }

    // Fetch event registrations within the period
    const registrations = await EventRegistration.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $ne: "cancelled" }
    }).populate({
      path: "eventId",
      model: Event,
    });

    // Calculate financial metrics
    let ticketRevenue = 0;
    let eventExpenses = 0;
    let totalIncome = 0;
    let totalExpenses = 0;

    // Calculate ticket revenue from event registrations
    registrations.forEach((registration) => {
      // Revenue from tickets
      ticketRevenue += registration.totalAmount || 0;
      totalIncome += registration.totalAmount || 0;
    });

    // Fetch real expenses from database
    const expenses = await Expense.find({
      date: { $gte: startDate, $lte: endDate },
      status: "approved"
    });

    // Calculate total expenses by type
    expenses.forEach((expense) => {
      totalExpenses += expense.amount;
      
      if (expense.type === "event") {
        eventExpenses += expense.amount;
      }
    });

    // Fetch real donation revenue (integrate with actual donations API)
    const donationRevenue = await calculateDonationRevenue(startDate, endDate);
    totalIncome += donationRevenue;

    const netIncome = totalIncome - totalExpenses;

    // Calculate real growth rates
    const previousPeriodStart = new Date(startDate);
    const previousPeriodEnd = new Date(startDate);
    
    switch (period) {
      case "month":
        previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
        previousPeriodEnd.setMonth(previousPeriodEnd.getMonth() - 1);
        break;
      case "quarter":
        previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 3);
        previousPeriodEnd.setMonth(previousPeriodEnd.getMonth() - 3);
        break;
      case "year":
        previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1);
        previousPeriodEnd.setFullYear(previousPeriodEnd.getFullYear() - 1);
        break;
    }

    const previousPeriodData = await calculateFinancialData(previousPeriodStart, previousPeriodEnd);
    const monthlyGrowth = previousPeriodData.totalIncome > 0 
      ? ((totalIncome - previousPeriodData.totalIncome) / previousPeriodData.totalIncome) * 100 
      : 0;
    
    const previousYearData = await calculateFinancialData(
      new Date(year - 1, 0, 1),
      new Date(year - 1, 11, 31)
    );
    const yearlyGrowth = previousYearData.totalIncome > 0 
      ? ((totalIncome - previousYearData.totalIncome) / previousYearData.totalIncome) * 100 
      : 0;

    const operationalExpenses = totalExpenses - eventExpenses;

    const summary = {
      totalIncome,
      totalExpenses,
      netIncome,
      ticketRevenue,
      donationRevenue,
      eventExpenses,
      operationalExpenses,
      monthlyGrowth,
      yearlyGrowth,
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    return NextResponse.json(summary);
  } catch (error: unknown) {
    console.error("Error fetching financial summary:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch financial summary" },
      { status: 500 }
    );
  }
}

// Helper function to calculate financial data for a period
async function calculateFinancialData(startDate: Date, endDate: Date) {
  const registrations = await EventRegistration.find({
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $ne: "cancelled" }
  }).populate({
    path: "eventId",
    model: Event,
  });

  let totalIncome = 0;
  registrations.forEach((registration) => {
    totalIncome += registration.totalAmount || 0;
  });

  const expenses = await Expense.find({
    date: { $gte: startDate, $lte: endDate },
    status: "approved"
  });

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return {
    totalIncome,
    totalExpenses,
  };
}

// Helper function to calculate donation revenue (integrate with actual donations API)
async function calculateDonationRevenue(startDate: Date, endDate: Date): Promise<number> {
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
