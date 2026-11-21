import { DefaultSession } from "next-auth";

declare module "next-auth" {
	interface Session {
		user: {
			id?: string;
			_id?: string;
			role?: string;
			fullName?: string;
			username?: string;
			phone?: string;
			position?: string;
			// Member-specific fields
			isMember?: boolean;
			membershipType?: string;
			membershipStatus?: string;
		} & DefaultSession["user"];
	}

	interface User {
		id?: string;
		_id?: string;
		role?: string;
		fullName?: string;
		username?: string;
		phone?: string;
		position?: string;
		// Member-specific fields
		isMember?: boolean;
		membershipType?: string;
		membershipStatus?: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id?: string;
		_id?: string;
		role?: string;
		fullName?: string;
		username?: string;
		phone?: string;
		position?: string;
		// Member-specific fields
		isMember?: boolean;
		membershipType?: string;
		membershipStatus?: string;
	}
}
