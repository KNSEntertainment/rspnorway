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

    const searchParams = req.nextUrl.searchParams;
    const period = searchParams.get("period") || "month";
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    // Generate CSV report data
    const csvData = await generateFinancialReport(period, year);

    // Set headers for CSV download
    const headers = new Headers();
    headers.set("Content-Type", "text/csv");
    headers.set("Content-Disposition", `attachment; filename="financial-report-${period}-${year}.csv"`);

    return new NextResponse(csvData, {
      status: 200,
      headers: headers,
    });
  } catch (error: unknown) {
    console.error("Error exporting financial report:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to export report" },
      { status: 500 }
    );
  }
}

async function generateFinancialReport(period: string, year: number): Promise<string> {
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

  // Generate CSV header
  const headers = [
    "Category",
    "Amount (NOK)",
    "Type",
    "Date",
    "Description",
    "Period",
    "Year"
  ];

  const data = [];

  // Fetch real event registration data
  const registrations = await EventRegistration.find({
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $ne: "cancelled" }
  });

  // Add ticket revenue data
  const ticketRevenue = registrations.reduce((sum, reg) => sum + (reg.totalAmount || 0), 0);
  if (ticketRevenue > 0) {
    data.push([
      "Ticket Revenue",
      ticketRevenue.toString(),
      "Income",
      new Date().toISOString().split('T')[0],
      "Event ticket sales",
      period,
      year.toString()
    ]);
  }

  // Fetch real expense data
  const expenses = await Expense.find({
    date: { $gte: startDate, $lte: endDate },
    status: "approved"
  });

  // Add expense data grouped by category
  const expensesByCategory = new Map();
  expenses.forEach((expense) => {
    const category = expense.category;
    if (!expensesByCategory.has(category)) {
      expensesByCategory.set(category, 0);
    }
    expensesByCategory.set(category, expensesByCategory.get(category) + expense.amount);
  });

  expensesByCategory.forEach((amount, category) => {
    data.push([
      category,
      amount.toString(),
      "Expense",
      new Date().toISOString().split('T')[0],
      `Operational costs for ${category}`,
      period,
      year.toString()
    ]);
  });

  // Add donation revenue (when API is available)
  const donationRevenue = await calculateDonationRevenue(startDate, endDate);
  if (donationRevenue > 0) {
    data.push([
      "Donation Revenue",
      donationRevenue.toString(),
      "Income",
      new Date().toISOString().split('T')[0],
      "Community donations",
      period,
      year.toString()
    ]);
  }

  // Convert to CSV format
  const csvContent = [
    headers.join(","),
    ...data.map(row => row.join(","))
  ].join("\n");

  return csvContent;
}

// Helper function to calculate donation revenue
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
