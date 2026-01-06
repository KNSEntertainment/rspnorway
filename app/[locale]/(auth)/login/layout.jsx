import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function UserLayout({ children }) {
	return (
		<div>
			<Header />
			<main>{children}</main>
			<Footer />
		</div>
	);
}
