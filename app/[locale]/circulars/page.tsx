import { getLocale } from "next-intl/server";
import { getPublishedCirculars } from "@/lib/data/circulars";
import { localize } from "@/lib/localize";
import Link from "next/link";

export default async function BlogPage() {
	const locale = await getLocale();
	const circulars = await getPublishedCirculars();

	return (
		<main>
			<h1>Circulars</h1>

			<ul>
				{circulars.map((circular) => (
					<li key={circular._id.toString()}>
						<Link href={`/${locale}/circulars/${circular.slug}`}>
							<h2>{localize(circular.circularTitle, locale)}</h2>
							<p>{localize(circular.circularDesc, locale)}</p>
						</Link>
					</li>
				))}
			</ul>
		</main>
	);
}
