import mongoose from "mongoose";
import connectDB from "../lib/mongodb.js";
import EventRegistration from "../models/EventRegistration.Model.js";
import Event from "../models/Event.Model.js";
import FinancialTransaction from "../models/FinancialTransaction.Model.js";

async function syncEventRegistrations() {
  try {
    await connectDB();
    console.log("Connected to database");

    // Get all event registrations
    const registrations = await EventRegistration.find({
      paymentStatus: "completed",
      totalAmount: { $gt: 0 }
    }).populate('eventId');

    console.log(`Found ${registrations.length} completed event registrations to sync`);

    let syncedCount = 0;
    let skippedCount = 0;

    for (const registration of registrations) {
      try {
        // Check if financial transaction already exists for this registration
        const existingTransaction = await FinancialTransaction.findOne({
          referenceNumber: registration.registrationId
        });

        if (existingTransaction) {
          console.log(`Skipping registration ${registration.registrationId} - transaction already exists`);
          skippedCount++;
          continue;
        }

        // Create financial transaction
        const transaction = new FinancialTransaction({
          type: "income",
          category: "event revenue",
          subcategory: "ticket sales",
          amount: registration.totalAmount,
          description: `Event registration for ${registration.eventId?.eventname || 'Unknown Event'} - ${registration.adults} adult(s)${registration.children > 0 ? `, ${registration.children} child(ren)` : ''}`,
          date: registration.createdAt,
          paymentMethod: "online",
          referenceNumber: registration.registrationId,
          relatedTo: "event",
          relatedId: registration.eventId?._id,
          eventId: registration.eventId?._id,
          status: "verified",
          verifiedBy: "system",
          verifiedAt: registration.createdAt,
          notes: `Registration ID: ${registration.registrationId}, Attendees: ${registration.firstName} ${registration.lastName} (${registration.email})`,
          tags: ["event-registration", "ticket-sales", registration.eventId?.eventname?.toLowerCase().replace(/\s+/g, '-') || 'unknown-event'],
          createdBy: "system@pnsbnorway.org",
        });

        await transaction.save();
        console.log(`Created transaction for registration ${registration.registrationId}`);
        syncedCount++;

      } catch (error) {
        console.error(`Error syncing registration ${registration.registrationId}:`, error);
      }
    }

    console.log(`\nSync completed:`);
    console.log(`- Successfully synced: ${syncedCount} registrations`);
    console.log(`- Skipped (already synced): ${skippedCount} registrations`);
    console.log(`- Total processed: ${registrations.length} registrations`);

  } catch (error) {
    console.error("Error syncing event registrations:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the sync
syncEventRegistrations();
