"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { Shield, CreditCard, Loader2, Printer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Membership } from "@/types";
import MemberIDCard from "@/components/MemberIDCard";
import { useParams } from "next/navigation";

export default function IDCardPage() {
    const { data: session, status } = useSession();
    const params = useParams();
    const locale = (params.locale as string) || "en";
    
    const [isLoading, setIsLoading] = useState(true);
    const [membershipData, setMembershipData] = useState<Membership | null>(null);
    const [profilePhoto, setProfilePhoto] = useState<string>("");
    const [logo, setLogo] = useState<string>("");

    const fetchMembershipData = useCallback(async () => {
        try {
            if (!session?.user?.email) return;
            const response = await fetch(`/api/membership?email=${encodeURIComponent(session.user.email)}`);
            if (!response.ok) {
                throw new Error("Failed to fetch membership data");
            }
            const data = await response.json();
            
            // Handle case where API returns an array or single object
            let memberResult = data;
            if (Array.isArray(data) && data.length > 0) {
                memberResult = data[0];
            }
            
            setMembershipData(memberResult);
            if (memberResult?.profilePhoto) {
                setProfilePhoto(memberResult.profilePhoto);
            }
        } catch (error) {
            console.error("Error fetching membership data:", error);
        }
    }, [session?.user?.email]);

    const fetchProfilePhoto = useCallback(async () => {
        try {
            if (!session?.user?.email) return;
            const response = await fetch(`/api/users/profile-photo?email=${encodeURIComponent(session.user.email)}`);
            if (response.ok) {
                const data = await response.json();
                if (data.profilePhoto) {
                    setProfilePhoto(data.profilePhoto);
                }
            }
        } catch (error) {
            console.error("Error fetching profile photo:", error);
        }
    }, [session?.user?.email]);

    const fetchLogo = useCallback(async () => {
        try {
            const response = await fetch("/api/settings");
            if (response.ok) {
                const data = await response.json();
                if (data.logo) {
                    setLogo(data.logo);
                }
            }
        } catch (error) {
            console.error("Error fetching logo:", error);
        }
    }, []);

    // Fetch membership data and profile photo
    useEffect(() => {
        if (status === "authenticated") {
            fetchMembershipData();
            fetchProfilePhoto();
            fetchLogo();
            setIsLoading(false);
        } else if (status === "unauthenticated") {
            setIsLoading(false);
        }
    }, [status, fetchMembershipData, fetchProfilePhoto, fetchLogo]);

    const handlePrint = () => {
        window.print();
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="max-w-4xl mx-auto py-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
                <p className="text-xs text-slate-500">Loading digital membership card...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="max-w-4xl mx-auto py-8">
                <Alert className="border-slate-200">
                    <Shield className="h-4 w-4 text-slate-500" />
                    <AlertDescription className="text-slate-700">
                        Please log in to view your digital membership card.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const isExecutiveOrAdmin =
        session.user.role === "admin" ||
        session.user.role === "treasurer" ||
        membershipData?.membershipType === "executive";

    const isApproved =
        membershipData?.membershipStatus === "approved" || isExecutiveOrAdmin;

    const sessionUser = session.user as { id?: string; _id?: string; fullName?: string; email?: string; phone?: string; role?: string };
    const fallbackId = sessionUser._id || sessionUser.id || "ADMIN";

    // Build synthesized or loaded member card payload
    const effectiveMemberData = {
        _id: membershipData?._id || fallbackId,
        fullName: membershipData?.fullName || session.user.fullName || "Executive Member",
        email: membershipData?.email || session.user.email || "",
        phone: membershipData?.phone || session.user.phone || "",
        profilePhoto: profilePhoto || membershipData?.profilePhoto || undefined,
        nationalMembershipNo:
            membershipData?.nationalMembershipNo ||
            ("EXEC-" + fallbackId.slice(-4).toUpperCase()),
        membershipType: isExecutiveOrAdmin ? "executive" : (membershipData?.membershipType || "general"),
        position:
            membershipData?.position ||
            (session.user.role === "treasurer"
                ? "Treasurer"
                : isExecutiveOrAdmin
                ? "Executive Member"
                : undefined),
        city: membershipData?.city || "Oslo",
        province: membershipData?.province || "Norway",
        createdAt: membershipData?.createdAt || new Date().toISOString(),
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        My ID Card
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Official digital membership credential issued by PNSB-Norway with secure QR code verification.
                    </p>
                </div>

                <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="border-slate-200 hover:bg-slate-50 text-slate-700 h-9 text-xs flex items-center gap-1.5 self-start sm:self-auto"
                >
                    <Printer className="w-4 h-4 text-slate-600" />
                    <span>Print Card</span>
                </Button>
            </div>

            {/* Approved Member ID Card Section */}
            {isApproved && (
                <div className="space-y-4">
                    <Card className="border border-slate-200/80 shadow-2xs overflow-hidden bg-white">
                        <CardContent id="id-card-container" className="p-4 sm:p-6 flex justify-center">
                            <MemberIDCard
                                memberData={effectiveMemberData}
                                logo={logo}
                                locale={locale}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Show message if membership is not approved and user is not an executive/admin */}
            {!isApproved && membershipData && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-6 text-center space-y-2">
                        <CreditCard className="w-10 h-10 mx-auto text-amber-600" />
                        <h3 className="text-base font-semibold text-amber-900">Membership Pending Approval</h3>
                        <p className="text-xs text-amber-800">
                            Your membership application is currently under review by the administration.
                        </p>
                        <p className="text-xs text-amber-700">
                            Digital ID cards are activated as soon as your registration is approved.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Show message if no membership data and not an executive */}
            {!isApproved && !membershipData && (
                <Card className="border-slate-200 bg-slate-50">
                    <CardContent className="p-6 text-center space-y-2">
                        <CreditCard className="w-10 h-10 mx-auto text-slate-400" />
                        <h3 className="text-base font-semibold text-slate-800">No Membership Record Found</h3>
                        <p className="text-xs text-slate-600">
                            Unable to locate a membership record associated with your email. Please contact support.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}