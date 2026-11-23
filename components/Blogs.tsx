import { getTranslations, getLocale } from "next-intl/server";
import { getBlogs } from "@/lib/data/blogs";
import BlogsClient from "./BlogsClient";
import { normalizeDocs } from "@/lib/utils";

interface BlogsProps {
	isHomePage?: boolean;
}

export default async function Blogs({ isHomePage = false }: BlogsProps) {
	try {
		const [blogsRaw, t, locale] = await Promise.all([
			getBlogs(),
			getTranslations("blogs"),
			getLocale(),
		]);

		const blogs = (blogsRaw || [])
			.map((blog) => ({
				_id: String(blog._id),
				blogTitle_en: blog.blogTitle_en || "",
				blogTitle_ne: blog.blogTitle_ne || "",
				blogTitle_no: blog.blogTitle_no || "",
				blogTitle: blog.blogTitle || "",
				blogDesc_en: blog.blogDesc_en || "",
				blogDesc_ne: blog.blogDesc_ne || "",
				blogDesc_no: blog.blogDesc_no || "",
				blogDesc: blog.blogDesc || "",
				blogDate: blog.blogDate ? String(blog.blogDate) : "",
				blogMainPicture: blog.blogMainPicture || "",
				blogAuthor: blog.blogAuthor || "",
				blogSecondPicture: blog.blogSecondPicture || "",
				blogContent: blog.blogContent || "",
				blogContent_en: blog.blogContent_en || "",
				blogContent_ne: blog.blogContent_ne || "",
				blogContent_no: blog.blogContent_no || "",
				createdAt: blog.createdAt ? new Date(blog.createdAt).toISOString() : "",
			}))
			.sort((a, b) => {
				const timeA = new Date(a.blogDate || a.createdAt || 0).getTime();
				const timeB = new Date(b.blogDate || b.createdAt || 0).getTime();
				return timeB - timeA;
			});

		const blogsNorm = normalizeDocs(blogs);
		const translations = {
			blogs_title: t("blogs_title") || "Blogs",
			loading: t("loading") || "Loading...",
			view_all: t("view_all") || "View All",
		};

		return <BlogsClient blogs={blogsNorm} translations={translations} locale={locale} isHomePage={isHomePage} />;
	} catch (error) {
		console.error("Error in Blogs component:", error);
		return null;
	}
}
