import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/models/User.Model";
import Membership from "@/models/Membership.Model";
import ConnectDB from "@/lib/mongodb";
import NextAuth from "next-auth";

/** @type {import('next-auth').AuthOptions} */
export const authOptions = {
	session: {
		strategy: "jwt",
		maxAge: 24 * 60 * 60, // 24 hours
	},
	providers: [
		CredentialsProvider({
			id: "credentials",
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				await ConnectDB();

				try {
					if (!credentials?.email) {
						throw new Error("Email is required");
					}

					// First check if it's an admin user in User model
					const user = await User.findOne({ email: credentials.email });
					
					if (user) {
						// Validate admin password
						const isValid = await bcrypt.compare(credentials.password, user.password);
						if (!isValid) {
							throw new Error("Invalid credentials");
						}
						
						// Return admin user data
						return {
							_id: user._id,
							email: user.email,
							fullName: user.fullName,
							phone: user.phone,
							role: user.role,
							isMember: false, // Flag to identify this is an admin user
						};
					}

					// If not admin, check if it's a member in Membership model
					// Allow both pending and approved members to login (pending members get limited access)
					const member = await Membership.findOne({ 
						email: credentials.email,
						membershipStatus: { $in: ["pending", "approved"] } // Allow pending and approved members
					});
					
					if (!member) {
						throw new Error("No member found with this email. Please register first.");
					}
					
					// Check if member account is blocked
					if (member.membershipStatus === "blocked") {
						throw new Error("Your account has been blocked. Please contact support.");
					}
					
					// Check if member has a password set
					if (!member.password) {
						throw new Error("Please set your password first. Check your email for the setup link.");
					}
					
					// Check if account is locked due to too many failed attempts
					if (member.lockUntil && member.lockUntil > Date.now()) {
						throw new Error("Account temporarily locked due to too many failed attempts. Please try again later.");
					}
					
					// Validate member password
					const isValid = await bcrypt.compare(credentials.password, member.password);
					if (!isValid) {
						// Increment login attempts
						await Membership.findByIdAndUpdate(member._id, {
							$inc: { loginAttempts: 1 },
							$set: { 
								lockUntil: member.loginAttempts + 1 >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : undefined // Lock for 15 minutes after 5 attempts
							}
						});
						throw new Error("Invalid credentials");
					}
					
					// Reset login attempts on successful login
					await Membership.findByIdAndUpdate(member._id, {
						$set: { 
							loginAttempts: 0, 
							lockUntil: undefined,
							lastLoginAt: new Date()
						}
					});
					
					// Return member data for NextAuth
					return {
						_id: member._id,
						email: member.email,
						fullName: member.fullName,
						phone: member.phone,
						role: "member", // All members get "member" role
						membershipType: member.membershipType,
						membershipStatus: member.membershipStatus,
						isMember: true, // Flag to identify this is a member
						emailVerified: member.emailVerified,
					};
				} catch (error) {
					throw new Error(error.message);
				}
			},
		}),
	],
	pages: {
		signIn: "/login",
		signOut: "/logout",
		error: "/error",
		verifyRequest: "/verify-request",
		newUser: null,
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token._id = user._id;
				token.fullName = user.fullName;
				token.role = user.role;
				token.phone = user.phone;
				// Member-specific fields
				token.isMember = user.isMember;
				token.membershipType = user.membershipType;
				token.membershipStatus = user.membershipStatus;
				token.emailVerified = user.emailVerified;
			}
			return token;
		},
		async session({ session, token }) {
			if (token) {
				session.user = {
					_id: token._id,
					email: token.email,
					fullName: token.fullName,
					role: token.role,
					phone: token.phone,
					// Member-specific fields
					isMember: token.isMember,
					membershipType: token.membershipType,
					membershipStatus: token.membershipStatus,
					emailVerified: token.emailVerified,
				};
			}

			return session;
		},
		async redirect({ url, baseUrl }) {
			// If logging in from /login page, redirect based on user role
			if (url === "/login" || url.includes("/login")) {
				// This will be handled by the client-side logic
				return baseUrl; // Fallback to home
			}
			// Allows relative callback URLs, but ensure no duplicate locale prefix
			if (url.startsWith("/")) {
				// Check if URL already has a locale prefix
				const localeMatch = url.match(/^\/(en|no|ne)\//);
				if (localeMatch) {
					return `${baseUrl}${url}`; // Already has locale, use as-is
				}
				// No locale prefix, add default locale
				return `${baseUrl}/en${url}`;
			}
			// Allows callback URLs on the same origin
			else if (new URL(url).origin === baseUrl) return url;
			return baseUrl;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
};

export const { GET, POST } = NextAuth(authOptions);
