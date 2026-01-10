import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useLocale } from "next-intl";

export default function SearchModal({ closeModal, placeholder }) {
	const [searchQuery, setSearchQuery] = useState("");
	const searchInputRef = useRef(null);
	const router = useRouter();
	const locale = useLocale();

	useEffect(() => {
		if (searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, []);

	const handleSearch = (e) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			closeModal();
			router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`);
		}
	};

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-lg transition-all duration-300 pointer-events-none">
			<form onSubmit={handleSearch} className=" flex items-center max-w-2xl w-full gap-2 md:gap-4 rounded-xl shadow-xl px-4 py-4 md:py-6 mx-4 pointer-events-auto">
				<input type="text" ref={searchInputRef} className="flex-1 border-b-2 text-white text-2xl border-brand px-4 py-2 md:py-3 md:text-4xl focus:outline-none  bg-transparent" placeholder={placeholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} required />
				<button type="submit" className="bg-brand rounded-md p-2 md:p-4 flex items-center justify-center hover:bg-brand transition-colors">
					<Search className="text-white w-6 h-6 md:w-8 md:h-8" />
				</button>
				{/* Close icon at top right */}
				<button type="button" onClick={closeModal} className="absolute top-6 right-6 text-gray-400 hover:text-brand transition-colors">
					<X className="w-6 h-6 md:w-8 md:h-8" />
				</button>
			</form>
		</div>
	);
}
