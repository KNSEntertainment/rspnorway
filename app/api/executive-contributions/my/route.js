import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import ExecutiveContribution from "@/models/ExecutiveContribution.Model";
import FinancialTransaction from "@/models/FinancialTransaction.Model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user._id;
    const memberObjectId = new mongoose.Types.ObjectId(userId);

    const contributions = await ExecutiveContribution.find({
      $or: [{ memberId: memberObjectId }, { memberEmail: session.user.email }],
    })
      .sort({ year: -1 })
      .lean();

    // Collect transaction IDs from all payments
    const transactionIds = contributions
      .flatMap((c) => c.payments || [])
      .filter((p) => p.transactionId)
      .map((p) => p.transactionId);

    let transactions = [];
    if (transactionIds.length > 0) {
      transactions = await FinancialTransaction.find({ _id: { $in: transactionIds } })
        .sort({ date: -1 })
        .lean();
    }

    // Fallback: also query transactions by member email/name in description
    const txByDesc = await FinancialTransaction.find({
      category: "executive contribution",
      $or: [
        { description: { $regex: session.user.email, $options: "i" } },
      ],
    })
      .sort({ date: -1 })
      .lean();

    // Merge, deduplicate by _id
    const seenIds = new Set(transactions.map((t) => t._id.toString()));
    for (const tx of txByDesc) {
      if (!seenIds.has(tx._id.toString())) {
        transactions.push(tx);
        seenIds.add(tx._id.toString());
      }
    }

    const summary = {
      totalDue: contributions.reduce((sum, c) => sum + c.totalDue, 0),
      totalPaid: contributions.reduce((sum, c) => sum + c.amountPaid, 0),
      remaining: contributions.reduce((sum, c) => sum + c.totalDue - c.amountPaid, 0),
    };

    return NextResponse.json({ contributions, summary, transactions });
  } catch (error) {
    console.error("Error fetching my contributions:", error);
    return NextResponse.json({ error: "Failed to fetch contributions" }, { status: 500 });
  }
}
