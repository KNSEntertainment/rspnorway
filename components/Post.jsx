"use client";

import { useEffect, useState } from "react";

export default function BlogPosts() {
	const [posts, setPosts] = useState([]);
	const [formData, setFormData] = useState({
		title: "",
		content: "",
		author: "",
	});
	const [editingId, setEditingId] = useState(null); // Track post being edited

	// Fetch posts on page load
	useEffect(() => {
		fetchPosts();
	}, []);

	async function fetchPosts() {
		const res = await fetch("/api/posts");
		const data = await res.json();
		setPosts(data);
	}

	// Handle input change
	function handleChange(e) {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	}

	// Handle form submission for create or update
	async function handleSubmit(e) {
		e.preventDefault();
		if (editingId) {
			await fetch("/api/posts", {
				method: "PUT",
				body: JSON.stringify({ id: editingId, ...formData }),
				headers: { "Content-Type": "application/json" },
			});
			setEditingId(null);
		} else {
			await fetch("/api/posts", {
				method: "POST",
				body: JSON.stringify(formData),
				headers: { "Content-Type": "application/json" },
			});
		}
		setFormData({ title: "", content: "", author: "" }); // Reset form
		fetchPosts(); // Refresh data
	}

	// Handle delete post
	async function handleDelete(id) {
		await fetch("/api/posts", {
			method: "DELETE",
			body: JSON.stringify({ id }),
			headers: { "Content-Type": "application/json" },
		});
		fetchPosts();
	}

	// Handle edit post (populate form)
	function handleEdit(post) {
		setFormData({
			title: post.title,
			content: post.content,
			author: post.author,
		});
		setEditingId(post._id);
	}

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">Manage Blog Posts</h1>

			{/* Form for creating/updating a post */}
			<form onSubmit={handleSubmit} className="bg-gray-100 p-4 mb-4 rounded">
				<input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} className="border p-2 w-full mb-2" required />
				<textarea name="content" placeholder="Content" value={formData.content} onChange={handleChange} className="border p-2 w-full mb-2" required />
				<input type="text" name="author" placeholder="Author" value={formData.author} onChange={handleChange} className="border p-2 w-full mb-2" required />

				<button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
					{editingId ? "Update Post" : "Add Post"}
				</button>
			</form>

			{/* Table displaying blog posts */}
			<table className="w-full border-collapse border border-gray-300">
				<thead>
					<tr className="bg-gray-200">
						<th className="border p-2">Title</th>
						<th className="border p-2">Content</th>
						<th className="border p-2">Author</th>
						<th className="border p-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					{posts.map((post) => (
						<tr key={post._id} className="border">
							<td className="border p-2">{post.title}</td>
							<td className="border p-2">{post.content}</td>
							<td className="border p-2">{post.author}</td>
							<td className="border p-2">
								<button onClick={() => handleEdit(post)} className="bg-yellow-500 text-white px-3 py-1 rounded mr-2">
									Edit
								</button>
								<button onClick={() => handleDelete(post._id)} className="bg-red-500 text-white px-3 py-1 rounded">
									Delete
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
