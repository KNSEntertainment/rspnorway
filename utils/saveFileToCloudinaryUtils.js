import cloudinary from "cloudinary";
import { Readable } from "stream";

cloudinary.v2.config({
	cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to extract public_id from a Cloudinary URL
// Works for images, videos, and raw files (e.g., PDFs, docs, zips)
function getCloudinaryPublicId(url, isRaw = false) {
	if (!url) return null;
	// Find the part after '/upload/'
	const uploadIndex = url.indexOf("/upload/");
	if (uploadIndex === -1) return null;
	let publicIdWithExt = url.substring(uploadIndex + 8); // after '/upload/'
	// Remove query params if any
	publicIdWithExt = publicIdWithExt.split("?")[0];
	// Remove version number if present (e.g., v12345/)
	publicIdWithExt = publicIdWithExt.replace(/^v[0-9]+\//, "");
	if (isRaw) {
		return publicIdWithExt; // raw files retain the extension in public_id
	}
	// Find the last dot after the last slash
	const lastSlash = publicIdWithExt.lastIndexOf("/");
	const lastDot = publicIdWithExt.lastIndexOf(".");
	if (lastDot > lastSlash) {
		return publicIdWithExt.substring(0, lastDot);
	}
	return publicIdWithExt;
}

// Delete a file from Cloudinary (supports image, video, and raw files)
export async function deleteFromCloudinary(url, resourceType) {
	if (!url) return;
	// Auto-detect resourceType if not provided
	if (!resourceType) {
		// Guess resource type from file extension
		const ext = url.split(".").pop()?.toLowerCase();
		if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff", "svg"].includes(ext)) {
			resourceType = "image";
		} else if (["mp4", "mov", "avi", "wmv", "flv", "mkv", "webm"].includes(ext)) {
			resourceType = "video";
		} else {
			resourceType = "raw";
		}
	}

	const isRaw = resourceType === "raw";
	const publicId = getCloudinaryPublicId(url, isRaw);
	if (!publicId) {
		console.error("Cloudinary delete: Could not extract public_id from URL", url);
		return;
	}

	return new Promise((resolve) => {
		cloudinary.v2.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
			if (error || (result && result.result === "not found" && isRaw)) {
				// Fallback: If raw was not found with extension, try without extension
				const alternateId = getCloudinaryPublicId(url, false);
				if (alternateId && alternateId !== publicId) {
					try {
						cloudinary.v2.uploader.destroy(alternateId, { resource_type: resourceType }, (_err2, res2) => {
							resolve(res2 || result);
						});
						return;
					} catch {
						// ignore
					}
				}
				resolve(result);
			} else {
				resolve(result);
			}
		});
	});
}

// Upload a file to Cloudinary (supports image, video, and raw files)
export async function uploadToCloudinary(file, folder = "default_folder") {
	return new Promise(async (resolve, reject) => {
		try {
			const buffer = Buffer.from(await file.arrayBuffer());

			// Determine resource type based on file type
			let resourceType = "image";
			if (file.type.startsWith("video/")) {
				resourceType = "video";
			} else if (!file.type.startsWith("image/")) {
				resourceType = "raw";
			}

			const stream = cloudinary.v2.uploader.upload_stream(
				{
					resource_type: resourceType,
					folder,
				},
				(error, result) => {
					if (error) {
						reject(error);
					} else {
						resolve(result.secure_url);
					}
				}
			);

			Readable.from(buffer).pipe(stream);
		} catch (error) {
			reject(error);
		}
	});
}
