import BlogPageClient from "./BlogPageClient";

export default async function BlogPage({ params }) {
	const { id } = params;
	let blogData = null;
	let blogsData = null;
	try {
		// Fetch main blog
		const blogRes = await fetch(`/api/blogs/${id}`, { cache: "no-store" });
		if (blogRes.ok) {
			blogData = await blogRes.json();
		}
		// Fetch all blogs for sidebar
		const blogsRes = await fetch(`/api/blogs`, { cache: "no-store" });
		if (blogsRes.ok) {
			blogsData = await blogsRes.json();
		}
	} catch {
		// Optionally log error
	}
	return <BlogPageClient blogData={blogData} blogsData={blogsData} />;
}
