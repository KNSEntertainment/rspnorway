import nodemailer from "nodemailer";
import { format } from "date-fns";

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_APP_PASS,
	},
});

export async function sendConfirmationEmail(
	to: string,
	orderDetails: {
		orderId: string;
		eventId: string;
		amount: number;
		currency: string;
	}
) {
	const mailOptions = {
		from: `"RSP Norway School" <${process.env.EMAIL_USER}>`,
		to,
		subject: "Order Confirmation",
		text: `Thank you for your order!
    
Order ID: ${orderDetails.orderId}
Event ID: ${orderDetails.eventId}
Amount: ${orderDetails.amount / 100} ${orderDetails.currency.toUpperCase()}

We look forward to seeing you at the event!`,
		html: `
      <h1>Thank you for your order!</h1>
      <p>Here are your order details:</p>
      <ul>
        <li><strong>Order ID:</strong> ${orderDetails.orderId}</li>
        <li><strong>Event ID:</strong> ${orderDetails.eventId}</li>
        <li><strong>Amount:</strong> ${orderDetails.amount / 100} ${orderDetails.currency.toUpperCase()}</li>
      </ul>
      <p>We look forward to seeing you at the event!</p>
    `,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log("Confirmation email sent successfully");
	} catch (error) {
		console.error("Error sending confirmation email:", error);
		throw new Error("Failed to send confirmation email");
	}
}

export async function sendTourBookingConfirmation(
	to: string,
	bookingDetails: {
		parentFirstName: string;
		parentLastName: string;
		childFirstName: string;
		childLastName: string;
		preferredDate: string;
		preferredTime: string;
		confirmedDate?: string;
		confirmedTime?: string;
		phone: string;
		isReschedule?: boolean;
		previousDate?: string | Date;
		previousTime?: string;
	}
) {
	// Use confirmed date/time if available, otherwise fall back to preferred
	const isReschedule = Boolean(bookingDetails.isReschedule);
	const tourDate = bookingDetails.confirmedDate || bookingDetails.preferredDate;
	const tourTime = bookingDetails.confirmedTime || bookingDetails.preferredTime;
	const formattedDate = format(new Date(tourDate), "EEEE, MMMM d, yyyy");
	const previousDateFormatted = bookingDetails.previousDate ? format(new Date(bookingDetails.previousDate), "EEEE, MMMM d, yyyy") : null;
	const previousTimeFormatted = bookingDetails.previousTime || null;
	const subjectLine = isReschedule ? "School Tour Booking Rescheduled - RSP Norway" : "School Tour Booking Confirmed - RSP Norway";
	const headingText = isReschedule ? "Tour Booking Rescheduled" : "Tour Booking Confirmed!";
	const introText = isReschedule ? "Your school tour booking has been rescheduled." : "Great news! Your school tour booking has been confirmed.";
	const headerIcon = isReschedule ? "🔁" : "🎉";

	const mailOptions = {
		from: `"RSP Norway School" <${process.env.EMAIL_USER}>`,
		to,
		subject: subjectLine,
		text: `Dear ${bookingDetails.parentFirstName} ${bookingDetails.parentLastName},

${introText}

New Tour Details:
Child Name: ${bookingDetails.childFirstName} ${bookingDetails.childLastName}
Date: ${formattedDate}
Time: ${tourTime}

${isReschedule && (previousDateFormatted || previousTimeFormatted) ? `Previous Schedule: ${previousDateFormatted || ""} ${previousTimeFormatted || ""}\n\n` : ""}Please arrive 10 minutes early. If you need to reschedule or have any questions, please contact us.

We look forward to showing you around our school!

Best regards,
RSP Norway School Administration`,
		html: `<!DOCTYPE html>
<html>
<head>
<style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 600px; margin: 0 auto; padding: 20px; }
.header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
.content { background-color: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; }
.details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
.detail-row { padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
.detail-row:last-child { border-bottom: none; }
.label { font-weight: bold; color: #16a34a; }
.pill { display: inline-block; margin-top: 8px; padding: 6px 10px; border-radius: 999px; background: #fef3c7; color: #92400e; font-size: 12px; font-weight: bold; letter-spacing: 0.01em; }
.previous { background: #fff7ed; border: 1px solid #fed7aa; padding: 12px; border-radius: 8px; margin-top: 12px; }
.footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
</style>
</head>
<body>
<div class="container">
<div class="header">
<h1>${headerIcon} ${headingText}</h1>
${isReschedule ? '<div class="pill">Rescheduled</div>' : ""}
</div>
<div class="content">
<h2>Dear ${bookingDetails.parentFirstName} ${bookingDetails.parentLastName},</h2>
<p>${introText}</p>
<div class="details">
<div class="detail-row">
<span class="label">Child Name:</span> ${bookingDetails.childFirstName} ${bookingDetails.childLastName}
</div>
<div class="detail-row">
<span class="label">Tour Date:</span> ${formattedDate}
</div>
<div class="detail-row">
<span class="label">Tour Time:</span> ${tourTime}
</div>
</div>
${
	isReschedule && (previousDateFormatted || previousTimeFormatted)
		? `
<div class="previous">
<strong>Previous schedule:</strong><br />
${previousDateFormatted || ""}${previousDateFormatted && previousTimeFormatted ? " at " : previousDateFormatted ? "" : ""}${previousTimeFormatted || ""}
</div>`
		: ""
}
<p><strong>Important Reminders:</strong></p>
<ul>
<li>Please arrive 10 minutes early</li>
<li>Bring any questions you may have about our programs</li>
<li>Feel free to bring other family members</li>
</ul>
<p>If you need to reschedule or have any questions, please don't hesitate to contact us.</p>
<p>We look forward to welcoming you and showing you around our school!</p>
<p>Best regards,<br>
<strong>RSP Norway School Administration</strong></p>
</div>
<div class="footer">
<p>This is an automated confirmation email. Please do not reply to this email.</p>
<p style="margin-top: 10px;">Visit our website: <a href="https://magicchalk.vercel.app" style="color: #16a34a; text-decoration: none;">magicchalk.vercel.app</a></p>
</div>
</div>
</body>
</html>`,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log("Tour booking confirmation email sent successfully");
	} catch (error) {
		console.error("Error sending tour booking confirmation email:", error);
		throw new Error("Failed to send tour booking confirmation email");
	}
}

