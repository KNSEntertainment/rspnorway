import CredentialsProvider from "next-auth/providers/credentials";
//import bcrypt from "bcrypt";
import User from "@/models/User.Model";
import ConnectDB from "@/lib/mongodb";
import NextAuth from "next-auth";
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
					const user = await User.findOne({ email: credentials.email });
					if (!user) {
						console.log("No user found with this email");
						throw new Error("No user found with this email");
					}
					// if (!user.isVerified) {
					// 	console.log("Verify first");
					// 	throw new Error("PLease verify your email first");
					// }

					const isValid = credentials.password === user.password;
					// const isValid = await bcrypt.compare(credentials.password, user.password);
					if (!isValid) {
						console.log("Invalid password");
						throw new Error("Invalid credentials");
					}

					return user;
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
				};
			}

			return session;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
};

export const { GET, POST } = NextAuth(authOptions);
