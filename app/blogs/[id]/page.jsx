import BlogPageClient from "./BlogPageClient";
import getBlogDetails from "@/lib/getBlogDetails";

export default async function BlogPage({ params }) {
	const { id } = await params;
	const blogData = await getBlogDetails(id);
	return <BlogPageClient blogData={blogData} />;
}