export async function sendParentWelcomeEmail(
	to: string,
	options: {
		guardianName?: string;
		studentName?: string;
		classGroup?: string;
		username: string;
		passwordSetUrl: string;
	}
) {
	const guardian = options.guardianName || "Parent";
	const student = options.studentName || "your child";
	const classLabel = options.classGroup ? `Class/Group: ${options.classGroup}` : "";

	const mailOptions = {
		from: `"RSP Norway School" <${process.env.EMAIL_USER}>`,
		to,
		subject: "Welcome to RSP Norway - Parent Portal Access",
		text: `Dear ${guardian},

Welcome to RSP Norway! We're excited to partner with you in ${student}'s learning journey.

${classLabel ? `${classLabel}\n` : ""}Parent Portal Login:
Username: ${options.username}
Set password: ${options.passwordSetUrl}

The portal lets you track updates, events, and notices. Please set your password using the link above.

Best regards,
RSP Norway School`,
		html: `<!DOCTYPE html>
<html>
<head>
<style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; }
.card { max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; }
.header { border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 16px; }
.title { font-size: 20px; font-weight: 700; color: #16a34a; margin: 0; }
.muted { color: #6b7280; font-size: 14px; margin: 4px 0 0 0; }
.section { margin-top: 16px; }
.label { font-weight: 600; color: #111827; }
.btn { display: inline-block; margin-top: 12px; padding: 10px 16px; background: #16a34a; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; }
.pill { display: inline-block; padding: 6px 10px; border-radius: 999px; background: #ecfdf3; color: #15803d; font-size: 12px; font-weight: 600; margin-top: 8px; }
</style>
</head>
<body>
<div class="card">
	<div class="header">
		<p class="title">Welcome to RSP Norway</p>
		<p class="muted">Parent Portal Access</p>
	</div>
	<div class="section">
		<p>Dear ${guardian},</p>
		<p>Welcome to our community! We're excited to support ${student}'s learning journey.</p>
		${classLabel ? `<div class="pill">${classLabel}</div>` : ""}
	</div>
	<div class="section">
		<p class="label">Your login details</p>
		<p>Username: <strong>${options.username}</strong></p>
		<a class="btn" href="${options.passwordSetUrl}">Set your password</a>
		<p class="muted">Use the link above to set your password and access the parent dashboard.</p>
	</div>
	<div class="section">
		<p>If you have any questions, just reply to this email.</p>
		<p>Best regards,<br/>RSP Norway School</p>
	</div>
</div>
</body>
</html>`,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log(`Parent welcome email sent to ${to}`);
	} catch (error) {
		console.error("Error sending parent welcome email:", error);
		throw new Error("Failed to send parent welcome email");
	}
}

