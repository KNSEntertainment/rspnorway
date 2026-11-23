import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/Blog.Model";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/saveFileToCloudinaryUtils";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export const config = {
	api: {
		bodyParser: false,
	},
};

const isEditorEmpty = (html) => {
	if (!html || typeof html !== "string") return true;
	if (/<(img|iframe|video|audio)/i.test(html)) return false;
	const text = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
	return text.length === 0;
};

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
		const session = await getServerSession(authOptions);
		if (!session?.user || session.user.role !== "admin") {
			return NextResponse.json({ success: false, error: "Unauthorized. Admin access required." }, { status: 401 });
		}

		await connectDB();

		// Fetch form data
		const formData = await request.formData();

		// Get existing blog from DB
		const existingBlog = await Blog.findById(id);
		if (!existingBlog) {
			return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
		}

		// Update text fields (use existing value if not provided in formData)
		const blogTitle_en = formData.has("blogTitle_en") ? formData.get("blogTitle_en")?.trim() || "" : (existingBlog.blogTitle_en || "");
		const blogTitle_ne = formData.has("blogTitle_ne") ? formData.get("blogTitle_ne")?.trim() || "" : (existingBlog.blogTitle_ne || "");
		const blogTitle_no = formData.has("blogTitle_no") ? formData.get("blogTitle_no")?.trim() || "" : (existingBlog.blogTitle_no || "");

		const blogDesc_en = formData.has("blogDesc_en") ? (!isEditorEmpty(formData.get("blogDesc_en")) ? formData.get("blogDesc_en").trim() : "") : (existingBlog.blogDesc_en || "");
		const blogDesc_ne = formData.has("blogDesc_ne") ? (!isEditorEmpty(formData.get("blogDesc_ne")) ? formData.get("blogDesc_ne").trim() : "") : (existingBlog.blogDesc_ne || "");
		const blogDesc_no = formData.has("blogDesc_no") ? (!isEditorEmpty(formData.get("blogDesc_no")) ? formData.get("blogDesc_no").trim() : "") : (existingBlog.blogDesc_no || "");

		const blogDate = formData.has("blogDate") ? formData.get("blogDate") : existingBlog.blogDate;
		const blogAuthor = formData.has("blogAuthor") ? formData.get("blogAuthor") : existingBlog.blogAuthor;

		const hasEn = Boolean(blogTitle_en && blogDesc_en);
		const hasNe = Boolean(blogTitle_ne && blogDesc_ne);
		const hasNo = Boolean(blogTitle_no && blogDesc_no);

		if (!hasEn && !hasNe && !hasNo) {
			return NextResponse.json(
				{ success: false, error: "Title and description are required in at least one language (English, Nepali, or Norwegian)" },
				{ status: 400 }
			);
		}

		// Handle images
		let blogMainPictureUrl = existingBlog.blogMainPicture;
		let blogSecondPictureUrl = existingBlog.blogSecondPicture;
		let oldMainPictureUrl = null;
		let oldSecondPictureUrl = null;

		// Update main picture if a new file is provided
		const newMainPic = formData.get("blogMainPicture");
		if (newMainPic instanceof File && newMainPic.size > 0) {
			oldMainPictureUrl = existingBlog.blogMainPicture || null;
			blogMainPictureUrl = await uploadToCloudinary(newMainPic, "blogs_images");
		}

		// Update second picture if a new file is provided
		const newSecondPic = formData.get("blogSecondPicture");
		if (newSecondPic instanceof File && newSecondPic.size > 0) {
			oldSecondPictureUrl = existingBlog.blogSecondPicture || null;
			blogSecondPictureUrl = await uploadToCloudinary(newSecondPic, "blogs_images");
		}

		const primaryTitle = blogTitle_en || blogTitle_ne || blogTitle_no || existingBlog.blogTitle;
		const primaryDesc = blogDesc_en || blogDesc_ne || blogDesc_no || existingBlog.blogDesc;

		// Update the blog in the database
		existingBlog.blogTitle_en = blogTitle_en;
		existingBlog.blogTitle_ne = blogTitle_ne;
		existingBlog.blogTitle_no = blogTitle_no;
		existingBlog.blogDesc_en = blogDesc_en;
		existingBlog.blogDesc_ne = blogDesc_ne;
		existingBlog.blogDesc_no = blogDesc_no;
		existingBlog.blogTitle = primaryTitle; // Legacy field
		existingBlog.blogDesc = primaryDesc; // Legacy field
		existingBlog.blogDate = blogDate;
		existingBlog.blogAuthor = blogAuthor || existingBlog.blogAuthor || "PNSB-Norway";
		existingBlog.blogMainPicture = blogMainPictureUrl;
		existingBlog.blogSecondPicture = blogSecondPictureUrl;

		await existingBlog.save();

		if (oldMainPictureUrl && blogMainPictureUrl && oldMainPictureUrl !== blogMainPictureUrl) {
			try {
				await deleteFromCloudinary(oldMainPictureUrl, "image");
			} catch (deleteError) {
				console.error("Failed to delete old blog main image from Cloudinary:", deleteError);
			}
		}

		if (oldSecondPictureUrl && blogSecondPictureUrl && oldSecondPictureUrl !== blogSecondPictureUrl) {
			try {
				await deleteFromCloudinary(oldSecondPictureUrl, "image");
			} catch (deleteError) {
				console.error("Failed to delete old blog secondary image from Cloudinary:", deleteError);
			}
		}

		return NextResponse.json({ success: true, blog: existingBlog }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function DELETE(request, { params }) {
	const { id } = await params;

	try {
		const session = await getServerSession(authOptions);
		if (!session?.user || session.user.role !== "admin") {
			return NextResponse.json({ success: false, error: "Unauthorized. Admin access required." }, { status: 401 });
		}

		await connectDB();

		console.log("Deleting blog with ID:", id);

		const deletedblog = await Blog.findByIdAndDelete(id);

		if (!deletedblog) {
			return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
		}

		if (deletedblog.blogMainPicture) {
			try {
				await deleteFromCloudinary(deletedblog.blogMainPicture, "image");
			} catch (deleteError) {
				console.error("Failed to delete blog main image from Cloudinary:", deleteError);
			}
		}

		if (deletedblog.blogSecondPicture) {
			try {
				await deleteFromCloudinary(deletedblog.blogSecondPicture, "image");
			} catch (deleteError) {
				console.error("Failed to delete blog secondary image from Cloudinary:", deleteError);
			}
		}

		return NextResponse.json({ success: true, message: "Blog deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
