import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";

export default function BlogForm({ handleCloseBlogModal, blogToEdit = null }) {
	const [formData, setFormData] = useState({
		blogTitle: "",
		blogDesc: "",
		// blogAuthor: "",
		blogMainPicture: null,
		blogSecondPicture: null,
		blogDate: "",
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				paragraph: true,
			}),
			Link.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: "text-blue-600 underline",
				},
			}),
			Image,
			Underline,
			Placeholder.configure({
				placeholder: "Start writing your blog content here...",
			}),
		],
		content: formData.blogDesc,
		onUpdate: ({ editor }) => {
			setFormData({ ...formData, blogDesc: editor.getHTML() });
		},
		editorProps: {
			attributes: {
				class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none w-full p-2 min-h-[200px]",
			},
		},
	});

	useEffect(() => {
		if (blogToEdit) {
			setFormData({
				...blogToEdit,
				blogMainPicture: null,
				blogSecondPicture: null,
			});

			if (editor && blogToEdit.blogDesc) {
				editor.commands.setContent(blogToEdit.blogDesc);
			}
		}
	}, [blogToEdit, editor]);

	useEffect(() => {
		const style = document.createElement("style");
		style.innerHTML = `
			.ProseMirror p {
				margin: 0.5em 0;
			}
			.ProseMirror h1, .ProseMirror h2, .ProseMirror h3, .ProseMirror h4 {
				margin: 1em 0 0.5em;
				font-weight: bold;
			}
			.ProseMirror h2 {
				font-size: 1.5em;
			}
			.ProseMirror ul, .ProseMirror ol {
				padding-left: 1.5em;
				margin: 0.5em 0;
			}
			.ProseMirror ul {
				list-style-type: disc;
			}
			.ProseMirror ol {
				list-style-type: decimal;
			}
			.ProseMirror a {
				color: #3b82f6;
				text-decoration: underline;
			}
			.ProseMirror strong {
				font-weight: bold;
			}
			.ProseMirror em {
				font-style: italic;
			}
			.ProseMirror u {
				text-decoration: underline;
			}
			.ProseMirror blockquote {
				border-left: 3px solid #e5e7eb;
				padding-left: 1em;
				margin-left: 0;
				margin-right: 0;
			}
			.ProseMirror p.is-editor-empty:first-child::before {
				content: attr(data-placeholder);
				float: left;
				color: #adb5bd;
				pointer-events: none;
				height: 0;
			}
		`;
		document.head.appendChild(style);

		return () => {
			document.head.removeChild(style);
		};
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSubmitting(true);

		try {
			const form = new FormData();
			Object.keys(formData).forEach((key) => {
				if (formData[key]) {
					form.append(key, formData[key]);
				}
			});

			const url = blogToEdit ? `/api/blogs/${blogToEdit._id}` : "/api/blogs/create";
			const method = blogToEdit ? "PUT" : "POST";

			const response = await fetch(url, {
				method: method,
				body: form,
			});

			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.error || `Failed to ${blogToEdit ? "update" : "create"} blog`);
			}

			if (result.success) {
				setFormData({
					blogTitle: "",
					blogDesc: "",
					// blogAuthor: "",
					blogMainPicture: null,
					blogSecondPicture: null,
					blogDate: "",
				});

				if (editor) {
					editor.commands.setContent("");
				}

				alert(`Blog ${blogToEdit ? "updated" : "created"} successfully!`);
				handleCloseBlogModal();
			}
		} catch (error) {
			setError(error.message);
			console.error(`Error ${blogToEdit ? "updating" : "creating"} blog:`, error);
		} finally {
			setSubmitting(false);
		}
	};

	const RichTextToolbar = () => {
		if (!editor) return null;

		return (
			<div className="border border-b-0 rounded-t p-2 flex flex-wrap gap-1 bg-gray-50">
				<button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1 rounded ${editor.isActive("bold") ? "bg-blue-100 text-blue-700 border border-blue-300" : "hover:bg-gray-100"}`} title="Bold">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
						<path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
					</svg>
				</button>
				<button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1 rounded ${editor.isActive("italic") ? "bg-blue-100 text-blue-700 border border-blue-300" : "hover:bg-gray-100"}`} title="Italic">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
						<line x1="19" y1="4" x2="10" y2="4"></line>
						<line x1="14" y1="20" x2="5" y2="20"></line>
						<line x1="15" y1="4" x2="9" y2="20"></line>
					</svg>
				</button>
				<button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1 rounded ${editor.isActive("underline") ? "bg-blue-100 text-blue-700 border border-blue-300" : "hover:bg-gray-100"}`} title="Underline">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
						<line x1="4" y1="21" x2="20" y2="21"></line>
					</svg>
				</button>
				<button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-1 rounded ${editor.isActive("heading", { level: 2 }) ? "bg-blue-100 text-blue-700 border border-blue-300" : "hover:bg-gray-100"}`} title="Heading">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M6 4v16M18 4v16M6 12h12"></path>
					</svg>
				</button>
				<button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1 rounded ${editor.isActive("bulletList") ? "bg-blue-100 text-blue-700 border border-blue-300" : "hover:bg-gray-100"}`} title="Bullet List">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
						<line x1="9" y1="6" x2="20" y2="6"></line>
						<line x1="9" y1="12" x2="20" y2="12"></line>
						<line x1="9" y1="18" x2="20" y2="18"></line>
						<circle cx="4" cy="6" r="2"></circle>
						<circle cx="4" cy="12" r="2"></circle>
						<circle cx="4" cy="18" r="2"></circle>
					</svg>
				</button>
				<button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1 rounded ${editor.isActive("orderedList") ? "bg-blue-100 text-blue-700 border border-blue-300" : "hover:bg-gray-100"}`} title="Numbered List">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
						<line x1="10" y1="6" x2="21" y2="6"></line>
						<line x1="10" y1="12" x2="21" y2="12"></line>
						<line x1="10" y1="18" x2="21" y2="18"></line>
						<path d="M4 6h1v4"></path>
						<path d="M4 10h2"></path>
						<path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
					</svg>
				</button>
				<button
					type="button"
					onClick={() => {
						const url = window.prompt("Enter the URL");
						if (url) {
							editor.chain().focus().setLink({ href: url }).run();
						}
					}}
					className={`p-1 rounded ${editor.isActive("link") ? "bg-blue-100 text-blue-700 border border-blue-300" : "hover:bg-gray-100"}`}
					title="Link"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
						<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
					</svg>
				</button>
				<button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-1 rounded hover:bg-gray-100 disabled:opacity-50" title="Undo">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M9 14 4 9l5-5"></path>
						<path d="M4 9h12a4 4 0 0 1 0 8H9"></path>
					</svg>
				</button>
				<button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-1 rounded hover:bg-gray-100 disabled:opacity-50" title="Redo">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="m15 14 5-5-5-5"></path>
						<path d="M20 9H8a4 4 0 0 0 0 8h7"></path>
					</svg>
				</button>
			</div>
		);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-scroll">
			{error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
			<div>
				<label htmlFor="blogTitle" className="block mb-2 font-bold">
					Blog Title
				</label>
				<input type="text" id="blogTitle" value={formData.blogTitle} onChange={(e) => setFormData({ ...formData, blogTitle: e.target.value })} className="w-full p-2 border rounded" required />
			</div>
			<div>
				<label htmlFor="blogDesc" className="block mb-2 font-bold">
					Blog Description
				</label>
				<div className="border rounded overflow-hidden">
					<RichTextToolbar />
					<EditorContent editor={editor} className="border-t" />
				</div>
			</div>
			{/* <div>
				<label htmlFor="blogAuthor" className="block mb-2 font-bold">
					Blog Author
				</label>
				<input type="text" id="blogAuthor" value={formData.blogAuthor} onChange={(e) => setFormData({ ...formData, blogAuthor: e.target.value })} className="w-full p-2 border rounded" />
			</div> */}
			<div>
				<label htmlFor="blogMainPicture" className="block mb-2 font-bold">
					Blog Main Picture
				</label>
				<input type="file" id="blogMainPicture" onChange={(e) => setFormData({ ...formData, blogMainPicture: e.target.files[0] })} className="w-full p-2 border rounded" />
			</div>
			<div>
				<label htmlFor="blogSecondPicture" className="block mb-2 font-bold">
					Blog Second Picture
				</label>
				<input type="file" id="blogSecondPicture" onChange={(e) => setFormData({ ...formData, blogSecondPicture: e.target.files[0] })} className="w-full p-2 border rounded" />
			</div>
			<div>
				<label htmlFor="blogDate" className="block mb-2 font-bold">
					Blog Date
				</label>
				<input
					type="date"
					id="blogDate"
					value={formData.blogDate}
					onChange={(e) => {
						console.log("Selected date:", e.target.value); // Debug
						setFormData({ ...formData, blogDate: e.target.value });
					}}
					className="w-full p-2 border rounded"
				/>
			</div>
			<div className="grid grid-cols-2 gap-2">
				<button type="submit" disabled={submitting} className={`w-full p-1.5 rounded ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"} text-slate-200 font-bold`}>
					{submitting ? `${blogToEdit ? "Updating" : "Creating"} Blog...` : `${blogToEdit ? "Update" : "Create"} Blog`}
				</button>
				<Button variant="outline" onClick={handleCloseBlogModal}>
					Close
				</Button>
			</div>
		</form>
	);
}

