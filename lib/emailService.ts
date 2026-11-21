import nodemailer from 'nodemailer';
import Membership from '@/models/Membership.Model';
import ExecutiveMember from '@/models/ExecutiveMember.Model';

// Email configuration - supports both EMAIL_USER/EMAIL_APP_PASS (used throughout the app) and SMTP_USER/SMTP_PASS
export const getEmailUser = () => process.env.EMAIL_USER || process.env.SMTP_USER || '';
export const getEmailPass = () => process.env.EMAIL_APP_PASS || process.env.SMTP_PASS || '';
export const isEmailConfigured = () => Boolean(getEmailUser() && getEmailPass());

// Create transporter
const createTransporter = () => {
	const user = getEmailUser();
	const pass = getEmailPass();

	if (process.env.SMTP_HOST && process.env.SMTP_HOST !== 'smtp.gmail.com') {
		return nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: parseInt(process.env.SMTP_PORT || '587'),
			secure: process.env.SMTP_SECURE === 'true',
			auth: { user, pass },
		});
	}

	// Default to Gmail service as configured across the application
	return nodemailer.createTransport({
		service: 'gmail',
		auth: { user, pass },
	});
};

// Email templates
export const emailTemplates = {
	messageNotification: (
		memberName: string,
		messageTitle: string,
		messageContent: string,
		senderName: string,
		priority: string,
		memberEmail?: string,
		attachments?: Array<{ filename: string; url: string; size?: number }>
	) => {
		const appUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://rspnorway.org";
		const priorityColor =
			priority === "urgent"
				? "#ef4444"
				: priority === "high"
				? "#f97316"
				: priority === "medium"
				? "#0094da"
				: "#10b981";

		return {
			subject: `PNSB-Norway ${priority === 'urgent' ? 'URGENT: ' : ''}${messageTitle}`,
			html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PNSB-Norway Message</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; border-bottom: 3px solid #0094da; padding-bottom: 20px; margin-bottom: 24px;">
            <div style="font-size: 24px; font-weight: bold; color: #0094da;">PNSB-Norway</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Prabasi Nepali Samaj Bharat - Norway</div>
        </div>
        
        <p style="font-size: 15px;">Dear ${memberName},</p>
        
        <div style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; background-color: ${priorityColor}; color: white; margin-bottom: 16px;">
            ${priority} Priority
        </div>
        
        <div style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #1f2937;">${messageTitle}</div>
        
        <div style="background-color: #f8fafc; padding: 20px; border-left: 4px solid #0094da; margin: 20px 0; white-space: pre-wrap; color: #334155; line-height: 1.6;">${messageContent}</div>
        
        ${
			attachments && attachments.length > 0
				? `
        <div style="margin: 20px 0; padding: 16px; background-color: #f1f5f9; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="font-weight: bold; font-size: 13px; color: #334155; margin-bottom: 8px;">Attached Files (${attachments.length}):</div>
            ${attachments
				.map(
					(att) => `
                <div style="margin-top: 8px;">
                    <a href="${att.url}" target="_blank" style="color: #0094da; font-weight: bold; text-decoration: underline; font-size: 14px;">
                        📎 ${att.filename}
                    </a>
                    ${att.size ? `<span style="color: #64748b; font-size: 12px; margin-left: 8px;">(${(att.size / 1024).toFixed(1)} KB)</span>` : ""}
                </div>
            `
				)
				.join("")}
        </div>
        `
				: ""
		}

        <div style="font-style: italic; color: #6b7280; margin-top: 20px;">
            Sent by: ${senderName}<br>
            PNSB-Norway Administration
        </div>
        
        <div style="text-align: center; margin: 24px 0;">
            <a href="${appUrl}/en/profile/messages" style="display: inline-block; background-color: #0094da; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View in Member Portal
            </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
            <p>This message was sent to you because you are a member of PNSB-Norway.</p>
            <p>© ${new Date().getFullYear()} PNSB-Norway. All rights reserved.</p>
            ${
				memberEmail
					? `<div style="margin-top: 12px;"><a href="${appUrl}/unsubscribe?email=${encodeURIComponent(memberEmail)}" style="color: #6b7280; text-decoration: underline;">Unsubscribe from email messages</a></div>`
					: ""
			}
        </div>
    </div>
</body>
</html>
			`,
		};
	},
	eventRegistrationReceipt: (firstName: string, lastName: string, eventName: string, eventDate: string, eventTime: string, eventVenue: string, adults: number, children: number, totalAmount: number, registrationId: string, qrCode: string) => ({
		subject: `Event Registration Confirmation - ${eventName}`,
		html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Registration Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
        }
        .success-banner {
            background-color: #10b981;
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 30px;
            font-size: 18px;
            font-weight: bold;
        }
        .event-details {
            background-color: #f8fafc;
            padding: 20px;
            border-left: 4px solid #2563eb;
            margin: 20px 0;
        }
        .event-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #1f2937;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
        }
        .detail-label {
            font-weight: bold;
            color: #6b7280;
        }
        .detail-value {
            color: #1f2937;
        }
        .attendees-section {
            background-color: #fef3c7;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .qr-section {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            border: 2px dashed #2563eb;
            border-radius: 8px;
        }
        .qr-code {
            max-width: 200px;
            margin: 20px auto;
            display: block;
        }
        .qr-instructions {
            font-size: 14px;
            color: #6b7280;
            margin-top: 15px;
        }
        .total-section {
            background-color: #1f2937;
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 18px;
        }
        .total-amount {
            font-weight: bold;
            font-size: 24px;
            color: #10b981;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
        }
        .registration-id {
            font-family: monospace;
            background-color: #f3f4f6;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">PNSB-Norway</div>
        </div>
        
        <div class="success-banner">
            🎉 Registration Successful!
        </div>
        
        <p>Dear ${firstName} ${lastName},</p>
        
        <p>Thank you for registering for our event. Your registration has been confirmed and payment processed successfully.</p>
        
        <div class="event-details">
            <div class="event-title">${eventName}</div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${eventTime}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Venue:</span>
                <span class="detail-value">${eventVenue}</span>
            </div>
        </div>
        
        <div class="attendees-section">
            <h3>Attendees</h3>
            <div class="detail-row">
                <span class="detail-label">Adults:</span>
                <span class="detail-value">${adults}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Children:</span>
                <span class="detail-value">${children}</span>
            </div>
        </div>
        
        <div class="total-section">
            <div class="total-row">
                <span>Total Paid:</span>
                <span class="total-amount">NOK ${totalAmount}</span>
            </div>
        </div>
        
        <div class="qr-section">
            <h3>Your Entry QR Code</h3>
            <p class="qr-instructions">Please present this QR code at the event entrance for quick check-in</p>
            <img src="${qrCode}" alt="Registration QR Code" class="qr-code">
            <div class="qr-instructions">
                <strong>Registration ID:</strong> <span class="registration-id">${registrationId}</span>
            </div>
        </div>
        
        <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Important Information:</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Please arrive 15 minutes before the event start time</li>
                <li>Bring this QR code (printed or on your mobile device)</li>
                <li>Keep this email for your records</li>
                <li>Contact us if you need to make any changes to your registration</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>This email serves as your official registration receipt.</p>
            <p>© 2024 PNSB-Norway. All rights reserved.</p>
            <p>For questions, contact us at events@pnsbnorway.no</p>
        </div>
    </div>
</body>
</html>
		`,
	}),
};

