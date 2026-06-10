import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
	eventname: { type: String, required: true },
	eventdescription: { type: String, required: false },
	eventvenue: { type: String, required: false },
	eventdate: { type: String, required: false },
	eventtime: { type: String, required: false },
	eventposterUrl: { type: String, required: true },
	eventposter2Url: { type: String, required: false },
	eventposter3Url: { type: String, required: false },
	eventvideoUrl: { type: String, required: false },
	price: { type: Number, required: false, min: 0, default: 0 },
	studentPrice: { type: Number, required: false, min: 0, default: 0 },
	childPrice: { type: Number, required: false, min: 0, default: 0 },
	childAgeLimit: { type: String, required: false, default: "" },
	elderlyPrice: { type: Number, required: false, min: 0, default: 0 },
	elderlyAgeLimit: { type: String, required: false, default: "" },
	maximumSeats: { type: Number, required: false, min: 0, default: 0 },
	registeredSeats: { type: Number, required: false, min: 0, default: 0 },
	totalRegistrations: { type: Number, required: false, min: 0, default: 0 },
	totalCollection: { type: Number, required: false, min: 0, default: 0 },
	registrationEnabled: { type: Boolean, required: false, default: true },
	paymentCollectionEnabled: { type: Boolean, required: false, default: true },
	practicalInfo: { type: String, required: false },
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Event || mongoose.model("Event", eventSchema);
