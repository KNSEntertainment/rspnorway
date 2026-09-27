import connectDB from "@/lib/mongodb";
import Event from "@/models/Event.Model";

export async function getEvents() {
	await connectDB();
	return Event.find().sort({ eventdate: -1 }).lean();
}

export async function getEventById(id: string) {
	await connectDB();
	try {
		return await Event.findById(id).lean();
	} catch (error) {
		console.error("Error finding event by id:", error);
		return null;
	}
}
