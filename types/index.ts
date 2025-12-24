import { ObjectId } from "mongodb";

export interface Event {
	_id?: ObjectId;
	name: string;
	date: Date;
	location: string;
	description: string;
}

export interface Artist {
	_id?: ObjectId;
	name: string;
	genre: string;
	bio: string;
}

export interface Testimonial {
	_id?: ObjectId;
	author: string;
	content: string;
	rating: number;
}
