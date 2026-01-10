import Link from "next/link";
import Image from "next/image";
import React from "react";
import { useLocale } from "next-intl";

function BlogSidebar({ blogs }) {
	const locale = useLocale();
	return (
		<div className="space-y-6 md:sticky md:top-36 bg-gray-50 h-auto overflow-y-scroll p-6 rounded-lg shadow-md">
			{/* Share Box */}

			{/* Other Blogs */}
			<div className="rounded-lg shadow-sm p-6">
				<h3 className="text-lg font-semibold text-gray-800 mb-4">Blogs</h3>
				<div className="space-y-4">
					{blogs &&
						blogs.map((relBlog) => (
							<Link href={`/${locale}/blogs/${relBlog._id}`} key={relBlog._id} className="flex space-x-4 group border-b pb-4 last:border-0 last:pb-0">
								<div className="relative w-16 h-16 flex-shrink-0">
									<Image src={relBlog?.blogMainPicture || "Image"} alt={relBlog.blogTitle || "Blog Title"} width={64} height={64} className="object-cover rounded-md" />
								</div>
								<div>
									<h4 className="font-medium text-gray-800 group-hover:text-brand transition duration-200">{relBlog.blogTitle}</h4>
									<p className="text-sm text-gray-500">{relBlog?.blogDate ? new Date(relBlog.blogDate).toISOString().slice(0, 10) : ""}</p>
								</div>
							</Link>
						))}
				</div>
			</div>
		</div>
	);
}

export default React.memo(BlogSidebar);
