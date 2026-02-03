import SectionHeader from "@/components/SectionHeader";
import Image from "next/image";
import { Phone, Mail } from "lucide-react";

async function getExecutiveMembers() {
	try {
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
		const response = await fetch(`${baseUrl}/api/executive-members`, {
			cache: "no-store",
		});
		if (!response.ok) return [];
		return await response.json();
	} catch (error) {
		console.error("Error fetching members:", error);
		return [];
	}
}

export async function Members() {
	const members = await getExecutiveMembers();

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
			<header className="text-center mb-12">
				<SectionHeader heading="Executive Members" />
				<p className="text-slate-600 mt-4 text-lg max-w-2xl mx-auto">PNSBN Norway Members</p>
			</header>

			{members.length === 0 ? (
				<div className="text-center py-20">
					<p className="text-gray-500 text-lg">No executive members found.</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{members.map((member: any) => (
						<div key={member._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
							<div className="aspect-square overflow-hidden bg-gray-100">
								{member.imageUrl ? (
									<Image src={member.imageUrl} alt={member.name} width={600} height={600} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
								) : (
									<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand to-blue-600">
										<span className="text-white text-8xl font-bold">{member.name.charAt(0).toUpperCase()}</span>
									</div>
								)}
							</div>
							<div className="p-6">
								<h3 className="text-2xl font-semibold text-gray-900 mb-1">{member.name}</h3>
								{member.position && <p className="text-sm text-brand font-medium mb-4">{member.position}</p>}

								<div className="space-y-3">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
											<Phone className="w-5 h-5 text-white" />
										</div>
										<div>
											<p className="text-xs text-gray-500 uppercase tracking-wide">Mobile</p>
											<a href={`tel:${member.phone}`} className="text-gray-900 hover:text-blue-600">
												{member.phone}
											</a>
										</div>
									</div>

									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
											<Mail className="w-5 h-5 text-white" />
										</div>
										<div>
											<p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
											<a href={`mailto:${member.email}`} className="text-gray-900 hover:text-blue-600 break-all">
												{member.email}
											</a>
										</div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default Members;
