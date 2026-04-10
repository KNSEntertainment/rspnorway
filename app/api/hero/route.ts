import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Hero from "@/models/Hero.Model";
import { deleteFromCloudinary } from "@/utils/saveFileToCloudinaryUtils";

interface MultilingualField {
	en: string;
	no: string;
	ne: string;
}

interface HeroSlide {
	_id?: string;
	title: MultilingualField;
	description: MultilingualField;
	image: string;
	primaryLink: string;
	primaryButton: MultilingualField;
	secondaryLink: string;
	secondaryButton: MultilingualField;
	order: number;
	isActive: boolean;
}

// type HeroSlideDocument = HeroSlide & {
// 	_id: string;
// }

// GET all hero slides
export async function GET(request: NextRequest) {
	try {
		await connectDB();
		
		const { searchParams } = new URL(request.url);
		const locale = searchParams.get('locale') || 'en';
		
		const hero = await Hero.findOne();
		
		if (!hero) {
			// Return empty array if no hero exists yet
			return NextResponse.json({ slides: [] });
		}
		
	

		// Sort slides by order field and transform for locale
		const sortedSlides = hero.slides
			.sort((a, b) => a.order - b.order)
			.map((slide) => {
				const slideObj = slide.toObject ? slide.toObject() : slide;
				
		
				
				const processedSlide = {
					...slideObj,
					title: slide.title[locale] || slide.title.en || '',
					description: slide.description[locale] || slide.description.en || '',
					primaryButton: slide.primaryButton[locale] || slide.primaryButton.en || '',
					secondaryButton: slide.secondaryButton[locale] || slide.secondaryButton.en || '',
				};
				
		
				
				return processedSlide;
			}) as unknown as HeroSlide[];
		
		return NextResponse.json({ slides: sortedSlides });
	} catch (error) {
		console.error("Error fetching hero slides:", error);
		return NextResponse.json(
			{ error: "Failed to fetch hero slides" },
			{ status: 500 }
		);
	}
}

