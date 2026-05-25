import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import FinancialTransaction from "@/models/FinancialTransaction.Model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await FinancialTransaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    // Generate CSV
    const headers = [
      "Date",
      "Type",
      "Category",
      "Subcategory",
      "Amount",
      "Description",
      "Payment Method",
      "Reference Number",
      "Related To",
      "Status",
      "Verified By",
      "Verified At",
      "Notes",
      "Tags",
      "Receipt Files",
      "Created By",
      "Created At"
    ];

    const csvRows = [
      headers.join(","),
      ...transactions.map(transaction => {
        const row = [
          new Date(transaction.date).toLocaleDateString(),
          transaction.type,
          transaction.category,
          transaction.subcategory || "",
          transaction.amount,
          `"${transaction.description.replace(/"/g, '""')}"`,
          transaction.paymentMethod,
          transaction.referenceNumber || "",
          transaction.relatedTo,
          transaction.status,
          transaction.verifiedBy || "",
          transaction.verifiedAt ? new Date(transaction.verifiedAt).toLocaleDateString() : "",
          transaction.notes ? `"${transaction.notes.replace(/"/g, '""')}"` : "",
          transaction.tags ? `"${transaction.tags.join("; ")}"` : "",
          transaction.receiptFiles.length > 0 ? `"${transaction.receiptFiles.map(f => f.originalName).join("; ")}"` : "",
          transaction.createdBy,
          new Date(transaction.createdAt).toLocaleDateString()
        ];
        return row.join(",");
      })
    ];

    const csv = csvRows.join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="financial-transactions-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error("Error exporting financial transactions:", error);
    return NextResponse.json({ error: "Failed to export transactions" }, { status: 500 });
  }
}
