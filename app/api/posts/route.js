import connectDB from "@/lib/mongodb";
import Post from "@/models/Post.Model";
import { NextResponse } from "next/server";

// Fetch all posts (GET)
export async function GET() {
	await connectDB();
	const posts = await Post.find({});
	return NextResponse.json(posts);
}

// Create new post (POST)
export async function POST(req) {
	await connectDB();
	const body = await req.json();
	const newPost = await Post.create(body);
	return NextResponse.json(newPost, { status: 201 });
}

// Update post (PUT)
export async function PUT(req) {
	await connectDB();
	const { id, ...updateData } = await req.json();
	const updatedPost = await Post.findByIdAndUpdate(id, updateData, { new: true });
	return NextResponse.json(updatedPost);
}

// Delete post (DELETE)
export async function DELETE(req) {
	await connectDB();
	const { id } = await req.json();
	await Post.findByIdAndDelete(id);
	return NextResponse.json({ message: "Post deleted" });
}
