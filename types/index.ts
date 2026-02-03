export interface Download {
	id: string;
	title: string;
	date: string;
	fileUrl: string;
	imageUrl?: string;
	category: string;
	downloadCount: number;
}
import { ObjectId } from "mongodb";

export interface Blog {
	_id: ObjectId;
	blogTitle: string;
	blogDate: string;
	// Add other properties as needed
}

export interface Event {
	_id?: ObjectId;
	name: string;
	date: Date;
	location: string;
	description: string;
}

export interface Membership {
	_id: string;
	fullName: string;
	email: string;
	phone: string;
	address: string;
	city: string;
	postalCode: string;
	dateOfBirth: string;
	gender: string;
	province?: string;
	district?: string;
	profession?: string;
	membershipType: "general" | "active";
	membershipStatus: "blocked" | "pending" | "approved";
	nationalMembershipNo?: string;
	skills?: string;
	volunteerInterest?: string[];
	agreeTerms: boolean;
	profilePhoto?: string;
	createdAt: string;
}

export interface LocalizedString {
	en?: string;
	no?: string;
	ne?: string;
}
