import nodemailer from 'nodemailer';
import Membership from '@/models/Membership.Model';

// Email configuration
const emailConfig = {
	host: process.env.SMTP_HOST || 'smtp.gmail.com',
	port: parseInt(process.env.SMTP_PORT || '587'),
	secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
};

// Create transporter
const createTransporter = () => {
	return nodemailer.createTransport(emailConfig);
};

// Email templates
export const emailTemplates = {
	messageNotification: (memberName: string, messageTitle: string, messageContent: string, senderName: string, priority: string) => ({
		subject: `PNSB-Norway ${priority === 'urgent' ? 'URGENT: ' : ''}${messageTitle}`,
		html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PNSB-Norway Message</title>
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
        .priority-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 20px;
        }
        .urgent { background-color: #ef4444; color: white; }
        .high { background-color: #f97316; color: white; }
        .medium { background-color: #eab308; color: white; }
        .low { background-color: #22c55e; color: white; }
        .message-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #1f2937;
        }
        .message-content {
            background-color: #f8fafc;
            padding: 20px;
            border-left: 4px solid #2563eb;
            margin: 20px 0;
            white-space: pre-wrap;
        }
        .sender-info {
            font-style: italic;
            color: #6b7280;
            margin-top: 20px;
        }
        .cta-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            text-align: center;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
        }
        .unsubscribe {
            margin-top: 15px;
        }
        .unsubscribe a {
            color: #6b7280;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">PNSB-Norway</div>
        </div>
        
        <p>Dear ${memberName},</p>
        
        <div class="priority-badge ${priority}">${priority} Priority</div>
        
        <div class="message-title">${messageTitle}</div>
        
        <div class="message-content">${messageContent}</div>
        
        <div class="sender-info">
            Sent by: ${senderName}<br>
            PNSB-Norway Administration
        </div>
        
        <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/en/profile/messages" class="cta-button">
                View Full Message
            </a>
        </div>
        
        <div class="footer">
            <p>This message was sent to you because you are a member of PNSB-Norway.</p>
            <p>© 2024 PNSB-Norway. All rights reserved.</p>
            <div class="unsubscribe">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(memberName + '@example.com')}">
                    Unsubscribe from future messages
                </a>
            </div>
        </div>
    </div>
</body>
</html>
		`,
	}),
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
		const transporter = createTransporter();
		
		const mailOptions = {
			from: `"PNSB-Norway" <${process.env.SMTP_USER}>`,
			to,
			subject,
			html,
		};

		const result = await transporter.sendMail(mailOptions);
		console.log('Email sent successfully:', result.messageId);
		return { success: true, messageId: result.messageId };
	} catch (error) {
		console.error('Error sending email:', error);
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
	excludeEmails: string[] = []
) => {
	try {
		// Get target members based on recipient type
		const query: {
			email: { $nin: string[] };
			membershipType?: string;
		} = { email: { $nin: excludeEmails } };
		
		if (recipientType === 'executive') {
			query.membershipType = 'executive';
		} else if (recipientType === 'general') {
			query.membershipType = 'general';
		}
		// 'all' means no additional filtering

		const members = await Membership.find(query).select('fullName email');
		
		if (members.length === 0) {
			return { success: true, message: 'No members found for this recipient type', sentCount: 0 };
		}

		console.log(`Sending bulk email to ${members.length} members`);

		// Send emails in batches to avoid overwhelming the email service
		const batchSize = 10;
		let sentCount = 0;
		let failedCount = 0;

		for (let i = 0; i < members.length; i += batchSize) {
			const batch = members.slice(i, i + batchSize);
			
			const batchPromises = batch.map(async (member) => {
				const template = emailTemplates.messageNotification(
					member.fullName,
					messageTitle,
					messageContent,
					senderName,
					priority
				);

				const result = await sendEmail(member.email, template.subject, template.html);
				
				if (result.success) {
					sentCount++;
					console.log(`Email sent to ${member.email}`);
				} else {
					failedCount++;
					console.error(`Failed to send email to ${member.email}:`, result.error);
				}
				
				return result;
			});

			// Wait for batch to complete before processing next batch
			await Promise.all(batchPromises);
			
			// Add delay between batches to avoid rate limiting
			if (i + batchSize < members.length) {
				await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
			}
		}

		return {
			success: true,
			message: `Bulk email sending completed`,
			sentCount,
			failedCount,
			totalCount: members.length,
		};

	} catch (error) {
		console.error('Error in bulk email sending:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
			sentCount: 0,
		};
	}
};

// Test email configuration
export const testEmailConfig = async () => {
	try {
		const transporter = createTransporter();
		await transporter.verify();
		console.log('Email configuration is valid');
		return { success: true };
	} catch (error) {
		console.error('Email configuration error:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Unknown error' 
		};
	}
};
