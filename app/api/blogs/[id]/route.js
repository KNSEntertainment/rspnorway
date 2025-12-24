import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/Blog.Model";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";
import cloudinary from "cloudinary";

export const config = {
	api: {
		bodyParser: false,
	},
};

function extractPublicId(cloudinaryUrl) {
	try {
		const urlParts = cloudinaryUrl.split("/");
		const versionAndId = urlParts.slice(-2).join("/"); // Extract version and ID
		const publicIdWithExtension = versionAndId.split(".")[0]; // Remove file extension
		return publicIdWithExtension;
	} catch (error) {
		console.error("Error extracting public ID:", error);
		return null;
	}
}
export async function GET(req, { params }) {
	const { id } = await params;
	console.log("Received ID:", id);

	await connectDB();

	try {
		const blog = await Blog.findById(id);

		if (!blog) {
			console.error("Blog not found:", id);
			return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, blog });
	} catch (error) {
		console.error("Error fetching blog:", error);
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}

export async function PUT(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		// Fetch form data
		const formData = await request.formData();

		// Get existing blog from DB
		const existingBlog = await Blog.findById(id);
		if (!existingBlog) {
			return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
		}

		// Update text fields
		const blogTitle = formData.get("blogTitle") || existingBlog.blogTitle;
		const blogDesc = formData.get("blogDesc") || existingBlog.blogDesc;
		// const blogAuthor = formData.get("blogAuthor") || existingBlog.blogAuthor;
		const blogDate = formData.get("blogDate") || existingBlog.blogDate;

		// Handle images
		let blogMainPictureUrl = existingBlog.blogMainPicture;
		let blogSecondPictureUrl = existingBlog.blogSecondPicture;

		// Update main picture if a new file is provided
		if (formData.get("blogMainPicture")) {
			if (existingBlog.blogMainPicture) {
				const mainPictureId = extractPublicId(existingBlog.blogMainPicture);
				if (mainPictureId) await cloudinary.v2.uploader.destroy(mainPictureId);
			}
			blogMainPictureUrl = await uploadToCloudinary(formData.get("blogMainPicture"), "blogs_images");
		}

		// Update second picture if a new file is provided
		if (formData.get("blogSecondPicture")) {
			if (existingBlog.blogSecondPicture) {
				const secondPictureId = extractPublicId(existingBlog.blogSecondPicture);
				if (secondPictureId) await cloudinary.v2.uploader.destroy(secondPictureId);
			}
			blogSecondPictureUrl = await uploadToCloudinary(formData.get("blogSecondPicture"), "blogs_images");
		}

		// Update the blog in the database
		existingBlog.blogTitle = blogTitle;
		existingBlog.blogDesc = blogDesc;
		// existingBlog.blogAuthor = blogAuthor;
		existingBlog.blogDate = blogDate;
		existingBlog.blogMainPicture = blogMainPictureUrl;
		existingBlog.blogSecondPicture = blogSecondPictureUrl;

		await existingBlog.save();

		return NextResponse.json({ success: true, blog: existingBlog }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function DELETE(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		console.log("Deleting blog with ID:", id);

		const deletedblog = await Blog.findByIdAndDelete(id);

		if (!deletedblog) {
			return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
		}

		// Delete the main picture from Cloudinary
		// if (deletedblog.blogMainPicture) {
		// 	const mainPictureId = extractPublicId(deletedblog.blogMainPicture);
		// 	if (mainPictureId) {
		// 		await cloudinary.v2.uploader.destroy(mainPictureId);
		// 	}
		// }

		// Delete the second picture from Cloudinary
		// if (deletedblog.blogSecondPicture) {
		// 	const secondPictureId = extractPublicId(deletedblog.blogSecondPicture);
		// 	if (secondPictureId) {
		// 		await cloudinary.v2.uploader.destroy(secondPictureId);
		// 	}
		// }

		return NextResponse.json({ success: true, message: "Blog deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