// import { Button } from "@/components/ui/button";
// import { useEffect, useState } from "react";

// export default function BlogForm({ handleCloseBlogModal, blogToEdit = null }) {
// 	const [formData, setFormData] = useState({
// 		blogTitle: "",
// 		blogDesc: "",
// 		blogAuthor: "",
// 		blogMainPicture: null,
// 		blogSecondPicture: null,
// 		blogDate: "",
// 	});
// 	const [submitting, setSubmitting] = useState(false);
// 	const [error, setError] = useState("");

// 	useEffect(() => {
// 		if (blogToEdit) {
// 			setFormData({
// 				...blogToEdit,
// 				blogMainPicture: null,
// 				blogSecondPicture: null,
// 			});
// 		}
// 	}, [blogToEdit]);

// 	const handleSubmit = async (e) => {
// 		e.preventDefault();
// 		setError("");
// 		setSubmitting(true);

// 		try {
// 			const form = new FormData();
// 			Object.keys(formData).forEach((key) => {
// 				if (formData[key]) {
// 					form.append(key, formData[key]);
// 				}
// 			});

// 			const url = blogToEdit ? `/api/blogs/${blogToEdit._id}` : "/api/blogs/create";
// 			const method = blogToEdit ? "PUT" : "POST";

// 			const response = await fetch(url, {
// 				method: method,
// 				body: form,
// 			});

