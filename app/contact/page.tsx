"use client";

import { useState } from "react";
import { useForm, SubmitHandler, ControllerRenderProps, FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Send, User, Users } from "lucide-react";
import { submitMessage } from "../actions/submitMessage";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
	firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
	lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
	email: z.string().email({ message: "Invalid email address." }),
	phone: z.string().trim().min(1, { message: "Phone number is required." }),
	message: z.string().min(10, { message: "Message must be at least 10 characters." }),
	agreeToTerms: z.boolean().refine((value) => value === true, {
		message: "You must agree to the privacy policy.",
	}),
});

type FormSchemaType = z.infer<typeof formSchema>;

export default function ContactPage() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<FormSchemaType>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
			message: "",
			agreeToTerms: false,
		},
	});

	const onSubmit: SubmitHandler<FormSchemaType> = async (values) => {
		setIsSubmitting(true);

		const formData = new FormData();
		Object.entries(values).forEach(([key, value]) => {
			if (key !== "agreeToTerms") {
				formData.append(key, typeof value === "boolean" ? value.toString() : value);
			}
		});

		try {
			const result = await submitMessage(formData);

			if (result.success) {
				toast({
					title: "Message Sent Successfully",
					description: "Thank you for reaching out. We'll get back to you soon!",
				});
				form.reset();
			} else {
				toast({
					title: "Submission Failed",
					description: result.message || "Please try again later.",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error" + error,
				description: "Something went wrong. Please try again later.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="bg-gradient-to-b from-[#0094da] to-white min-h-screen">
			<div className="container max-w-6xl mx-auto px-4 pt-32 pb-20">
				<div className="text-center mb-16">
					<h1 className="text-4xl font-bold mb-4">
						Get in <span className="text-[#0094da]">Touch</span>
					</h1>
					<div className="w-24 h-1 bg-[#0094da] mx-auto mb-6 rounded-full"></div>
					<p className="text-gray-600 max-w-2xl mx-auto text-lg">Have questions? We would love to hear from you. Whether you are curious about our programs, enrollment process, or facilities, we are here to help. Send us a message, and our team will get back to you as soon as possible! 😊</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
					{/* Contact Information Cards */}
					<div className="lg:col-span-4 order-2 lg:order-1 flex flex-col gap-6">
						<Card className="overflow-hidden border-none shadow-lg bg-white">
							<div className="bg-[#0094da] h-1"></div>
							<CardContent className="p-6 flex items-center space-x-4">
								<div className="w-12 h-12 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0">
									<MapPin className="w-6 h-6 text-[#0094da]" />
								</div>
								<div>
									<h3 className="font-semibold text-lg mb-1">Visit Us</h3>
									<p className="text-gray-600">Lalitpur, Satdobato</p>
								</div>
							</CardContent>
						</Card>

						<Card className="overflow-hidden border-none shadow-lg bg-white">
							<div className="bg-[#0094da] h-1"></div>
							<CardContent className="p-6 flex items-center space-x-4">
								<div className="w-12 h-12 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0">
									<Phone className="w-6 h-6 text-[#0094da]" />
								</div>
								<div>
									<h3 className="font-semibold text-lg mb-1">Call Us</h3>
									<p className="text-gray-600">+977 1-5454294</p>
								</div>
							</CardContent>
						</Card>

						<Card className="overflow-hidden border-none shadow-lg bg-white">
							<div className="bg-[#0094da] h-1"></div>
							<CardContent className="p-6 flex items-center space-x-4">
								<div className="w-12 h-12 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0">
									<Mail className="w-6 h-6 text-[#0094da]" />
								</div>
								<div>
									<h3 className="font-semibold text-lg mb-1">Email Us</h3>
									<p className="text-gray-600">magicchalk.edu@gmail.com</p>
								</div>
							</CardContent>
						</Card>

						<div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
							<h3 className="font-bold text-lg mb-4">Operating Hours</h3>
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="text-gray-600">Monday - Friday</span>
									<span className="font-medium">9:00 AM - 5:00 PM</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Saturday</span>
									<span className="font-medium">10:00 AM - 2:00 PM</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Sunday</span>
									<span className="font-medium">Closed</span>
								</div>
							</div>
						</div>
					</div>

					{/* Contact Form */}
					<div className="lg:col-span-8 order-1 lg:order-2">
						<Card className="border-none shadow-xl overflow-hidden bg-white">
							<div className="bg-[#0094da] h-1"></div>
							<CardContent className="p-8">
								<h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>

								<Form {...form}>
									<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
											<FormField
												control={form.control}
												name="firstName"
												render={({ field }: { field: ControllerRenderProps<FormSchemaType, FieldPath<FormSchemaType>> }) => (
													<FormItem>
														<FormLabel className="text-gray-700 font-medium">First Name</FormLabel>
														<FormControl>
															<div className="relative">
																<User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
																<Input placeholder="Kamal" className="pl-10 py-6 focus:ring-2 focus:ring-[#0094da] focus:border-[#0094da] transition-all" {...field} value={typeof field.value === "boolean" ? field.value.toString() : field.value} />
															</div>
														</FormControl>
														<FormMessage className="text-[#0094da]" />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="lastName"
												render={({ field }: { field: ControllerRenderProps<FormSchemaType, FieldPath<FormSchemaType>> }) => (
													<FormItem>
														<FormLabel className="text-gray-700 font-medium">Last Name</FormLabel>
														<FormControl>
															<div className="relative">
																<Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
																<Input placeholder="Adhikari" className="pl-10 py-6 focus:ring-2 focus:ring-[#0094da] focus:border-[#0094da] transition-all" {...field} value={typeof field.value === "boolean" ? field.value.toString() : field.value} />
															</div>
														</FormControl>
														<FormMessage className="text-[#0094da]" />
													</FormItem>
												)}
											/>
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
											<FormField
												control={form.control}
												name="email"
												render={({ field }: { field: ControllerRenderProps<FormSchemaType, FieldPath<FormSchemaType>> }) => (
													<FormItem>
														<FormLabel className="text-gray-700 font-medium">Email</FormLabel>
														<FormControl>
															<div className="relative">
																<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
																<Input placeholder="kamal_adh@gmail.com" className="pl-10 py-6 focus:ring-2 focus:ring-[#0094da] focus:border-[#0094da] transition-all" {...field} value={typeof field.value === "boolean" ? field.value.toString() : field.value} />
															</div>
														</FormControl>
														<FormMessage className="text-[#0094da]" />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="phone"
												render={({ field }: { field: ControllerRenderProps<FormSchemaType, FieldPath<FormSchemaType>> }) => (
													<FormItem>
														<FormLabel className="text-gray-700 font-medium">Phone Number</FormLabel>
														<FormControl>
															<div className="relative">
																<Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
																<Input type="tel" placeholder="+47 46114530" className="pl-10 py-6 focus:ring-2 focus:ring-[#0094da] focus:border-[#0094da] transition-all" {...field} value={typeof field.value === "boolean" ? field.value.toString() : field.value} />
															</div>
														</FormControl>
														<FormMessage className="text-[#0094da]" />
													</FormItem>
												)}
											/>
										</div>

										<FormField
											control={form.control}
											name="message"
											render={({ field }: { field: ControllerRenderProps<FormSchemaType, FieldPath<FormSchemaType>> }) => (
												<FormItem>
													<FormLabel className="text-gray-700 font-medium">Message</FormLabel>
													<FormControl>
														<Textarea rows={5} placeholder="Your message here..." className="resize-none focus:ring-2 focus:ring-[#0094da] focus:border-[#0094da] transition-all" {...field} value={typeof field.value === "boolean" ? field.value.toString() : field.value} />
													</FormControl>
													<FormMessage className="text-[#0094da]" />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="agreeToTerms"
											render={({ field }: { field: ControllerRenderProps<FormSchemaType, FieldPath<FormSchemaType>> }) => (
												<FormItem className="flex flex-row items-start space-x-3 space-y-0">
													<FormControl>
														<Checkbox checked={typeof field.value === "boolean" ? field.value : undefined} onCheckedChange={field.onChange} className="border-gray-400 data-[state=checked]:bg-[#0094da] data-[state=checked]:border-[#0094da]" />
													</FormControl>
													<div className="space-y-1 leading-none">
														<FormLabel className="text-gray-600 font-normal">
															I have read and understood all the{" "}
															<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
																<DialogTrigger asChild>
																	<Button variant="link" className="p-0 h-auto text-[#0094da] underline font-medium">
																		privacy policy
																	</Button>
																</DialogTrigger>
																<DialogContent className="sm:max-w-md">
																	<DialogHeader>
																		<DialogTitle className="text-xl">Privacy Policy</DialogTitle>
																		<DialogDescription className="py-4">This is where you would put your privacy policy content. Make sure to include all necessary information about how you handle user data, cookies, third-party services, and user rights.</DialogDescription>
																	</DialogHeader>
																	<div className="flex justify-end">
																		<Button variant="outline" onClick={() => setIsDialogOpen(false)}>
																			Close
																		</Button>
																	</div>
																</DialogContent>
															</Dialog>
															.
														</FormLabel>
														<FormMessage className="text-[#0094da]" />
													</div>
												</FormItem>
											)}
										/>

										<Button type="submit" className="w-full bg-[#0094da] hover:bg-[#0094da] text-white py-6 flex items-center justify-center gap-2 transition-all" disabled={!form.getValues().agreeToTerms || isSubmitting}>
											{isSubmitting ? "Sending..." : "Send Message"}
											<Send className="w-4 h-4" />
										</Button>
									</form>
								</Form>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
