"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { X, Calendar, MapPin, Clock, ArrowRight, CheckCircle, CreditCard } from "lucide-react";
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
  childPrice?: number;
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
  children: number;
  specialRequests?: string;
}

const extractPriceFromDescription = (description: string | undefined, type: 'adult' | 'child') => {
  if (!description) return 0;
  
  console.log("[EventRegistrationModal] Extracting price from description:", { description, type });
  
  // Look for price patterns in description
  const patterns = {
    child: [/student.*?(\d+)\s*nok/i, /child.*?(\d+)\s*nok/i, /barn.*?(\d+)\s*nok/i],
    adult: [/standard.*?(\d+)\s*nok/i, /adult.*?(\d+)\s*nok/i, /voksen.*?(\d+)\s*nok/i]
  };
  
  const typePatterns = patterns[type];
  for (const pattern of typePatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      const extractedPrice = parseInt(match[1]);
      console.log("[EventRegistrationModal] Price extracted from description:", { extractedPrice, pattern: pattern.toString() });
      return extractedPrice;
    }
  }
  
  return 0;
};

const getTicketPrice = (value: number | undefined, description?: string, type?: 'adult' | 'child') => {
  // If database value exists and is not 0, use it
  if (value !== undefined && value !== null && value > 0) {
    console.log("[EventRegistrationModal] Using database price:", { value });
    return Number(value);
  }
  
  // Fallback to description parsing
  if (description && type) {
    const extractedPrice = extractPriceFromDescription(description, type);
    if (extractedPrice > 0) {
      console.log("[EventRegistrationModal] Using extracted price from description:", { extractedPrice });
      return extractedPrice;
    }
  }
  
  console.log("[EventRegistrationModal] Using default price 0");
  return 0;
};