export async function sendTeacherInviteEmail(
	to: string,
	options: {
		teacherName: string;
		employeeId: string;
		designation?: string;
		username: string;
		passwordSetUrl: string;
	}
) {
	const name = options.teacherName || "Teacher";
	const role = options.designation ? `${options.designation}` : "Teacher";

	// Use BASE_URL from environment or fallback to localhost
	const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:3000";
	// If the passwordSetUrl is a relative path, prepend BASE_URL
	let passwordSetUrl = options.passwordSetUrl;
	if (passwordSetUrl && passwordSetUrl.startsWith("/")) {
		passwordSetUrl = `${BASE_URL}${passwordSetUrl}`;
	}

	const mailOptions = {
		from: `"RSP Norway School" <${process.env.EMAIL_USER}>`,
		to,
		subject: "Your RSP Norway teacher account",
		text: `Hello ${name},

	Your teacher account has been created.
	Role: ${role}
	Employee ID: ${options.employeeId}
	Username: ${options.username}

	Please set your password using this link:
	${passwordSetUrl}

	Welcome aboard!`,
		html: `<!DOCTYPE html>
	<html>
	<head>
	<style>
	body { font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; }
	.card { max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; }
	.header { border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 16px; }
	.title { font-size: 20px; font-weight: 700; color: #16a34a; margin: 0; }
	.muted { color: #6b7280; font-size: 14px; margin: 4px 0 0 0; }
	.section { margin-top: 16px; }
	.label { font-weight: 600; color: #111827; }
	.btn { display: inline-block; margin-top: 12px; padding: 10px 16px; background: #16a34a; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; }
	.pill { display: inline-block; padding: 6px 10px; border-radius: 999px; background: #ecfdf3; color: #15803d; font-size: 12px; font-weight: 600; margin-top: 8px; }
	</style>
	</head>
	<body>
	<div class="card">
		<div class="header">
			<p class="title">Welcome to RSP Norway</p>
			<p class="muted">Teacher Account</p>
		</div>
		<div class="section">
			<p>Hello ${name},</p>
			<p>Your teacher account has been created. You can now set your password and log in.</p>
			<div class="pill">${role}</div>
		</div>
		<div class="section">
			<p class="label">Your login details</p>
			<p>Username: <strong>${options.username}</strong></p>
			<p>Employee ID: <strong>${options.employeeId}</strong></p>
			<a class="btn" href="${passwordSetUrl}">Set your password</a>
			<p class="muted">Use the link above to set your password and access the teacher dashboard.</p>
		</div>
		<div class="section">
			<p>If you have any questions, just reply to this email.</p>
			<p>Best regards,<br/>RSP Norway School</p>
		</div>
	</div>
	</body>
	</html>`,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log(`Teacher invite email sent to ${to}`);
	} catch (error) {
		console.error("Error sending teacher invite email:", error);
		throw new Error("Failed to send teacher invite email");
	}
}

