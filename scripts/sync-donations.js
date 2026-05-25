import mongoose from "mongoose";
import connectDB from "../lib/mongodb.js";
import Donation from "../models/Donation.Model.js";
import FinancialTransaction from "../models/FinancialTransaction.Model.js";

async function syncDonations() {
  try {
    await connectDB();
    console.log("Connected to database");

    // Get all completed donations
    const donations = await Donation.find({
      paymentStatus: "completed",
      amount: { $gt: 0 }
    });

    console.log(`Found ${donations.length} completed donations to sync`);

    let syncedCount = 0;
    let skippedCount = 0;

    for (const donation of donations) {
      try {
        // Check if financial transaction already exists for this donation
        const existingTransaction = await FinancialTransaction.findOne({
          referenceNumber: donation.stripePaymentIntentId || donation.stripeSessionId
        });

        if (existingTransaction) {
          console.log(`Skipping donation ${donation._id} - transaction already exists`);
          skippedCount++;
          continue;
        }

        // Create financial transaction
        const transaction = new FinancialTransaction({
          type: "income",
          category: "donations",
          subcategory: donation.donationType === "cause_specific" ? "cause donations" : "general donations",
          amount: donation.amount,
          description: `${donation.donationType === "cause_specific" ? "Cause-specific" : "General"} donation ${donation.isAnonymous ? "from anonymous donor" : `from ${donation.firstName} ${donation.lastName}`}`,
          date: donation.createdAt,
          paymentMethod: "card",
          referenceNumber: donation.stripePaymentIntentId || donation.stripeSessionId || `DON-${donation._id}`,
          relatedTo: "donation",
          relatedId: donation.causeId,
          status: "verified",
          verifiedBy: "system",
          verifiedAt: donation.createdAt,
          notes: `Donation ID: ${donation._id}, Email: ${donation.email}`,
          tags: ["donation", "stripe", donation.donationType],
          createdBy: "system@rspnorway.org",
        });

        await transaction.save();
        console.log(`Created transaction for donation ${donation._id}`);
        syncedCount++;

      } catch (error) {
        console.error(`Error syncing donation ${donation._id}:`, error);
      }
    }

    console.log(`\nSync completed:`);
    console.log(`- Successfully synced: ${syncedCount} donations`);
    console.log(`- Skipped (already synced): ${skippedCount} donations`);
    console.log(`- Total processed: ${donations.length} donations`);

  } catch (error) {
    console.error("Error syncing donations:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the sync
syncDonations();
