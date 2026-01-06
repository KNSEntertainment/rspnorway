import Image from "next/image";

export default function AboutUs() {
	return (
		<div className="mt-16 md:mt-24 min-h-screen">
			<main className="container mx-auto px-4 py-8">
				<section className="container mx-auto px-4 py-8 mb-16">
					<h2 className="text-3xl text-center font-bold mb-6">
						About <span className="mx-auto text-[#0094da]">Us</span>
					</h2>
					<div className="w-24 h-1 mx-auto bg-[#0094da] mb-6 md:mb-12 rounded-full"></div>
					<div className="flex flex-col md:flex-row gap-12 items-center">
						{/* Text Content Column */}
						<div className="md:w-1/2">
							<div className="space-y-6 text-gray-800 text-lg">
								<p>Welcome to RSP Norway, a place where learning meets laughter and every child’s potential is nurtured with care. We are dedicated to providing a safe, stimulating, and loving environment where children embark on their journey of discovery through play-based learning and structured activities.</p>

								<p>At RSP Norway, we believe that early childhood education is the foundation for a bright future. Our experienced educators create a warm and engaging atmosphere, encouraging curiosity, creativity, and social development. Through a blend of interactive lessons, creative arts, music, and hands-on activities, we help young learners build essential skills while having fun.</p>

								<p>Join us at RSP Norway, where we turn everyday moments into magical learning experiences! 🌟</p>
							</div>
						</div>

						{/* Image Column */}
						<div className="md:w-1/2 flex items-center justify-center">
							<div className="w-full max-w-xl">
								<Image src="/rabi1.webp" alt="Event Experience" width={600} height={600} className="rounded-lg shadow-xl w-full h-auto object-cover" />
							</div>
						</div>
					</div>
				</section>

				<section className="h-auto bg-blue-100 flex flex-col md:flex-row items-center rounded-lg">
					<div className=" text-black p-8 lg:px-32">
						<h2 className="text-2xl md:text-4xl font-bold mb-4">
							Our <span className="text-brand leading-tight">Mission</span>
						</h2>
						<p className="text-lg mb-4">At RSP Norway, our mission is to provide a safe, nurturing, and stimulating environment where young minds flourish through play-based learning. We are committed to fostering creativity, curiosity, and confidence in every child, ensuring a strong foundation for their future growth. Through innovative teaching methods and a caring community, we strive to make every child’s early years joyful and enriching.</p>
					</div>
					<div className=" text-black p-8 lg:px-32">
						<h2 className="text-2xl md:text-4xl font-bold mb-4">
							Our <span className="text-[#0094da] leading-tight">Vision</span>
						</h2>
						<p className="text-lg mb-4">Our vision is to be a leading early childhood education center, recognized for its holistic approach to learning and care. We aspire to create a home away from home where children feel loved, valued, and empowered to explore their world. By nurturing lifelong learners, we aim to shape a future where every child reaches their full potential with confidence, kindness, and creativity.</p>
					</div>
				</section>
			</main>
		</div>
	);
}
