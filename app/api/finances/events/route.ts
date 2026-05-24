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

    // Fetch all expenses for the period
    const expenses = await Expense.find({
      date: { $gte: startDate, $lte: endDate },
      status: "approved"
    });

    // Group expenses by event
    const expensesByEvent = new Map();
    expenses.forEach((expense) => {
      if (expense.eventId) {
        const eventId = expense.eventId.toString();
        if (!expensesByEvent.has(eventId)) {
          expensesByEvent.set(eventId, 0);
        }
        expensesByEvent.set(eventId, expensesByEvent.get(eventId) + expense.amount);
      }
    });

    // Group registrations by event and calculate financial metrics
    const eventFinancials = new Map();

    registrations.forEach((registration) => {
      const event = registration.eventId as {
        _id: string;
        eventname: string;
        eventdate: string;
        [key: string]: unknown;
      };
      if (!event) return;

      const eventId = event._id.toString();
      
      if (!eventFinancials.has(eventId)) {
        eventFinancials.set(eventId, {
          id: eventId,
          title: event.eventname || "Untitled Event",
          date: event.eventdate || new Date().toISOString().split('T')[0],
          status: getEventStatus(event.eventdate),
          totalRevenue: 0,
          totalExpenses: expensesByEvent.get(eventId) || 0,
          ticketsSold: 0,
          totalTickets: event.maximumSeats || 0,
          averageTicketPrice: 0,
        });
      }

      const eventFin = eventFinancials.get(eventId);
      const totalAmount = registration.totalAmount || 0;
      
      // Add revenue
      eventFin.totalRevenue += totalAmount;
      eventFin.ticketsSold += registration.adults + registration.children;
    });

    // Calculate average ticket price and net profit for each event
    const events = Array.from(eventFinancials.values()).map(event => {
      event.averageTicketPrice = event.ticketsSold > 0 ? event.totalRevenue / event.ticketsSold : 0;
      event.netProfit = event.totalRevenue - event.totalExpenses;
      return event;
    });

    // Sort by net profit (highest first)
    events.sort((a, b) => b.netProfit - a.netProfit);

    return NextResponse.json(events);
  } catch (error: unknown) {
    console.error("Error fetching event financials:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch event financials" },
      { status: 500 }
    );
  }
}

function getEventStatus(eventDate: string): string {
  const now = new Date();
  const date = new Date(eventDate);
  
  if (date > now) return "upcoming";
  if (date.toDateString() === now.toDateString()) return "ongoing";
  return "completed";
}
