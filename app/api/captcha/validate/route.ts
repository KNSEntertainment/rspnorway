import { NextRequest, NextResponse } from 'next/server';
import { captchaStore } from '@/lib/captcha-store';

export async function POST(request: NextRequest) {
	try {
		const { captchaId, userInput } = await request.json();
		
		// Validate input
		if (!captchaId || !userInput) {
			return NextResponse.json(
				{ error: 'Missing captcha ID or user input' },
				{ status: 400 }
			);
		}
		
		// Get stored captcha data
		const storedCaptcha = captchaStore.get(captchaId);
		
		if (!storedCaptcha) {
			return NextResponse.json(
				{ error: 'Captcha not found or expired' },
				{ status: 400 }
			);
		}
		
		// Check if expired
		if (storedCaptcha.expires < Date.now()) {
			captchaStore.delete(captchaId);
			return NextResponse.json(
				{ error: 'Captcha expired' },
				{ status: 400 }
			);
		}
		
		// Validate captcha (case-insensitive)
		const isValid = userInput.toLowerCase() === storedCaptcha.text;
		
		// Remove captcha after validation attempt (one-time use)
		captchaStore.delete(captchaId);
		
		return NextResponse.json({
			valid: isValid,
			message: isValid ? 'Captcha verified successfully' : 'Invalid captcha'
		});
		
	} catch (error) {
		console.error('Captcha validation error:', error);
		return NextResponse.json(
			{ error: 'Failed to validate captcha' },
			{ status: 500 }
		);
	}
}
