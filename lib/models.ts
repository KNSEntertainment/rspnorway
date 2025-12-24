export interface TimeSlot {
	time: string;
	isBooked: boolean;
}

export interface AvailableDate {
	date: Date;
	timeSlots: TimeSlot[];
}

export interface Appointment {
	_id?: string;
	name: string;
	email: string;
	phone: string;
	date: Date;
	time: string;
	createdAt: Date;
}
