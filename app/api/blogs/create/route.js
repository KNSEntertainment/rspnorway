import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/Blog.Model";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";
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

export async function POST(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user || session.user.role !== "admin") {
			return NextResponse.json({ success: false, error: "Unauthorized. Admin access required." }, { status: 401 });
		}

		await connectDB();

		const formData = await request.formData();
		console.log("Received form data: ", formData);

		const blogTitle_en = formData.get("blogTitle_en");
		const blogTitle_ne = formData.get("blogTitle_ne");
		const blogTitle_no = formData.get("blogTitle_no");
		const blogDesc_en = formData.get("blogDesc_en");
		const blogDesc_ne = formData.get("blogDesc_ne");
		const blogDesc_no = formData.get("blogDesc_no");
		const blogAuthor = formData.get("blogAuthor");
		const blogDate = formData.get("blogDate");
		console.log("Received blogDate:", blogDate);

		const blogMainPicture = formData.get("blogMainPicture");
		const blogSecondPicture = formData.get("blogSecondPicture");

		if (!blogMainPicture || !(blogMainPicture instanceof File) || blogMainPicture.size === 0) {
			return NextResponse.json({ success: false, error: "Main image is required and must be a valid file" }, { status: 400 });
		}

		if (!blogDate) {
			return NextResponse.json({ success: false, error: "Blog date is required" }, { status: 400 });
		}

		const cleanTitle_en = blogTitle_en?.trim() || "";
		const cleanTitle_ne = blogTitle_ne?.trim() || "";
		const cleanTitle_no = blogTitle_no?.trim() || "";

		const cleanDesc_en = !isEditorEmpty(blogDesc_en) ? blogDesc_en.trim() : "";
		const cleanDesc_ne = !isEditorEmpty(blogDesc_ne) ? blogDesc_ne.trim() : "";
		const cleanDesc_no = !isEditorEmpty(blogDesc_no) ? blogDesc_no.trim() : "";

		const hasEn = Boolean(cleanTitle_en && cleanDesc_en);
		const hasNe = Boolean(cleanTitle_ne && cleanDesc_ne);
		const hasNo = Boolean(cleanTitle_no && cleanDesc_no);

		if (!hasEn && !hasNe && !hasNo) {
			return NextResponse.json(
				{ success: false, error: "Title and description are required in at least one language (English, Nepali, or Norwegian)" },
				{ status: 400 }
			);
		}

		// Save the files to Cloudinary
		const blogMainPictureUrl = await uploadToCloudinary(blogMainPicture, "blogs_images");
		const blogSecondPictureUrl = (blogSecondPicture instanceof File && blogSecondPicture.size > 0)
			? await uploadToCloudinary(blogSecondPicture, "blogs_images")
			: "";

		const primaryTitle = cleanTitle_en || cleanTitle_ne || cleanTitle_no;
		const primaryDesc = cleanDesc_en || cleanDesc_ne || cleanDesc_no;
		const author = blogAuthor?.trim() || session?.user?.name || "PNSB-Norway";

		// Save blog to MongoDB
		console.log("Creating blog in database");
		const blog = await Blog.create({
			blogTitle_en: cleanTitle_en,
			blogTitle_ne: cleanTitle_ne,
			blogTitle_no: cleanTitle_no,
			blogDesc_en: cleanDesc_en,
			blogDesc_ne: cleanDesc_ne,
			blogDesc_no: cleanDesc_no,
			blogTitle: primaryTitle, // Legacy field
			blogDesc: primaryDesc, // Legacy field
			blogAuthor: author,
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
