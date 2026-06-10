import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ExecutiveContribution from "@/models/ExecutiveContribution.Model";
import FinancialTransaction from "@/models/FinancialTransaction.Model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin" && session?.user?.role !== "treasurer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const contribution = await ExecutiveContribution.findById(id).populate("memberId", "name email").lean();
    if (!contribution) {
      return NextResponse.json({ error: "Contribution not found" }, { status: 404 });
    }

    return NextResponse.json(contribution);
  } catch (error) {
    console.error("Error fetching contribution:", error);
    return NextResponse.json({ error: "Failed to fetch contribution" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin" && session?.user?.role !== "treasurer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (action === "add-payment") {
      const { amount, paymentDate, paymentMethod, notes } = body;
      if (!amount || amount <= 0) {
        return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
      }

      const contribution = await ExecutiveContribution.findById(id);
      if (!contribution) {
        return NextResponse.json({ error: "Contribution not found" }, { status: 404 });
      }

      let transactionId = null;
      let transactionWarning = null;
      try {
        const financialTransaction = new FinancialTransaction({
          type: "income",
          category: "executive contribution",
          subcategory: "membership fee",
          amount,
          description: `Executive contribution payment from ${contribution.memberName} for year ${contribution.year}`,
          date: paymentDate ? new Date(paymentDate) : new Date(),
          paymentMethod: paymentMethod || "cash",
          referenceNumber: `EXEC-CONTRIB-${contribution.memberId}-${contribution.year}-${Date.now()}`,
          relatedTo: "membership",
          status: "verified",
          verifiedBy: session.user.email,
          verifiedAt: new Date(),
          notes: notes || "",
          createdBy: session.user.email,
          tags: ["executive-contribution", `year-${contribution.year}`],
        });
        const saved = await financialTransaction.save();
        transactionId = saved._id;
      } catch (txError) {
        console.error("Error creating financial transaction:", txError);
        transactionWarning = `Payment recorded but financial transaction creation failed: ${txError.message}`;
      }

      contribution.payments.push({
        amount,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        paymentMethod: paymentMethod || "cash",
        transactionId,
        notes: notes || "",
        recordedBy: session.user.email,
        recordedAt: new Date(),
      });

      contribution.amountPaid = contribution.payments.reduce((sum, p) => sum + p.amount, 0);
      if (contribution.amountPaid >= contribution.totalDue) {
        contribution.status = "paid";
      } else if (contribution.amountPaid > 0) {
        contribution.status = "partial";
      }

      await contribution.save();

      const updated = await ExecutiveContribution.findById(id).populate("memberId", "name email").lean();
      return NextResponse.json({ success: true, contribution: updated, warning: transactionWarning });
    }

    if (action === "update-year") {
      const { totalDue } = body;
      if (!totalDue || totalDue <= 0) {
        return NextResponse.json({ error: "Invalid total due amount" }, { status: 400 });
      }

      const contribution = await ExecutiveContribution.findByIdAndUpdate(
        id,
        { totalDue },
        { new: true }
      ).populate("memberId", "name email").lean();

      if (!contribution) {
        return NextResponse.json({ error: "Contribution not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, contribution });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating contribution:", error);
    return NextResponse.json({ error: "Failed to update contribution" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin" && session?.user?.role !== "treasurer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const contribution = await ExecutiveContribution.findByIdAndDelete(id);
    if (!contribution) {
      return NextResponse.json({ error: "Contribution not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Contribution deleted" });
  } catch (error) {
    console.error("Error deleting contribution:", error);
    return NextResponse.json({ error: "Failed to delete contribution" }, { status: 500 });
  }
}