export async function sendAbsenceNoticeEmail(
	to: string,
	options: {
		guardianName?: string;
		studentName: string;
		classGroup?: string;
		date?: Date | string;
		reason?: string;
		teacherName?: string;
	}
) {
	const guardian = options.guardianName || "Parent";
	const classLabel = options.classGroup ? `Class: ${options.classGroup}` : "";
	const formattedDate = options.date ? format(new Date(options.date), "EEEE, MMM d, yyyy") : "today";
	const teacher = options.teacherName ? `Teacher: ${options.teacherName}` : "";
	const reason = options.reason || "Not marked present";

	const mailOptions = {
		from: `"RSP Norway School" <${process.env.EMAIL_USER}>`,
		to,
		subject: `Absence notice for ${options.studentName}`,
		text: `Dear ${guardian},

${options.studentName} was marked absent on ${formattedDate}.${classLabel ? `\n${classLabel}` : ""}
${teacher ? `${teacher}\n` : ""}Reason: ${reason}

If this is unexpected, please reply to this email.

Thank you,
RSP Norway School`,
		html: `<!DOCTYPE html>
<html>
<head>
<style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; }
.card { max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; }
.title { font-size: 18px; font-weight: 700; color: #16a34a; margin: 0 0 4px 0; }
.muted { color: #6b7280; font-size: 14px; margin: 0; }
.pill { display: inline-block; padding: 6px 10px; border-radius: 999px; background: #ecfdf3; color: #15803d; font-size: 12px; font-weight: 600; margin: 10px 0; }
.section { margin-top: 12px; }
</style>
</head>
<body>
<div class="card">
	<p class="title">Absence notice</p>
	<p class="muted">${formattedDate}</p>
	<div class="section">
		<p>Dear ${guardian},</p>
		<p>${options.studentName} was marked absent today.</p>
		${classLabel ? `<div class="pill">${classLabel}</div>` : ""}
		<p><strong>Reason:</strong> ${reason}</p>
		${teacher ? `<p>${teacher}</p>` : ""}
		<p>If this is unexpected, please reply so we can update attendance.</p>
		<p>Thank you,<br/>RSP Norway School</p>
	</div>
</div>
</body>
</html>`,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log(`Absence email sent to ${to}`);
	} catch (error) {
		console.error("Error sending absence email:", error);
		throw new Error("Failed to send absence email");
	}
}

export async function sendAppointmentConfirmation(
	to: string[],
	details: {
		parentName: string;
		teacherName: string;
		studentName: string;
		date: Date | string;
		time: string;
		topic?: string;
	}
) {
	const formattedDate = format(new Date(details.date), "EEEE, MMMM d, yyyy");
	const subject = `Confirmed: Teacher Meeting - ${details.studentName}`;

	const mailOptions = {
		from: `"RSP Norway" <${process.env.EMAIL_USER}>`,
		to: to.join(", "),
		subject,
		html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #16a34a; padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Meeting Confirmed</h1>
        </div>
        <div style="padding: 24px; color: #1f2937; line-height: 1.6;">
          <p>Hello,</p>
          <p>This is to confirm your upcoming teacher-parent meeting at RSP Norway School.</p>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Student:</strong> ${details.studentName}</p>
            <p style="margin: 0 0 10px 0;"><strong>Parent:</strong> ${details.parentName}</p>
            <p style="margin: 0 0 10px 0;"><strong>Teacher:</strong> ${details.teacherName}</p>
            <p style="margin: 0 0 10px 0;"><strong>Topic:</strong> ${details.topic || "General Discussion"}</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 15px 0;" />
            <p style="margin: 0 0 5px 0; color: #16a34a; font-weight: bold;">Schedule:</p>
            <p style="margin: 0; font-size: 18px;">${formattedDate} at ${details.time}</p>
          </div>

          <p>Please log in to your dashboard if you need to reschedule or view further details.</p>
          <p style="margin-top: 30px;">Best regards,<br/>RSP Norway School</p>
        </div>
      </div>
    `,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log("Appointment confirmation emails sent");
	} catch (error) {
		console.error("Error sending appointment confirmation email:", error);
	}
}
