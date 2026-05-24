"use client";

import { useEffect, useState, useCallback } from "react";
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function UnsubscribeClient({ 
	email: initialEmail
}: { 
	email?: string;
}) {
	const [email, setEmail] = useState(initialEmail || "");
	const [isLoading, setIsLoading] = useState(false);
	const [preferences, setPreferences] = useState({
		messages: false,
		announcements: false,
		newsletters: false,
		events: false,
	});
	const [isSaved, setIsSaved] = useState(false);
	const { toast } = useToast();

	const fetchCurrentPreferences = useCallback(async () => {
		try {
			const response = await fetch(`/api/members/email-preferences?email=${encodeURIComponent(email)}`);
			if (response.ok) {
				const data = await response.json();
				if (data.preferences) {
					setPreferences(data.preferences);
				}
			}
		} catch (error) {
			console.error("Error fetching preferences:", error);
		}
	}, [email]);

	useEffect(() => {
		if (email) {
			fetchCurrentPreferences();
		}
	}, [email, fetchCurrentPreferences]);

	const handlePreferenceChange = async (key: string, value: boolean) => {
		setPreferences(prev => ({ ...prev, [key]: value }));
	};

	const handleSavePreferences = async () => {
		if (!email) {
			toast({
				title: "Error",
				description: "Email is required",
				variant: "destructive",
			});
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch("/api/members/email-preferences", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					preferences,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to save preferences");
			}

			setIsSaved(true);
			toast({
				title: "Preferences Saved",
				description: "Your email preferences have been updated successfully.",
			});

		} catch (error) {
			console.error("Error saving preferences:", error);
			toast({
				title: "Error",
				description: "Failed to save preferences. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleUnsubscribeAll = async () => {
		if (!email) {
			toast({
				title: "Error",
				description: "Email is required",
				variant: "destructive",
			});
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch("/api/members/unsubscribe-all", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			if (!response.ok) {
				throw new Error("Failed to unsubscribe");
			}

			setPreferences({
				messages: false,
				announcements: false,
				newsletters: false,
				events: false,
			});

			setIsSaved(true);
			toast({
				title: "Unsubscribed",
				description: "You have been unsubscribed from all emails.",
			});

		} catch (error) {
			console.error("Error unsubscribing:", error);
			toast({
				title: "Error",
				description: "Failed to unsubscribe. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto py-12 px-4">
			<Card>
				<CardHeader className="text-center">
					<div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
						<Mail className="h-6 w-6 text-gray-600" />
					</div>
					<CardTitle className="text-2xl">Email Preferences</CardTitle>
					<p className="text-gray-600 mt-2">
						Manage your email communication preferences from PNSB-Norway
					</p>
				</CardHeader>
				<CardContent className="space-y-6">
					{isSaved && (
						<Alert className="bg-green-50 border-green-200">
							<CheckCircle className="h-4 w-4 text-green-600" />
							<AlertDescription className="text-green-800">
								Your preferences have been saved successfully.
							</AlertDescription>
						</Alert>
					)}

					{!email && (
						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								Please provide your email address to manage preferences.
							</AlertDescription>
						</Alert>
					)}

					<div>
						<Label htmlFor="email" className="text-base font-medium">
							Email Address
						</Label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email address"
							className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
						/>
					</div>

					{email && (
						<>
							<div className="space-y-4">
								<h3 className="text-lg font-medium">Email Categories</h3>
								
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<div>
											<Label htmlFor="messages" className="font-medium">
												Admin Messages
											</Label>
											<p className="text-sm text-gray-500">
												Important messages from PNSB-Norway administrators
											</p>
										</div>
										<Switch
											id="messages"
											checked={preferences.messages}
											onCheckedChange={(checked) => handlePreferenceChange("messages", checked)}
										/>
									</div>

									<div className="flex items-center justify-between">
										<div>
											<Label htmlFor="announcements" className="font-medium">
												Announcements
											</Label>
											<p className="text-sm text-gray-500">
												Organization announcements and updates
											</p>
										</div>
										<Switch
											id="announcements"
											checked={preferences.announcements}
											onCheckedChange={(checked) => handlePreferenceChange("announcements", checked)}
										/>
									</div>

									<div className="flex items-center justify-between">
										<div>
											<Label htmlFor="newsletters" className="font-medium">
												Newsletters
											</Label>
											<p className="text-sm text-gray-500">
												Monthly newsletters and organization news
											</p>
										</div>
										<Switch
											id="newsletters"
											checked={preferences.newsletters}
											onCheckedChange={(checked) => handlePreferenceChange("newsletters", checked)}
										/>
									</div>

									<div className="flex items-center justify-between">
										<div>
											<Label htmlFor="events" className="font-medium">
												Event Notifications
											</Label>
											<p className="text-sm text-gray-500">
												Information about upcoming events and activities
											</p>
										</div>
										<Switch
											id="events"
											checked={preferences.events}
											onCheckedChange={(checked) => handlePreferenceChange("events", checked)}
										/>
									</div>
								</div>
							</div>

							<div className="flex flex-col sm:flex-row gap-4 pt-6">
								<Button
									onClick={handleSavePreferences}
									disabled={isLoading}
									className="flex-1"
								>
									{isLoading ? (
										<>
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											Saving...
										</>
									) : (
										"Save Preferences"
									)}
								</Button>

								<Button
									onClick={handleUnsubscribeAll}
									variant="outline"
									disabled={isLoading}
									className="flex-1"
								>
									Unsubscribe from All
								</Button>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
