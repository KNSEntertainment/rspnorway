import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { captchaStore } from '@/lib/captcha-store';

export async function GET() {
	try {
		// Generate random captcha ID
		const captchaId = randomBytes(16).toString('hex');
		
		// Generate random 6-character captcha text
		const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
		let captchaText = '';
		for (let i = 0; i < 6; i++) {
			captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		
		// Store captcha with 10-minute expiration
		captchaStore.set(captchaId, {
			text: captchaText.toLowerCase(),
			expires: Date.now() + 10 * 60 * 1000 // 10 minutes
		});
		
		// Generate SVG captcha image
		const svg = generateCaptchaSVG(captchaText);
		
		return new NextResponse(svg, {
			headers: {
				'Content-Type': 'image/svg+xml',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
				'Captcha-ID': captchaId,
				'Access-Control-Allow-Origin': '*'
			}
		});
		
	} catch (error) {
		console.error('Captcha generation error:', error);
		return NextResponse.json(
			{ error: 'Failed to generate captcha' },
			{ status: 500 }
		);
	}
}

function generateCaptchaSVG(text: string): string {
	const width = 180;
	const height = 60;
	
	// Generate random colors and positions
	const noiseLines = Array.from({ length: 5 }, () => ({
		x1: Math.random() * width,
		y1: Math.random() * height,
		x2: Math.random() * width,
		y2: Math.random() * height,
		color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`
	}));
	
	const noiseDots = Array.from({ length: 30 }, () => ({
		x: Math.random() * width,
		y: Math.random() * height,
		color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`
	}));
	
	const characters = text.split('').map((char, i) => ({
		char,
		x: 20 + i * 25,
		y: 30 + Math.random() * 10 - 5,
		rotate: (Math.random() - 0.5) * 0.3
	}));
	
	return `
		<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
			<rect width="${width}" height="${height}" fill="#f3f4f6"/>
			
			<!-- Noise lines -->
			${noiseLines.map(line => `
				<line x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}" 
					  stroke="${line.color}" stroke-width="1"/>
			`).join('')}
			
			<!-- Noise dots -->
			${noiseDots.map(dot => `
				<circle cx="${dot.x}" cy="${dot.y}" r="1" fill="${dot.color}"/>
			`).join('')}
			
			<!-- Text -->
			${characters.map(({ char, x, y, rotate }) => `
				<text x="${x}" y="${y}" 
					  font-family="Arial, sans-serif" 
					  font-size="24" 
					  font-weight="bold" 
					  fill="#1f2937" 
					  text-anchor="middle" 
					  dominant-baseline="middle"
					  transform="rotate(${rotate} ${x} ${y})">
					${char}
				</text>
			`).join('')}
		</svg>
	`.trim();
}