// POST - Create or update hero slides
export async function POST(request: Request) {
	try {
		await connectDB();
		
		const body = await request.json();
		const { slides } = body;
		
		if (!slides || !Array.isArray(slides)) {
			return NextResponse.json(
				{ error: "Slides array is required" },
				{ status: 400 }
			);
		}
		
		// Debug: Log received data
		console.log("Received slides data:", JSON.stringify(slides, null, 2));

		// Validate and process each slide
		const processedSlides = slides.map((slide, index) => {
			// Debug: Log each slide
			console.log(`Processing slide ${index}:`, JSON.stringify(slide, null, 2));
			
			// Helper function to normalize multilingual field
			const normalizeMultilingualField = (field: MultilingualField | string, fieldName: string): MultilingualField => {
				if (typeof field === 'string') {
					// If it's a string, treat it as English content
					console.log(`Converting ${fieldName} from string to object:`, field);
					return { en: field, no: field, ne: field };
				} else if (typeof field === 'object' && field !== null) {
					// If it's already an object, ensure it has all language keys
					return {
						en: field.en || field.no || field.ne || '',
						no: field.no || field.en || field.ne || '',
						ne: field.ne || field.en || field.no || ''
					};
				} else {
					// Default empty object
					return { en: '', no: '', ne: '' };
				}
			};
			
			// Validate and convert multilingual fields to plain objects
			const processedSlide = {
				...slide,
				title: normalizeMultilingualField(slide.title, 'title'),
				description: normalizeMultilingualField(slide.description, 'description'),
				primaryButton: normalizeMultilingualField(slide.primaryButton, 'primaryButton'),
				secondaryButton: normalizeMultilingualField(slide.secondaryButton, 'secondaryButton'),
			};
			
			// Debug: Log processed slide
			console.log(`Processed slide ${index}:`, JSON.stringify(processedSlide, null, 2));

			// Validate required fields
			if (!processedSlide.primaryLink || !processedSlide.secondaryLink) {
				throw new Error("Button links are required");
			}
			
			// For new slides, image should be present; for updates, allow existing image
			console.log("Checking image validation:", {
				hasImage: !!processedSlide.image,
				image: processedSlide.image,
				hasId: !!processedSlide._id,
				isNewSlide: !processedSlide._id
			});
			
			if (!processedSlide.image && !processedSlide._id) {
				console.log("Image validation failed - no image for new slide");
				throw new Error("Image is required for new slides");
			}

			// Check that at least English content exists for multilingual fields
			console.log("Validating English content:", {
				titleEn: processedSlide.title.en,
				descriptionEn: processedSlide.description.en,
				primaryButtonEn: processedSlide.primaryButton.en,
				secondaryButtonEn: processedSlide.secondaryButton.en,
				titleType: typeof processedSlide.title,
				titleKeys: processedSlide.title ? Object.keys(processedSlide.title) : 'no title object',
				fullTitle: processedSlide.title,
				fullDescription: processedSlide.description,
				fullPrimaryButton: processedSlide.primaryButton,
				fullSecondaryButton: processedSlide.secondaryButton
			});
			
			// Temporarily disable validation to see what data is being received
			// More flexible validation - check if English content exists and is not empty
			const titleEn = processedSlide.title?.en || '';
			const descriptionEn = processedSlide.description?.en || '';
			const primaryButtonEn = processedSlide.primaryButton?.en || '';
			const secondaryButtonEn = processedSlide.secondaryButton?.en || '';
			
			console.log("English content values:", {
				titleEn: `"${titleEn}"`,
				descriptionEn: `"${descriptionEn}"`,
				primaryButtonEn: `"${primaryButtonEn}"`,
				secondaryButtonEn: `"${secondaryButtonEn}"`
			});
			
			// Re-enable validation with proper logic
			if (!titleEn.trim() || !descriptionEn.trim() || 
				!primaryButtonEn.trim() || !secondaryButtonEn.trim()) {
				console.log("English validation failed:", {
					titleEn: titleEn,
					descriptionEn: descriptionEn,
					primaryButtonEn: primaryButtonEn,
					secondaryButtonEn: secondaryButtonEn
				});
				throw new Error("English content is required for all text fields");
			}

			return processedSlide;
		});
		
		// Find existing hero or create new one
		let hero = await Hero.findOne();
		
		// Debug: Log existing hero data
		if (hero) {
			console.log("Existing hero slides:", JSON.stringify(hero.slides, null, 2));
			// Check if existing data has Map structure (old format)
			if (hero.slides.length > 0 && hero.slides[0].title && typeof hero.slides[0].title === 'object' && hero.slides[0].title instanceof Map) {
				console.log("Detected old Map format, clearing existing data...");
				await Hero.deleteMany({});
				hero = null;
			}
		}
		
		if (hero) {
			// Check for image deletions when updating
			for (const existingSlide of hero.slides) {
				const updatedSlide = processedSlides.find(s => s._id?.toString() === existingSlide._id.toString());
				if (updatedSlide && existingSlide.image && updatedSlide.image !== existingSlide.image) {
					// Image was replaced, delete old image from Cloudinary
					try {
						await deleteFromCloudinary(existingSlide.image, "image");
					} catch (error) {
						console.error("Failed to delete old image from Cloudinary:", error);
					}
				}
			}
			
			// Update existing hero
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(hero as any).slides = processedSlides;
			console.log("Setting hero.slides to:", JSON.stringify(processedSlides, null, 2));
			await hero.save();
		} else {
			// Create new hero
			console.log("Creating new hero with slides:", JSON.stringify(processedSlides, null, 2));
			hero = await Hero.create({ slides: processedSlides });
		}
		
		return NextResponse.json({ 
			message: "Hero slides updated successfully",
			slides: hero.slides 
		});
	} catch (error) {
		console.error("Error updating hero slides:", error);
		return NextResponse.json(
			{ error: "Failed to update hero slides" },
			{ status: 500 }
		);
	}
}
