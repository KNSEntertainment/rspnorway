import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Play, Book, Palette, Bed, School } from "lucide-react";
import Link from "next/link";

export default function AboutUs() {
	const services = [
		{
			title: "Play Area",
			icon: <Play />,
			description: "A safe and fun outdoor space designed for kids to explore, play, and develop motor skills.",
			imageSrc: "/lkg.jpeg",
		},
		{
			title: "Storytelling Corner",
			icon: <Book />,
			description: "Engaging storytelling sessions to spark imagination and foster a love for reading from an early age.",
			imageSrc: "/magichero.jpeg",
		},
		{
			title: "Art & Craft Room",
			icon: <Palette />,
			description: "A creative space where children can express themselves through painting, drawing, and craft activities.",
			imageSrc: "/lkg.jpeg",
		},
		{
			title: "Nap Time Zone",
			icon: <Bed />,
			description: "A cozy and quiet area designed for little ones to rest and recharge during the day.",
			imageSrc: "/magichero.png",
		},
		{
			title: "Music & Dance",
			icon: <Music />,
			description: "Interactive music and movement activities to develop rhythm, coordination, and confidence.",
			imageSrc: "/magichero.jpeg",
		},
		{
			title: "Learning Centers",
			icon: <School />,
			description: "Dedicated spaces for early learning activities, including math, language, and sensory exploration.",
			imageSrc: "/magichero.png",
		},
	];

	// const reasons = [
	// 	{ title: "Memorable Moments", description: "We are dedicated to crafting events that leave a lasting impression on attendees." },
	// 	{ title: "Artist Empowerment", description: "We provide a platform for both emerging talents and seasoned performers to shine." },
	// 	{ title: "Promote Nepali Culture", description: "We promote Nepali culture, tradition all over Europe." },
	// 	{ title: "Community Bonding", description: "Promote interaction, and celebrate diversity, encouraging stronger connections and a relationship within communities." },
	// ];
	return (
		<div className="pt-20 min-h-screen">
			<main className="container mx-auto px-4 py-8">
				<section className="py-16 container mx-auto px-4">
					<div className="flex flex-col md:flex-row gap-12 items-center">
						{/* Text Content Column */}
						<div className="md:w-1/2">
							<h2 className="text-3xl md:text-4xl font-bold mb-6">
								About <span className="text-[#0094da]">Us</span>
							</h2>
							<div className="w-24 h-1 bg-[#0094da] mb-6 md:mb-12 rounded-full"></div>

							<div className="space-y-6 text-gray-800 text-lg">
								<p>Welcome to RSP Norway, a place where learning meets laughter and every child’s potential is nurtured with care. We are dedicated to providing a safe, stimulating, and loving environment where children embark on their journey of discovery through play-based learning and structured activities.</p>

								<p>At RSP Norway, we believe that early childhood education is the foundation for a bright future. Our experienced educators create a warm and engaging atmosphere, encouraging curiosity, creativity, and social development. Through a blend of interactive lessons, creative arts, music, and hands-on activities, we help young learners build essential skills while having fun.</p>

								<p>We understand that every child is unique, and our personalized approach ensures that each little one receives the attention and guidance they need to grow, explore, and thrive. Our goal is to be more than just a daycare—we strive to be a second home where children feel safe, valued, and inspired every day.</p>
								<p>Join us at RSP Norway, where we turn everyday moments into magical learning experiences! 🌟</p>
							</div>
						</div>

						{/* Image Column */}
						<div className="md:w-1/2 flex items-center justify-center">
							<div className="w-full max-w-xl">
								<Image src="/mc-group.jpeg" alt="Event Experience" width={600} height={600} className="rounded-lg shadow-xl w-full h-auto object-cover" />
							</div>
						</div>
					</div>
				</section>

				<section className="h-auto bg-black flex flex-col md:flex-row items-center rounded-lg">
					<div className=" text-white p-8 lg:px-32">
						<h2 className="text-2xl md:text-4xl font-bold mb-4">
							Our <span className="text-[#0094da] leading-tight">Mission</span>
						</h2>
						<p className="text-lg mb-4">At RSP Norway, our mission is to provide a safe, nurturing, and stimulating environment where young minds flourish through play-based learning. We are committed to fostering creativity, curiosity, and confidence in every child, ensuring a strong foundation for their future growth. Through innovative teaching methods and a caring community, we strive to make every child’s early years joyful and enriching.</p>
					</div>
					<div className=" text-white p-8 lg:px-32">
						<h2 className="text-2xl md:text-4xl font-bold mb-4">
							Our <span className="text-[#0094da] leading-tight">Vision</span>
						</h2>
						<p className="text-lg mb-4">Our vision is to be a leading early childhood education center, recognized for its holistic approach to learning and care. We aspire to create a home away from home where children feel loved, valued, and empowered to explore their world. By nurturing lifelong learners, we aim to shape a future where every child reaches their full potential with confidence, kindness, and creativity.</p>
					</div>
				</section>

				<section className="my-20">
					<h2 className="text-2xl md:text-4xl font-bold mb-8 text-center">
						School <span className="text-[#0094da] leading-tight">Facilities</span>
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-16">
						{services.map((service, index) => (
							<Card key={index} className="overflow-hidden max-h-[500px]">
								<CardHeader className="bg-[#0094da] text-white p-4 lg:px-8">
									<CardTitle className="flex items-center text-xl">
										{service.icon}
										<span className="ml-2">{service.title}</span>
									</CardTitle>
								</CardHeader>
								<p className="p-4 lg:p-8">{service.description}</p>
								<CardContent className="p-0">
									<Image src={service.imageSrc || "/placeholder.jpeg"} alt={service.title || "/placeholder.jpeg"} width={600} height={600} className="w-full object-cover" />
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				{/* <section className="bg-slate-100 text-slate-800 p-8 my-16 rounded-lg">
					<h2 className="text-2xl md:text-4xl font-bold mb-4 text-center">
						Why Choose <span className="text-[#0094da] leading-tight">Us</span>
					</h2>
					<ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none">
						{reasons.map((reason, index) => (
							<li key={index} className="flex space-y-4 items-start">
								<Sparkles className="mr-2 mt-4 text-[#0094da]" />
								<div>
									<h3 className="font-semibold text-[#0094da]">{reason.title}</h3>
									<p>{reason.description}</p>
								</div>
							</li>
						))}
					</ul>
				</section> */}

				<section className="my-6 md:my-16 h-auto bg-[#0094da] rounded-lg">
					<div className="text-center text-black p-8">
						<p className="text-xl text-white md:text-3xl mb-8">So, are you ready to shape a future of your child with us?</p>
						<Link href="school-tour-form" className="border-b bg-black hover:bg-[#0094da] rounded-full py-4 px-12 text-white font-bold">
							Book Appointment
						</Link>
					</div>
				</section>
			</main>
		</div>
	);
}
