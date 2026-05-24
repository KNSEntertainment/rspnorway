"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, Calendar, CreditCard, TrendingUp, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Donation {
  id: string;
  amount: number;
  currency: string;
  date: string;
  paymentMethod: string;
  status: string;
  description?: string;
  transactionId?: string;
  membershipId?: string;
  email?: string;
  phone?: string;
}

export default function MyDonations() {
  const { data: session } = useSession();
  const params = useParams();
  const locale = params.locale as string;
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalDonations, setTotalDonations] = useState(0);
  const fetchedEmailRef = useRef<string | null>(null);

  useEffect(() => {
    const email = session?.user?.email;
    if (email && email !== fetchedEmailRef.current) {
      fetchedEmailRef.current = email;
      
      const fetchDonations = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/donations/my-donations?email=${encodeURIComponent(email)}`);
          if (response.ok) {
            const data = await response.json();
            setDonations(data.donations || []);
            setTotalDonations(data.totalAmount || 0);
          }
        } catch (error) {
          console.error("Failed to fetch donations:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchDonations();
    }
  }, [session?.user?.email]);

  const filteredDonations = donations.filter(donation =>
    donation.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donation.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donation.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number, currency: string = "NOK") => {
    return new Intl.NumberFormat("nb-NO", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  if (!session?.user?.isMember) {
    return (
      <div className="text-center py-12">
        <Wallet className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-600 mb-6">You need to be a member to view your donation history.</p>
        <Button asChild>
          <Link href="/membership">Become a Member</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="h-8 w-8 text-emerald-600" />
            My Donations
          </h1>
          <p className="text-gray-600 mt-1">View your complete donation history and impact</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDonations)}</div>
            <p className="text-xs text-muted-foreground">
              {donations.length} donations made
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Year</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                donations
                  .filter(d => new Date(d.date).getFullYear() === new Date().getFullYear())
                  .reduce((sum, d) => sum + d.amount, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {donations.filter(d => new Date(d.date).getFullYear() === new Date().getFullYear()).length} donations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Donation</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {donations.length > 0 ? formatCurrency(totalDonations / donations.length) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per donation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Donation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search donations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading donation history...</p>
            </div>
          ) : filteredDonations.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No donations found</h3>
              <p className="text-gray-600">
                {searchTerm ? "No donations match your search criteria." : "You haven't made any donations yet."}
              </p>
              {!searchTerm && (
                <Button className="mt-4" asChild>
                  <Link href={`/${locale}/donate`}>Make Your First Donation</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDonations.map((donation) => (
                <div key={donation.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {donation.description || "General Donation"}
                        </h4>
                        <Badge className={getStatusColor(donation.status)}>
                          {donation.status || "Completed"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(donation.date).toLocaleDateString("nb-NO")}
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          {donation.paymentMethod}
                        </div>
                        {donation.transactionId && (
                          <div className="text-xs text-gray-500">
                            Transaction ID: {donation.transactionId}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">
                        {formatCurrency(donation.amount, donation.currency)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
