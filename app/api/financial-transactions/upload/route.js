import {  NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.formData();
    const file = data.get("file");
    const oldPublicId = data.get("oldPublicId"); // For replacing existing files
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg", 
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Only images, PDFs and documents are allowed." 
      }, { status: 400 });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "File too large. Maximum size is 10MB." 
      }, { status: 400 });
    }

    // Delete old file from Cloudinary if it exists
    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, {
          resource_type: oldPublicId.includes('pdf') ? 'raw' : 'auto'
        });
        console.log('Deleted old file from Cloudinary:', oldPublicId);
      } catch (error) {
        console.error('Error deleting old file from Cloudinary:', error);
        // Continue with upload even if deletion fails
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename and folder structure
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `financial-docs/${uuidv4()}.${fileExtension}`;
    
    // Determine resource type based on file type
    let resourceType = 'auto';
    if (file.type.startsWith('image/')) {
      resourceType = 'image';
    } else if (file.type === 'application/pdf') {
      resourceType = 'raw';
    } else {
      resourceType = 'raw';
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          public_id: uniqueFilename,
          resource_type: resourceType,
          folder: 'financial-documents',
          format: fileExtension,
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    // Return file information
    return NextResponse.json({
      filename: uniqueFilename,
      originalName: file.name,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      size: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
