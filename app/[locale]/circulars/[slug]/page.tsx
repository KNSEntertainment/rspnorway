import { getLocale } from "next-intl/server";
import { getCircularBySlug } from "@/lib/data/circulars";
import { localize } from "@/lib/localize";
import { notFound } from "next/navigation";

export default async function BlogPostPage(props: { params: Promise<{ locale: string; slug: string }> }) {
	const params = await props.params;
	const locale = await getLocale();
	const circular = await getCircularBySlug(params.slug);

	if (!circular) notFound();

	return (
		<article className="container mx-auto px-4 mt-36 flex flex-col min-h-screen bg-gray-50">
			<h1>{localize(circular.circularTitle, locale)}</h1>
			<div
				dangerouslySetInnerHTML={{
					__html: localize(circular.circularDesc, locale),
				}}
			/>
		</article>
	);
}
