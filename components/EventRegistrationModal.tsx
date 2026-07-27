"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { X, Calendar, MapPin, Clock, ArrowRight, CheckCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Event {
	_id: string;
	eventname: string;
	eventdate: string;
	eventtime?: string;
	eventvenue?: string;
	eventdescription?: string;
	eventposterUrl?: string;
	price?: number;
	studentPrice?: number;
	childPrice?: number;
	childAgeLimit?: string;
	elderlyPrice?: number;
	elderlyAgeLimit?: string;
	maximumSeats?: number;
	registeredSeats?: number;
	registrationEnabled?: boolean;
	paymentCollectionEnabled?: boolean;
	practicalInfo?: string;
}

interface EventRegistrationModalProps {
	event: Event | null;
	isOpen: boolean;
	onClose: () => void;
}

interface RegistrationData {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	adults: number;
	students: number;
	children: number;
	elders: number;
	specialRequests?: string;
}

export default function EventRegistrationModal({ event, isOpen, onClose }: EventRegistrationModalProps) {
	const { data: session } = useSession();
	const [currentStep, setCurrentStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [registrationResult, setRegistrationResult] = useState<{ registrationId?: string; message?: string } | null>(null);
	const [paymentProof, setPaymentProof] = useState<File | null>(null);
	const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
	const [registrationData, setRegistrationData] = useState<RegistrationData>({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		adults: 1,
		students: 0,
		children: 0,
		elders: 0,
		specialRequests: "",
	});

	// Pre-fill member data if logged in
	useEffect(() => {
		if (session?.user) {
			setRegistrationData((prev) => ({
				...prev,
				firstName: session.user.name?.split(" ")[0] || "",
				lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
				email: session.user.email || "",
				phone: session.user.phone || "",
			}));
		}
	}, [session]);

	const calculateTotal = () => {
		if (!event) return 0;
		const adultPrice = event.paymentCollectionEnabled === false ? 0 : Number(event.price || 0);
		const studentPrice = event.paymentCollectionEnabled === false ? 0 : Number(event.studentPrice || 0);
		const childPrice = event.paymentCollectionEnabled === false ? 0 : Number(event.childPrice || 0);
		const elderlyPrice = event.paymentCollectionEnabled === false ? 0 : Number(event.elderlyPrice || 0);
		const adultTotal = (registrationData.adults || 0) * adultPrice;
		const studentTotal = (registrationData.students || 0) * studentPrice;
		const childTotal = (registrationData.children || 0) * childPrice;
		const elderlyTotal = (registrationData.elders || 0) * elderlyPrice;
		return adultTotal + studentTotal + childTotal + elderlyTotal;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (!event) {
				console.error("No event data");
				return;
			}

			const formData = new FormData();
			formData.append("eventId", event._id);
			formData.append("firstName", registrationData.firstName);
			formData.append("lastName", registrationData.lastName);
			formData.append("email", registrationData.email);
			formData.append("phone", registrationData.phone);
			formData.append("adults", String(registrationData.adults));
			formData.append("students", String(registrationData.students));
			formData.append("children", String(registrationData.children));
			formData.append("elders", String(registrationData.elders));
			formData.append("totalAmount", String(calculateTotal()));
			if (registrationData.specialRequests) {
				formData.append("specialRequests", registrationData.specialRequests);
			}
			if (paymentProof) {
				formData.append("paymentProof", paymentProof);
			}

			const response = await fetch("/api/events/register", {
				method: "POST",
				credentials: "include",
				body: formData,
			});

			if (response.ok) {
				const data = await response.json();
				setRegistrationResult({
					registrationId: data.registrationId,
					message: data.message,
				});
				setCurrentStep(4);
			} else {
				const errorData = await response.json();
				alert("Registration failed: " + (errorData.error || "Unknown error"));
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
			alert("Registration failed: " + errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setPaymentProof(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setPaymentProofPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const isEventPast = event ? new Date(event.eventdate).getTime() < new Date().setHours(0, 0, 0, 0) : false;
	const isRegistrationClosed = event?.registrationEnabled === false;
	const maximumSeats = Number(event?.maximumSeats || 0);
	const registeredSeats = Number(event?.registeredSeats || 0);
	const seatsRemaining = maximumSeats > 0 ? Math.max(maximumSeats - registeredSeats, 0) : null;

	if (!isOpen) return null;

	if (isEventPast) {
		return (
			<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
				<div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
					<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<CheckCircle className="w-8 h-8 text-gray-600" />
					</div>
					<h3 className="text-2xl font-bold text-gray-900 mb-2">Event Completed</h3>
					<p className="text-gray-600 mb-6">This event has already taken place.</p>
					<Button onClick={onClose} className="w-full">
						Close
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold text-gray-900">Event Registration</h2>
						<p className="text-gray-600 mt-1">{event?.eventname || ""}</p>
					</div>
					<button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Progress Steps */}
				<div className="px-6 py-4 border-b border-gray-200">
					<div className="flex items-center justify-between">
						{[1, 2, 3, 4].map((step) => (
							<div key={step} className="flex items-center">
								<div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step ? "bg-brand text-white" : "bg-gray-200 text-gray-600"}`}>{currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}</div>
								{step < 4 && <div className={`w-16 h-1 mx-2 ${currentStep > step ? "bg-brand" : "bg-gray-200"}`} />}
							</div>
						))}
					</div>
					<div className="flex justify-between mt-2 text-xs text-gray-600">
						<span>Details</span>
						<span>Attendees</span>
						<span>Payment</span>
						<span>Confirmation</span>
					</div>
				</div>

				{/* Content */}
				<div className="p-6">
					{currentStep === 1 && <EventDetailsStep event={event} onNext={() => setCurrentStep(2)} disabled={isRegistrationClosed || isEventPast || seatsRemaining === 0} seatsRemaining={seatsRemaining} />}
					{currentStep === 2 && <AttendeeInfoStep data={registrationData} onChange={setRegistrationData} onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />}
					{currentStep === 3 && <PaymentStep event={event} data={registrationData} onSubmit={handleSubmit} onBack={() => setCurrentStep(2)} loading={loading} paymentProof={paymentProof} paymentProofPreview={paymentProofPreview} onPaymentProofChange={handlePaymentProofChange} />}
					{currentStep === 4 && <ConfirmationStep registrationId={registrationResult?.registrationId} message={registrationResult?.message} onClose={onClose} />}
				</div>
			</div>
		</div>
	);
}

function EventDetailsStep({ event, onNext, disabled, seatsRemaining }: { event: Event | null; onNext: () => void; disabled: boolean; seatsRemaining: number | null }) {
	if (!event) return null;
	const eventDate = new Date(event.eventdate);
	const formattedDate = eventDate.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<div className="space-y-6">
			<div className="grid md:grid-cols-2 gap-6">
				<div>
					{event.eventposterUrl ? (
						<Image src={event.eventposterUrl} alt={event.eventname} width={400} height={192} className="w-full h-48 object-cover rounded-lg" />
					) : (
						<div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
							<Calendar className="w-12 h-12 text-indigo-300" />
						</div>
					)}
				</div>
				<div className="space-y-4">
					<div>
						<h3 className="text-xl font-bold text-gray-900">{event.eventname}</h3>
						<div className="space-y-2 mt-3">
							<div className="flex items-center gap-2 text-gray-600">
								<Calendar className="w-4 h-4" />
								<span>{formattedDate}</span>
							</div>
							{event.eventtime && (
								<div className="flex items-center gap-2 text-gray-600">
									<Clock className="w-4 h-4" />
									<span>{event.eventtime}</span>
								</div>
							)}
							{event.eventvenue && (
								<div className="flex items-center gap-2 text-gray-600">
									<MapPin className="w-4 h-4" />
									<span>{event.eventvenue}</span>
								</div>
							)}
						</div>
					</div>

					{event.paymentCollectionEnabled !== false && (
						<div className="bg-gray-50 rounded-lg p-4">
							<h4 className="font-semibold text-gray-900 mb-2">Pricing</h4>
							{event.price !== undefined && event.price !== null && (
								<div className="flex justify-between text-sm">
									<span>Adults</span>
									<span className="font-medium">NOK {Number(event.price || 0)}</span>
								</div>
							)}
							{event.studentPrice !== undefined && event.studentPrice !== null && (
								<div className="flex justify-between text-sm">
									<span>Students</span>
									<span className="font-medium">NOK {Number(event.studentPrice)}</span>
								</div>
							)}
							{event.childPrice !== undefined && event.childPrice !== null && (
								<div className="flex justify-between text-sm">
									<span>Children{event.childAgeLimit ? ` (${event.childAgeLimit})` : ""}</span>
									<span className="font-medium">NOK {Number(event.childPrice)}</span>
								</div>
							)}
							{event.elderlyPrice !== undefined && event.elderlyPrice !== null && (
								<div className="flex justify-between text-sm">
									<span>Elderly{event.elderlyAgeLimit ? ` (${event.elderlyAgeLimit})` : ""}</span>
									<span className="font-medium">NOK {Number(event.elderlyPrice)}</span>
								</div>
							)}
						</div>
					)}
					{seatsRemaining !== null && <Badge variant={seatsRemaining > 0 ? "default" : "destructive"}>{seatsRemaining > 0 ? `${seatsRemaining} seats remaining` : "Sold out"}</Badge>}
				</div>
			</div>

			<div className="flex justify-end">
				<Button onClick={onNext} disabled={disabled} className="flex items-center gap-2">
					Continue to Registration
					<ArrowRight className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
}

function AttendeeInfoStep({ data, onChange, onNext, onBack }: { data: RegistrationData; onChange: (data: RegistrationData) => void; onNext: () => void; onBack: () => void }) {
	const [errors, setErrors] = useState<Record<string, string>>({});

	const updateData = (field: keyof RegistrationData, value: string | number) => {
		onChange({ ...data, [field]: value });
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
		if (field === "adults" && errors.adults) {
			setErrors((prev) => ({ ...prev, adults: "" }));
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!data.firstName.trim()) {
			newErrors.firstName = "First name is required";
		}
		if (!data.lastName.trim()) {
			newErrors.lastName = "Last name is required";
		}
		if (!data.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
			newErrors.email = "Please enter a valid email address";
		}
		if (!data.phone.trim()) {
			newErrors.phone = "Phone number is required";
		} else if (!/^\+?[\d\s\-\(\)]+$/.test(data.phone)) {
			newErrors.phone = "Please enter a valid phone number";
		}
		if (!data.adults || data.adults < 1) {
			newErrors.adults = "Please select at least 1 adult";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNext = () => {
		if (validateForm()) {
			onNext();
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
				<div className="grid md:grid-cols-2 gap-4">
					<div>
						<Label htmlFor="firstName">First Name *</Label>
						<Input id="firstName" value={data.firstName} onChange={(e) => updateData("firstName", e.target.value)} className={errors.firstName ? "border-red-500" : ""} />
						{errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
					</div>
					<div>
						<Label htmlFor="lastName">Last Name *</Label>
						<Input id="lastName" value={data.lastName} onChange={(e) => updateData("lastName", e.target.value)} className={errors.lastName ? "border-red-500" : ""} />
						{errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
					</div>
					<div>
						<Label htmlFor="email">Email *</Label>
						<Input id="email" type="email" value={data.email} onChange={(e) => updateData("email", e.target.value)} className={errors.email ? "border-red-500" : ""} />
						{errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
					</div>
					<div>
						<Label htmlFor="phone">Phone *</Label>
						<Input id="phone" value={data.phone} onChange={(e) => updateData("phone", e.target.value)} className={errors.phone ? "border-red-500" : ""} />
						{errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
					</div>
				</div>
			</div>

			<div>
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Number of Attendees</h3>
				<div className="grid md:grid-cols-4 gap-4">
					<div>
						<Label htmlFor="adults">Adults *</Label>
						<Select value={data.adults.toString()} onValueChange={(value) => updateData("adults", parseInt(value))}>
							<SelectTrigger className={errors.adults ? "border-red-500" : ""}>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
									<SelectItem key={num} value={num.toString()}>
										{num} {num === 1 ? "Adult" : "Adults"}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errors.adults && <p className="text-red-500 text-sm mt-1">{errors.adults}</p>}
					</div>
					<div>
						<Label htmlFor="students">Students</Label>
						<Select value={data.students.toString()} onValueChange={(value) => updateData("students", parseInt(value))}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{[0, 1, 2, 3, 4, 5, 6].map((num) => (
									<SelectItem key={num} value={num.toString()}>
										{num} {num === 1 ? "Student" : "Students"}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label htmlFor="children">Children</Label>
						<Select value={data.children.toString()} onValueChange={(value) => updateData("children", parseInt(value))}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{[0, 1, 2, 3, 4, 5, 6].map((num) => (
									<SelectItem key={num} value={num.toString()}>
										{num} {num === 1 ? "Child" : "Children"}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label htmlFor="elders">Elderly</Label>
						<Select value={data.elders.toString()} onValueChange={(value) => updateData("elders", parseInt(value))}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{[0, 1, 2, 3, 4, 5, 6].map((num) => (
									<SelectItem key={num} value={num.toString()}>
										{num} {num === 1 ? "Elderly" : "Elderly"}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			<div>
				<Label htmlFor="specialRequests">Special Requests (Optional)</Label>
				<textarea id="specialRequests" className="w-full p-3 border border-gray-300 rounded-lg resize-none" rows={3} value={data.specialRequests} onChange={(e) => updateData("specialRequests", e.target.value)} placeholder="Any dietary restrictions, accessibility needs, or other requests..." />
			</div>

			<div className="flex justify-between">
				<Button variant="outline" onClick={onBack}>
					Back
				</Button>
				<Button onClick={handleNext} className="flex items-center gap-2">
					Continue to Payment
					<ArrowRight className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
}

function PaymentStep({ event, data, onSubmit, onBack, loading, paymentProof, paymentProofPreview, onPaymentProofChange }: { event: Event | null; data: RegistrationData; onSubmit: (e: React.FormEvent) => void; onBack: () => void; loading: boolean; paymentProof: File | null; paymentProofPreview: string | null; onPaymentProofChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
	if (!event) return null;

	const adultPrice = event.paymentCollectionEnabled === false ? 0 : Number(event.price || 0);
	const studentPrice = event.paymentCollectionEnabled === false ? 0 : Number(event.studentPrice || 0);
	const childPrice = event.paymentCollectionEnabled === false ? 0 : Number(event.childPrice || 0);
	const elderlyPrice = event.paymentCollectionEnabled === false ? 0 : Number(event.elderlyPrice || 0);

	const adultTotal = (data.adults || 0) * adultPrice;
	const studentTotal = (data.students || 0) * studentPrice;
	const childTotal = (data.children || 0) * childPrice;
	const elderlyTotal = (data.elders || 0) * elderlyPrice;
	const totalAmount = adultTotal + studentTotal + childTotal + elderlyTotal;

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
				<Card>
					<CardContent className="p-6">
						<div className="space-y-4">
							<div>
								<h4 className="font-medium text-gray-900">{event.eventname}</h4>
								<p className="text-sm text-gray-600">
									{new Date(event.eventdate).toLocaleDateString("en-US", {
										weekday: "long",
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</p>
							</div>

							<div className="border-t pt-4">
								<div className="space-y-3">
									{data.adults > 0 && (
										<div className="flex justify-between text-sm text-gray-600">
											<span>
												{data.adults} Adult{data.adults > 1 ? "s" : ""} × NOK {adultPrice}
											</span>
											<span>NOK {adultTotal}</span>
										</div>
									)}
									{data.students > 0 && (
										<div className="flex justify-between text-sm text-gray-600">
											<span>
												{data.students} Student{data.students > 1 ? "s" : ""} × NOK {studentPrice}
											</span>
											<span>NOK {studentTotal}</span>
										</div>
									)}
									{data.children > 0 && (
										<div className="flex justify-between text-sm text-gray-600">
											<span>
												{data.children} Child{data.children > 1 ? "ren" : ""} × NOK {childPrice}
											</span>
											<span>NOK {childTotal}</span>
										</div>
									)}
									{data.elders > 0 && (
										<div className="flex justify-between text-sm text-gray-600">
											<span>
												{data.elders} Elderly × NOK {elderlyPrice}
											</span>
											<span>NOK {elderlyTotal}</span>
										</div>
									)}
								</div>
							</div>

							<div className="border-t pt-4">
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">Subtotal</span>
										<span>NOK {totalAmount}</span>
									</div>
								</div>
							</div>

							<div className="border-t pt-4">
								<div className="flex justify-between font-semibold">
									<span>Total Amount</span>
									<span className="text-lg">NOK {totalAmount}</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{totalAmount > 0 && (
				<div>
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Payment</h3>
					<Card>
						<CardContent className="p-6">
							<div className="space-y-4">
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
									<p className="text-sm font-semibold text-blue-800 mb-2">Pay with Vipps Now</p>
									{/* <p className="text-xs text-blue-600 mb-3">Scan the QR code below to pay with Vipps</p>
                  <div className="w-48 h-48 mx-auto bg-white rounded-lg border-2 border-blue-300 flex items-center justify-center mb-3">
                    <svg viewBox="0 0 100 100" className="w-40 h-40">
                      <rect x="0" y="0" width="100" height="100" fill="white" />
                      <rect x="5" y="5" width="30" height="30" fill="#1a1a1a" rx="2" />
                      <rect x="65" y="5" width="30" height="30" fill="#1a1a1a" rx="2" />
                      <rect x="5" y="65" width="30" height="30" fill="#1a1a1a" rx="2" />
                      <rect x="40" y="40" width="20" height="20" fill="#1a1a1a" rx="2" />
                      {[15, 25, 40, 50, 60, 75, 85].map((x, i) =>
                        [15, 25, 40, 50, 60, 75, 85].map((y, j) =>
                          (i + j) % 3 !== 0 ? null : (
                            <rect key={`${i}-${j}`} x={x} y={y} width="5" height="5" fill="#1a1a1a" rx="1" />
                          )
                        )
                      )}
                    </svg>
                  </div> */}
									<p className="text-xl text-gray-700">
										Vipps number: <strong>40387207</strong>
									</p>
									<p className="text-lg text-gray-500">(Anusuiya Timilsina)</p>
								</div>

								<div>
									<Label htmlFor="paymentProof">Upload Payment Proof</Label>
									<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mt-2">
										<input type="file" id="paymentProof" accept="image/*,.pdf" onChange={onPaymentProofChange} className="hidden" />
										<label htmlFor="paymentProof" className="cursor-pointer">
											<Upload className="mx-auto h-10 w-10 text-gray-400" />
											<p className="mt-2 text-sm text-gray-600">Click to upload payment screenshot or receipt</p>
											<p className="text-xs text-gray-500">Images or PDF (Max 5MB)</p>
										</label>
									</div>
									{paymentProofPreview && (
										<div className="mt-3">
											<p className="text-sm text-gray-600 mb-2">Payment proof preview:</p>
											<Image src={paymentProofPreview} alt="Payment proof preview" width={300} height={200} className="max-h-48 rounded border object-contain" />
										</div>
									)}
									{paymentProof && !paymentProofPreview && <p className="text-sm text-gray-600 mt-2">File selected: {paymentProof.name}</p>}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			<div className="flex justify-between">
				<Button variant="outline" onClick={onBack}>
					Back
				</Button>
				<Button onClick={onSubmit} disabled={loading || (totalAmount > 0 && !paymentProof)} className="flex items-center gap-2">
					{loading ? (
						<>
							<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
							Submitting...
						</>
					) : (
						<>
							Complete Registration
							<ArrowRight className="w-4 h-4" />
						</>
					)}
				</Button>
			</div>
			{totalAmount > 0 && !paymentProof && <p className="text-xs text-amber-600 text-center">Please upload payment proof to complete registration</p>}
		</div>
	);
}

function ConfirmationStep({ registrationId, message, onClose }: { registrationId?: string; message?: string; onClose: () => void }) {
	return (
		<div className="text-center space-y-6">
			<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
				<CheckCircle className="w-8 h-8 text-green-600" />
			</div>

			<div>
				<h3 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted!</h3>
				<p className="text-gray-600">{message || "Your registration has been submitted and is pending verification. You will receive a confirmation email with your QR code once your payment is verified by our team."}</p>
			</div>

			<div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
				<p className="text-sm text-amber-800 font-medium mb-2">What happens next?</p>
				<ul className="text-sm text-amber-700 text-left space-y-2">
					<li>✓ Our team will verify your payment</li>
					<li>✓ Once approved, you will receive a confirmation email</li>
					<li>✓ The email will contain your entry QR code</li>
					<li>✓ Please present the QR code at the event entrance</li>
				</ul>
			</div>

			{registrationId && <p className="text-xs text-gray-500 font-mono">Registration ID: {registrationId}</p>}

			<div className="flex justify-center">
				<Button onClick={onClose}>Close</Button>
			</div>
		</div>
	);
}
