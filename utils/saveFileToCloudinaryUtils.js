import cloudinary from "cloudinary";
import { Readable } from "stream";

cloudinary.v2.config({
	cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(file, folder = "default_folder") {
	return new Promise(async (resolve, reject) => {
		try {
			const buffer = Buffer.from(await file.arrayBuffer());

			// Determine resource type based on file type
			const isVideo = file.type.startsWith("video/");
			const resourceType = isVideo ? "video" : "image";

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
