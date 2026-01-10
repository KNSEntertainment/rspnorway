export default async function Gallery() {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
	const res = await fetch(`${baseUrl}/api/gallery`, { cache: "no-store" });
	const data = await res.json();
	const gallery = data.gallery || [];
	const images = gallery.flatMap((item) => (item.media || []).map((src) => ({ src, alt: item.alt || "Gallery image" })));

	// Import GalleryWrapper as a client component
	const GalleryWrapper = (await import("./GalleryWrapper")).default;
	return <GalleryWrapper images={images} />;
}
