const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
	const envContent = fs.readFileSync(envPath, "utf8");
	for (const line of envContent.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const separatorIndex = trimmed.indexOf("=");
		if (separatorIndex === -1) continue;
		const key = trimmed.slice(0, separatorIndex).trim();
		const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
		if (!process.env[key]) process.env[key] = value;
	}
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
	throw new Error("Please define MONGODB_URI environment variable");
}

const eventSchema = new mongoose.Schema(
	{
		eventname: String,
		eventdescription: String,
		eventvenue: String,
		eventdate: String,
		eventtime: String,
		eventposterUrl: String,
		eventposter2Url: String,
		eventposter3Url: String,
		eventvideoUrl: String,
		price: { type: Number, default: 0 },
		studentPrice: { type: Number, default: 0 },
		maximumSeats: { type: Number, default: 0 },
		registeredSeats: { type: Number, default: 0 },
		totalRegistrations: { type: Number, default: 0 },
		totalCollection: { type: Number, default: 0 },
		registrationEnabled: { type: Boolean, default: true },
		paymentCollectionEnabled: { type: Boolean, default: true },
		practicalInfo: { type: String, default: "" },
	},
	{ strict: false }
);

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

const defaultFields = {
	price: 0,
	studentPrice: 0,
	maximumSeats: 0,
	registeredSeats: 0,
	totalRegistrations: 0,
	totalCollection: 0,
	registrationEnabled: true,
	paymentCollectionEnabled: true,
	practicalInfo: "",
};

async function backfillEventFields() {
	await mongoose.connect(MONGODB_URI, { bufferCommands: false });

	const events = await Event.find({}).lean();
	console.log(`Found ${events.length} event document(s)`);

	let updatedCount = 0;
	let unchangedCount = 0;

	for (const event of events) {
		const $set = {};
		for (const [key, value] of Object.entries(defaultFields)) {
			if (event[key] === undefined || event[key] === null) {
				$set[key] = value;
			}
		}

		if (Object.keys($set).length === 0) {
			unchangedCount += 1;
			console.log(`- No missing fields: ${event._id} (${event.eventname || "Untitled event"})`);
			continue;
		}

		await Event.updateOne({ _id: event._id }, { $set });
		updatedCount += 1;
		console.log(`✓ Updated ${event._id} (${event.eventname || "Untitled event"}) with fields: ${Object.keys($set).join(", ")}`);
	}

	console.log(`Backfill complete. Updated: ${updatedCount}, unchanged: ${unchangedCount}`);
	await mongoose.disconnect();
}

backfillEventFields().catch(async (error) => {
	console.error("Event field backfill failed:", error);
	await mongoose.disconnect();
	process.exit(1);
});
