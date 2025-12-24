import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
	title: { type: String, required: true },
	image: { type: String, required: true },
	timeAgo: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	isFeatured: { type: Boolean, default: false },
	isPopular: { type: Boolean, default: false },
});

const Article = mongoose.models.Article || mongoose.model("Article", articleSchema);

export default Article;
