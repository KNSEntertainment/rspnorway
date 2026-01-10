import Circular from "@/models/Circular.Model";
import DBConnect from "@/lib/mongodb";

export async function getPublishedCirculars() {
	await DBConnect();
	return Circular.find({ publicationStatus: "published" }).sort({ circularPublishedAt: -1 });
}

export async function getCircularBySlug(slug: string) {
	await DBConnect();
	return Circular.findOne({ slug, publicationStatus: "published" });
}