// 			const result = await response.json();
// 			if (!response.ok) {
// 				throw new Error(result.error || `Failed to ${blogToEdit ? "update" : "create"} blog`);
// 			}

// 			if (result.success) {
// 				setFormData({
// 					blogTitle: "",
// 					blogDesc: "",
// 					blogAuthor: "",
// 					blogMainPicture: null,
// 					blogSecondPicture: null,
// 					blogDate: "",
// 				});
// 				// const eventposterInput = document.getElementById("eventposter");
// 				// if (eventposterInput) {
// 				// 	eventposterInput.value = "";
// 				// }
// 				alert(`Blog ${blogToEdit ? "updated" : "created"} successfully!`);
// 				handleCloseBlogModal();
// 			}
// 		} catch (error) {
// 			setError(error.message);
// 			console.error(`Error ${blogToEdit ? "updating" : "creating"} blog:`, error);
// 		} finally {
// 			setSubmitting(false);
// 		}
// 	};
// 	// const handleSubmit = async (e) => {
// 	// 	e.preventDefault();
// 	// 	setError("");
// 	// 	setSubmitting(true);

// 	// 	try {
// 	// 		const form = new FormData();
// 	// 		form.append("blogTitle", formData.blogTitle);
// 	// 		form.append("blogDesc", formData.blogDesc);
// 	// 		form.append("blogAuthor", formData.blogAuthor);
// 	// 		if (formData.blogMainPicture) {
// 	// 			form.append("blogMainPicture", formData.blogMainPicture);
// 	// 		}
// 	// 		if (formData.blogSecondPicture) {
// 	// 			form.append("blogSecondPicture", formData.blogSecondPicture);
// 	// 		}
// 	// 		form.append("blogDate", formData.blogDate);

