import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/Blog.Model";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export const config = {
	api: {
		bodyParser: false,
	},
};

export async function POST(request) {
	try {
		await connectDB();

		const formData = await request.formData();
		console.log("Received form data: ", formData);

		const blogTitle = formData.get("blogTitle");
		const blogDesc = formData.get("blogDesc");
		const blogAuthor = formData.get("blogAuthor");
		const blogDate = formData.get("blogDate");
		console.log("Received blogDate:", blogDate);

		const blogMainPicture = formData.get("blogMainPicture");
		const blogSecondPicture = formData.get("blogSecondPicture");

		console.log("blogMainPicture type:", typeof blogMainPicture);
		console.log("blogSecondPicture type:", typeof blogSecondPicture);

		if (!(blogMainPicture instanceof File)) {
			throw new Error("blogMainPicture must be a File object");
		}

		// Validate required fields
		if (!blogTitle || !blogDesc || !blogMainPicture || !blogDate) {
			return NextResponse.json({ success: false, error: "Either title, description, main image or date is/are missing" }, { status: 400 });
		}

		// Save the files to the uploads directory
		const blogMainPictureUrl = await uploadToCloudinary(blogMainPicture, "blogs_images");
		const blogSecondPictureUrl = blogSecondPicture ? await uploadToCloudinary(blogSecondPicture, "blogs_images") : "";

		// Save blog to MongoDB
		console.log("Creating blog in database");
		const blog = await Blog.create({
			blogTitle,
			blogDesc,
			blogAuthor,
			blogMainPicture: blogMainPictureUrl,
			blogSecondPicture: blogSecondPictureUrl,
			blogDate: blogDate,
		});
		console.log("Blog created successfully:", blog);

		return NextResponse.json({ success: true, blog }, { status: 201 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
