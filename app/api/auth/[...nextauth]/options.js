import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import User from "@/models/User.Model";
import Membership from "@/models/Membership.Model";
import ConnectDB from "@/lib/mongodb";
import NextAuth from "next-auth";

/** @type {import('next-auth').AuthOptions} */
export const authOptions = {
	session: {
		strategy: "jwt",
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
				console.log("Authorize called with credentials:", credentials);

				await ConnectDB();

				try {
					// First try to find user in User model
					let user = await User.findOne({ email: credentials.email });
					
					// If not found in User model, try Membership model
					if (!user) {
						const member = await Membership.findOne({ 
							email: credentials.email,
							membershipStatus: "approved" // Only allow approved members to login
						});
						
						if (!member) {
							console.log("No user or member found with this email");
							throw new Error("No user found with this email");
						}
						
						// Check if member has a password set
						if (!member.password) {
							console.log("Member has not set password yet");
							throw new Error("Please set your password first. Check your email for the setup link.");
						}
						
						// Validate member password
						const isValid = await bcrypt.compare(credentials.password, member.password);
						if (!isValid) {
							console.log("Invalid member password");
							throw new Error("Invalid credentials");
						}
						
						// Return member data in user format for NextAuth
						return {
							_id: member._id,
							email: member.email,
							fullName: member.fullName,
							phone: member.phone,
							role: "member",
							membershipType: member.membershipType,
							membershipStatus: member.membershipStatus,
							isMember: true, // Flag to identify this is a member
						};
					}
					
					// Existing user validation logic
					// if (!user.isVerified) {
					// 	console.log("Verify first");
					// 	throw new Error("PLease verify your email first");
					// }

					const isValid = await bcrypt.compare(credentials.password, user.password);
					if (!isValid) {
						console.log("Invalid user password");
						throw new Error("Invalid credentials");
					}

					return {
						...user.toObject(),
						isMember: false, // Flag to identify this is a regular user
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
				token.isVerified = user.isVerified;
				token.isAcceptingMessages = user.isAcceptingMessages;
				token.username = user.username;
				token.fullName = user.fullName;
				token.role = user.role;
				token.phone = user.phone;
				// Member-specific fields
				token.isMember = user.isMember;
				token.membershipType = user.membershipType;
				token.membershipStatus = user.membershipStatus;
			}
			return token;
		},
		async session({ session, token }) {
			if (token) {
				session.user = {
					_id: token._id,
					email: token.email,
					isVerified: token.isVerified,
					isAcceptingMessages: token.isAcceptingMessages,
					username: token.username,
					fullName: token.fullName,
					role: token.role,
					phone: token.phone,
					// Member-specific fields
					isMember: token.isMember,
					membershipType: token.membershipType,
					membershipStatus: token.membershipStatus,
				};
			}

			return session;
		},
		async redirect({ url, baseUrl }) {
			// Allows relative callback URLs
			if (url.startsWith("/")) return `${baseUrl}${url}`;
			// Allows callback URLs on the same origin
			else if (new URL(url).origin === baseUrl) return url;
			return baseUrl;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
};

export const { GET, POST } = NextAuth(authOptions);
