import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ExecutiveContribution from "@/models/ExecutiveContribution.Model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin" && session?.user?.role !== "treasurer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const status = searchParams.get("status");
    const memberId = searchParams.get("memberId");

    const query = {};
    if (year) query.year = parseInt(year);
    if (status) query.status = status;
    if (memberId) query.memberId = memberId;

    const contributions = await ExecutiveContribution.find(query)
      .populate("memberId", "name email")
      .sort({ year: -1, memberName: 1 })
      .lean();

    const totalDue = contributions.reduce((sum, c) => sum + c.totalDue, 0);
    const totalPaid = contributions.reduce((sum, c) => sum + c.amountPaid, 0);
    const pendingCount = contributions.filter(c => c.status === "pending" || c.status === "partial").length;
    const paidCount = contributions.filter(c => c.status === "paid").length;

    return NextResponse.json({
      contributions,
      summary: { totalDue, totalPaid, totalRemaining: totalDue - totalPaid, pendingCount, paidCount },
    });
  } catch (error) {
    console.error("Error fetching executive contributions:", error);
    return NextResponse.json({ error: "Failed to fetch contributions" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin" && session?.user?.role !== "treasurer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { memberId, memberEmail, memberName, year, totalDue } = body;

    if (!memberId || !memberEmail || !memberName || !year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await ExecutiveContribution.findOne({ memberId, year });
    if (existing) {
      return NextResponse.json({ error: "Contribution record for this member and year already exists" }, { status: 409 });
    }

    const contribution = new ExecutiveContribution({
      memberId,
      memberEmail,
      memberName,
      year: parseInt(year),
      totalDue: totalDue || 1200,
    });

    await contribution.save();
    return NextResponse.json({ success: true, contribution }, { status: 201 });
  } catch (error) {
    console.error("Error creating executive contribution:", error);
    return NextResponse.json({ error: "Failed to create contribution" }, { status: 500 });
  }
}
