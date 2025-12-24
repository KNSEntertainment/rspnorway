import BlogPageClient from "./BlogPageClient";

export default async function BlogPage({ params }) {
	const { id } = await params;
	return <BlogPageClient blogData={id} />;
}