// Send single email
export const sendEmail = async (to: string, subject: string, html: string) => {
	try {
		if (!isEmailConfigured()) {
			console.warn(`Email service credentials not configured. Skipping email to: ${to}`);
			return { success: false, error: 'Email credentials not configured (EMAIL_USER / EMAIL_APP_PASS)' };
		}

		const transporter = createTransporter();
		const sender = getEmailUser() || 'info@rspnorway.org';

		const mailOptions = {
			from: `"PNSB-Norway" <${sender}>`,
			to,
			subject,
			html,
		};

		const result = await transporter.sendMail(mailOptions);
		return { success: true, messageId: result.messageId };
	} catch (error) {
		console.error(`Error sending email to ${to}:`, error);
		return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
	}
};

// Send bulk emails to targeted members
export const sendBulkMessages = async (
	messageTitle: string,
	messageContent: string,
	senderName: string,
	priority: string,
	recipientType: string,
	excludeEmails: string[] = [],
	specificRecipients?: Array<{ email: string; fullName?: string; name?: string }>,
	attachments?: Array<{ filename: string; url: string; size?: number }>
) => {
	try {
		if (!isEmailConfigured()) {
			console.warn('Email service is not configured (EMAIL_USER / EMAIL_APP_PASS missing). Skipping bulk email.');
			return {
				success: false,
				message: 'Email service not configured. Please verify EMAIL_USER and EMAIL_APP_PASS in environment.',
				sentCount: 0,
				totalCount: 0,
			};
		}

		// Normalize excluded emails
		const excludedSet = new Set(excludeEmails.map((e) => e.toLowerCase().trim()));
		const recipientMap = new Map<string, string>(); // email -> fullName

		// If specific recipients provided (individual or selected executive members), use them directly
		if (specificRecipients && specificRecipients.length > 0) {
			for (const r of specificRecipients) {
				if (r.email) {
					const emailLower = r.email.toLowerCase().trim();
					if (!excludedSet.has(emailLower)) {
						recipientMap.set(emailLower, r.fullName || r.name || 'Executive Member');
					}
				}
			}
		} else {
			// 1. Build membership query
			const memberQuery: Record<string, unknown> = {
				membershipStatus: { $ne: 'blocked' },
				email: { $exists: true, $ne: '' },
			};

			if (recipientType === 'executive') {
				memberQuery.membershipType = 'executive';
			} else if (recipientType === 'general') {
				memberQuery.membershipType = 'general';
			}

			// Only exclude members who explicitly turned off messages in preferences
			memberQuery['emailPreferences.messages'] = { $ne: false };

			const members = (await Membership.find(memberQuery).select('fullName email').lean()) as Array<{ fullName?: string; email?: string }>;

			// Collect unique recipients by email
			for (const m of members) {
				if (m.email) {
					const emailLower = m.email.toLowerCase().trim();
					if (!excludedSet.has(emailLower)) {
						recipientMap.set(emailLower, m.fullName || 'Member');
					}
				}
			}

			// 2. If sending to all or executive, also include active members from ExecutiveMember collection
			if (recipientType === 'all' || recipientType === 'executive') {
				const execs = (await ExecutiveMember.find({
					isActive: { $ne: false },
					email: { $exists: true, $ne: '' },
				})
					.select('name email')
					.lean()) as Array<{ name?: string; email?: string }>;

				for (const ex of execs) {
					if (ex.email) {
						const emailLower = ex.email.toLowerCase().trim();
						if (!excludedSet.has(emailLower) && !recipientMap.has(emailLower)) {
							recipientMap.set(emailLower, ex.name || 'Executive Member');
						}
					}
				}
			}
		}

		const recipients = Array.from(recipientMap.entries()).map(([email, fullName]) => ({
			email,
			fullName,
		}));

		if (recipients.length === 0) {
			console.log(`No recipients found for recipientType=${recipientType}`);
			return { success: true, message: 'No members found for this recipient type', sentCount: 0, totalCount: 0 };
		}

		console.log(`Sending message email to ${recipients.length} recipients for: "${messageTitle}"`);

		// Send emails in batches of 5 to avoid overloading SMTP
		const batchSize = 5;
		let sentCount = 0;
		let failedCount = 0;

		for (let i = 0; i < recipients.length; i += batchSize) {
			const batch = recipients.slice(i, i + batchSize);

			const batchPromises = batch.map(async (recipient) => {
				const template = emailTemplates.messageNotification(
					recipient.fullName,
					messageTitle,
					messageContent,
					senderName,
					priority,
					recipient.email,
					attachments
				);

				const result = await sendEmail(recipient.email, template.subject, template.html);

				if (result.success) {
					sentCount++;
					console.log(`Email delivered to ${recipient.email}`);
				} else {
					failedCount++;
					console.error(`Failed to send email to ${recipient.email}:`, result.error);
				}

				return result;
			});

			await Promise.all(batchPromises);

			// Add delay between batches
			if (i + batchSize < recipients.length) {
				await new Promise((resolve) => setTimeout(resolve, 600));
			}
		}

		return {
			success: true,
			message: `Emails delivered to ${sentCount} recipients (${failedCount} failed)`,
			sentCount,
			failedCount,
			totalCount: recipients.length,
		};
	} catch (error) {
		console.error('Error in bulk email sending:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
			sentCount: 0,
			totalCount: 0,
		};
	}
};

// Test email configuration
export const testEmailConfig = async () => {
	try {
		if (!isEmailConfigured()) {
			return { success: false, error: 'EMAIL_USER or EMAIL_APP_PASS is missing in environment' };
		}
		const transporter = createTransporter();
		await transporter.verify();
		console.log('Email configuration is valid');
		return { success: true };
	} catch (error) {
		console.error('Email configuration error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
};
