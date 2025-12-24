async function getBlogDetails(id) {
	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs/${id}`, {
			cache: "no-store",
		});
		if (!res.ok) {
			throw new Error("Failed to fetch blog");
		}
		return await res.json();
	} catch (error) {
		console.error("Error fetching blog:", error);
		return null;
	}
}

export default getBlogDetails;