export default function EventRegistrationModal({ event, isOpen, onClose }: EventRegistrationModalProps) {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{ qrCode?: string; registrationId?: string } | null>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    adults: 1,
    children: 0,
    specialRequests: "",
  });

  // Log the complete event object when modal opens
  useEffect(() => {
    if (event && isOpen) {
      console.log("[EventRegistrationModal] Event data received:", {
        eventId: event._id,
        eventName: event.eventname,
        eventdescription: event.eventdescription,
        price: event.price,
        childPrice: event.childPrice,
        paymentCollectionEnabled: event.paymentCollectionEnabled,
      });
    }
  }, [event, isOpen]);

  // Pre-fill member data if logged in
  useEffect(() => {
    if (session?.user) {
      setRegistrationData(prev => ({
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
    const adultPrice = event.paymentCollectionEnabled === false ? 0 : getTicketPrice(event.price, event.eventdescription, 'adult');
    const childPrice = event.paymentCollectionEnabled === false ? 0 : getTicketPrice(event.childPrice, event.eventdescription, 'child');
    console.log("[EventRegistrationModal] calculateTotal:", {
      eventId: event._id,
      eventName: event.eventname,
      rawPrice: event.price,
      rawChildPrice: event.childPrice,
      paymentCollectionEnabled: event.paymentCollectionEnabled,
      adultPrice,
      childPrice,
      adults: registrationData.adults,
      children: registrationData.children,
    });
    
    const adultTotal = (registrationData.adults || 0) * adultPrice;
    const childTotal = (registrationData.children || 0) * childPrice;
    return adultTotal + childTotal;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API call to create registration
      if (!event) {
        console.error("No event data");
        return;
      }

      console.log("Current session:", session);
      
      const payload = {
        eventId: event._id,
        ...registrationData,
        totalAmount: calculateTotal(),
      };
      
      console.log("Submitting registration:", payload);
      
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Registration successful:", data);
        console.log("QR Code length:", data.qrCode?.length);
        console.log("QR Code preview:", data.qrCode?.substring(0, 100));
        setRegistrationResult({
          qrCode: data.qrCode,
          registrationId: data.registrationId
        });
        setCurrentStep(4); // Success step
      } else {
        const errorData = await response.json();
        console.error("Registration failed:", errorData);
        alert("Registration failed: " + (errorData.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      alert("Registration failed: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isEventPast = event ? new Date(event.eventdate).getTime() < new Date().setHours(0, 0, 0, 0) : false;
  const isRegistrationClosed = event?.registrationEnabled === false;
  const maximumSeats = Number(event?.maximumSeats || 0);
  const registeredSeats = Number(event?.registeredSeats || 0);
  const seatsRemaining = maximumSeats > 0 ? Math.max(maximumSeats - registeredSeats, 0) : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Event Registration</h2>
            <p className="text-gray-600 mt-1">{event?.eventname || ""}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? "bg-brand text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      currentStep > step ? "bg-brand" : "bg-gray-200"
                    }`}
                  />
                )}
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
          {currentStep === 2 && (
            <AttendeeInfoStep
              data={registrationData}
              onChange={setRegistrationData}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <PaymentStep
              event={event}
              data={registrationData}
              onSubmit={handleSubmit}
              onBack={() => setCurrentStep(2)}
              loading={loading}
            />
          )}
          {currentStep === 4 && (
            <ConfirmationStep
              qrCode={registrationResult?.qrCode}
              registrationId={registrationResult?.registrationId}
              onClose={onClose}
            />
          )}
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
            <Image
              src={event.eventposterUrl}
              alt={event.eventname}
              width={400}
              height={192}
              className="w-full h-48 object-cover rounded-lg"
            />
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
          
          {event.paymentCollectionEnabled !== false && (event.price !== undefined || event.childPrice !== undefined) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Pricing</h4>
              {event.price !== undefined && (
                <div className="flex justify-between text-sm">
                  <span>Adults</span>
                  <span className="font-medium">NOK {getTicketPrice(event.price, event.eventdescription, 'adult')}</span>
                </div>
              )}
              {event.childPrice !== undefined && (
                <div className="flex justify-between text-sm">
                  <span>Children</span>
                  <span className="font-medium">NOK {getTicketPrice(event.childPrice, event.eventdescription, 'child')}</span>
                </div>
              )}
            </div>
          )}
          {seatsRemaining !== null && (
            <Badge variant={seatsRemaining > 0 ? "default" : "destructive"}>
              {seatsRemaining > 0 ? `${seatsRemaining} seats remaining` : "Sold out"}
            </Badge>
          )}
        </div>
      </div>

      {/* {event.practicalInfo && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Practical Information</h4>
          <p className="text-gray-600 whitespace-pre-wrap">{event.practicalInfo}</p>
        </div>
      )} */}

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={disabled} className="flex items-center gap-2">
          Continue to Registration
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function AttendeeInfoStep({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: RegistrationData;
  onChange: (data: RegistrationData) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateData = (field: keyof RegistrationData, value: string | number) => {
    onChange({ ...data, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Also clear adult error when adults field is changed
    if (field === 'adults' && errors.adults) {
      setErrors(prev => ({ ...prev, adults: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!data.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!data.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!data.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(data.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!data.adults || data.adults < 1) {
      newErrors.adults = 'Please select at least 1 adult';
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
            <Input
              id="firstName"
              value={data.firstName}
              onChange={(e) => updateData("firstName", e.target.value)}
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={data.lastName}
              onChange={(e) => updateData("lastName", e.target.value)}
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => updateData("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={data.phone}
              onChange={(e) => updateData("phone", e.target.value)}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Number of Attendees</h3>
        <div className="grid md:grid-cols-2 gap-4">
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
            {errors.adults && (
              <p className="text-red-500 text-sm mt-1">{errors.adults}</p>
            )}
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
        </div>
      </div>

      <div>
        <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
        <textarea
          id="specialRequests"
          className="w-full p-3 border border-gray-300 rounded-lg resize-none"
          rows={3}
          value={data.specialRequests}
          onChange={(e) => updateData("specialRequests", e.target.value)}
          placeholder="Any dietary restrictions, accessibility needs, or other requests..."
        />
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

function PaymentStep({
  event,
  data,
  onSubmit,
  onBack,
  loading,
}: {
  event: Event | null;
  data: RegistrationData;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  loading: boolean;
}) {
  if (!event) return null;
  
  const adultPrice = event.paymentCollectionEnabled === false ? 0 : getTicketPrice(event.price, event.eventdescription, 'adult');
  const childPrice = event.paymentCollectionEnabled === false ? 0 : getTicketPrice(event.childPrice, event.eventdescription, 'child');
  console.log("[EventRegistrationModal] PaymentStep price values:", {
    eventId: event._id,
    eventName: event.eventname,
    rawPrice: event.price,
    rawChildPrice: event.childPrice,
    paymentCollectionEnabled: event.paymentCollectionEnabled,
    adultPrice,
    childPrice,
  });
  
  const adultTotal = (data.adults || 0) * adultPrice;
  const childTotal = (data.children || 0) * childPrice;
  const totalAmount = adultTotal + childTotal;

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
                      <span>{data.adults} Adult{data.adults > 1 ? "s" : ""} × NOK {adultPrice}</span>
                      <span>NOK {adultTotal}</span>
                    </div>
                  )}
                  {data.children > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{data.children} Child{data.children > 1 ? "ren" : ""} × NOK {childPrice}</span>
                      <span>NOK {childTotal}</span>
                    </div>
                  )}
                  {data.children > 0 && (
                    <div className="text-xs text-red-600">
                      DEBUG: childPrice={childPrice}, childTotal={childTotal}, rawChildPrice={event.childPrice}
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
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Processing Fee</span>
                    <span>NOK 0</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total Amount</span>
                  <span className="text-lg">NOK {totalAmount}</span>
                </div>
                <div className="text-xs text-green-600 mt-1">
                  ✓ No additional fees
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment" defaultChecked className="text-brand" />
                <CreditCard className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium">Credit/Debit Card</div>
                  <div className="text-sm text-gray-600">Pay with VISA, Mastercard, or other cards</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment" className="text-brand" />
                <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">V</span>
                </div>
                <div>
                  <div className="font-medium">Vipps</div>
                  <div className="text-sm text-gray-600">Pay with Vipps mobile payment</div>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onSubmit} disabled={loading} className="flex items-center gap-2">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Complete Registration
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function ConfirmationStep({ qrCode, registrationId, onClose }: { qrCode?: string; registrationId?: string; onClose: () => void }) {
  console.log("ConfirmationStep - QR Code length:", qrCode?.length);
  console.log("ConfirmationStep - QR Code type:", qrCode?.substring(0, 30));

  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
        <p className="text-gray-600">
          Your event registration has been confirmed. A QR code has been sent to your email.
        </p>
      </div>

      {qrCode && qrCode.length > 100 ? (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="w-48 h-48 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center border-2 border-gray-200 overflow-hidden">
            <Image src={qrCode} alt="Registration QR Code" width={192} height={192} className="w-full h-full object-contain" />
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Please show this QR code at the event entrance for quick check-in.
          </p>
          {registrationId && (
            <p className="text-xs text-gray-500 font-mono">
              Registration ID: {registrationId}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-2">
            Your registration ID has been sent to your email. Please present it at the event entrance.
          </p>
          {registrationId && (
            <p className="text-xs text-gray-500 font-mono">
              Registration ID: {registrationId}
            </p>
          )}
        </div>
      )}

      <div className="flex justify-center">
        <Button onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