// 	// 		console.log("form", form);
// 	// 		const response = await fetch("/api/blogs/create", {
// 	// 			method: "POST",
// 	// 			body: form,
// 	// 		});

// 	// 		const result = await response.json();
// 	// 		console.log("result", result);
// 	// 		if (!response.ok) {
// 	// 			throw new Error(result.error || "Failed to create blog");
// 	// 		}

// 	// 		if (result.success) {
// 	// 			setFormData({
// 	// 				blogTitle: "",
// 	// 				blogDesc: "",
// 	// 				blogAuthor: "",
// 	// 				blogMainPicture: null,
// 	// 				blogSecondPicture: null,
// 	// 				blogDate: "",
// 	// 			});
// 	// 			// Reset file inputs
// 	// 			const mainPictureInput = document.getElementById("blogMainPicture");
// 	// 			const secondPictureInput = document.getElementById("blogSecondPicture");
// 	// 			if (mainPictureInput) mainPictureInput.value = "";
// 	// 			if (secondPictureInput) secondPictureInput.value = "";
// 	// 			toast.success("Blogs created successfully!");
// 	// 		}
// 	// 	} catch (error) {
// 	// 		setError(error.message);
// 	// 		console.error("Error creating blog:", error);
// 	// 	} finally {
// 	// 		setSubmitting(false);
// 	// 	}
// 	// };

// 	return (
// 		<form onSubmit={handleSubmit} className="space-y-4 max-h-[700px] overflow-y-scroll">
// 			{error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
// 			<div>
// 				<label htmlFor="blogTitle" className="block mb-2 font-bold">
// 					Blog Title
// 				</label>
// 				<input type="text" id="blogTitle" value={formData.blogTitle} onChange={(e) => setFormData({ ...formData, blogTitle: e.target.value })} className="w-full p-2 border rounded" required />
// 			</div>
// 			<div>
// 				<label htmlFor="blogDesc" className="block mb-2 font-bold">
// 					Blog Description
// 				</label>
// 				<textarea rows={12} id="blogDesc" value={formData.blogDesc} onChange={(e) => setFormData({ ...formData, blogDesc: e.target.value })} className="w-full p-2 border rounded" required />
// 			</div>
// 			<div>
// 				<label htmlFor="blogAuthor" className="block mb-2 font-bold">
// 					Blog Author
// 				</label>
// 				<input type="text" id="blogAuthor" value={formData.blogAuthor} onChange={(e) => setFormData({ ...formData, blogAuthor: e.target.value })} className="w-full p-2 border rounded" />
// 			</div>
// 			<div>
// 				<label htmlFor="blogMainPicture" className="block mb-2 font-bold">
// 					Blog Main Picture
// 				</label>
// 				<input type="file" id="blogMainPicture" onChange={(e) => setFormData({ ...formData, blogMainPicture: e.target.files[0] })} className="w-full p-2 border rounded" />
// 			</div>
// 			<div>
// 				<label htmlFor="blogSecondPicture" className="block mb-2 font-bold">
// 					Blog Second Picture
// 				</label>
// 				<input type="file" id="blogSecondPicture" onChange={(e) => setFormData({ ...formData, blogSecondPicture: e.target.files[0] })} className="w-full p-2 border rounded" />
// 			</div>
// 			<div>
// 				<label htmlFor="blogDate" className="block mb-2 font-bold">
// 					Blog Date
// 				</label>
// 				<input
// 					type="date"
// 					id="blogDate"
// 					value={formData.blogDate}
// 					onChange={(e) => {
// 						console.log("Selected date:", e.target.value); // Debug
// 						setFormData({ ...formData, blogDate: e.target.value });
// 					}}
// 					className="w-full p-2 border rounded"
// 				/>
// 			</div>
// 			<div className="grid grid-cols-2 gap-2">
// 				<button type="submit" disabled={submitting} className={`w-full p-1.5 rounded ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"} text-slate-200 font-bold`}>
// 					{submitting ? `${blogToEdit ? "Updating" : "Creating"} Blog...` : `${blogToEdit ? "Update" : "Create"} Blog`}
// 				</button>
// 				<Button variant="outline" onClick={handleCloseBlogModal}>
// 					Close
// 				</Button>
// 			</div>
// 		</form>
// 	);
// }
