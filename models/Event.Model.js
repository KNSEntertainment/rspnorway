import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
	eventname: { type: String, required: true },
	eventdescription: { type: String, required: false },
	eventvenue: { type: String, required: false },
	eventdate: { type: String, required: false },
	classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", default: null },
	classLabel: { type: String, default: "" },
	createdBy: { type: String, default: "" },
	eventtime: { type: String, required: false },
	eventposterUrl: { type: String, required: true },
	eventposter2Url: { type: String, required: false },
	eventposter3Url: { type: String, required: false },
	eventvideoUrl: { type: String, required: false },
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Event || mongoose.model("Event", eventSchema);
