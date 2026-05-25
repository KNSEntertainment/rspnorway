"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bug, 
  Database,
  Users,
  Heart,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DebugData {
  totalTransactions: number;
  eventTransactions: number;
  donationTransactions: number;
  eventRegistrations: number;
  sampleTransactions: Array<{
    id: string;
    type: string;
    category: string;
    amount: number;
    relatedTo: string;
    eventId: string;
    description: string;
    date: string;
    referenceNumber: string;
  }>;
  sampleEventTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    eventId: string;
    description: string;
    date: string;
  }>;
  sampleRegistrations: Array<{
    id: string;
    registrationId: string;
    totalAmount: number;
    paymentStatus: string;
    eventId: string;
    createdAt: string;
  }>;
}

export default function FinancialDebugButton() {
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const { toast } = useToast();

  const handleDebug = async () => {
    setIsDebugging(true);
    setDebugData(null);

    try {
      const response = await fetch("/api/admin/debug-transactions");
      
      if (response.ok) {
        const data = await response.json();
        setDebugData(data.data);
        
        toast({
          title: "Debug Data Loaded",
          description: `Found ${data.data.totalTransactions} total transactions`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to fetch debug data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Debug data fetch error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch debug data",
        variant: "destructive",
      });
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Financial Transaction Debug
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Check what financial transactions are currently in the database to debug why event income might not be showing in analytics.
          </p>
          
          <Button
            onClick={handleDebug}
            disabled={isDebugging}
            variant="outline"
            size="sm"
          >
            {isDebugging ? (
              <>
                <Database className="h-4 w-4 mr-2 animate-spin" />
                Debugging...
              </>
            ) : (
              <>
                <Bug className="h-4 w-4 mr-2" />
                Check Database
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {debugData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{debugData.totalTransactions}</div>
                    <div className="text-sm text-gray-600">Total Transactions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">{debugData.eventTransactions}</div>
                    <div className="text-sm text-gray-600">Event Transactions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-600" />
                  <div>
                    <div className="text-2xl font-bold">{debugData.donationTransactions}</div>
                    <div className="text-sm text-gray-600">Donation Transactions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold">{debugData.eventRegistrations}</div>
                    <div className="text-sm text-gray-600">Event Registrations</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sample Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sample Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {debugData.sampleTransactions.length === 0 ? (
                    <p className="text-sm text-gray-500">No transactions found</p>
                  ) : (
                    debugData.sampleTransactions.map((transaction, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant={transaction.type === "income" ? "default" : "secondary"}>
                            {transaction.type}
                          </Badge>
                          <span className="font-semibold">{transaction.amount} NOK</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div><strong>Category:</strong> {transaction.category}</div>
                          <div><strong>Related To:</strong> {transaction.relatedTo}</div>
                          <div><strong>Event ID:</strong> {transaction.eventId || 'None'}</div>
                          <div><strong>Description:</strong> {transaction.description}</div>
                          <div><strong>Date:</strong> {new Date(transaction.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {debugData.sampleRegistrations.length === 0 ? (
                    <p className="text-sm text-gray-500">No completed event registrations found</p>
                  ) : (
                    debugData.sampleRegistrations.map((registration, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline">
                            {registration.paymentStatus}
                          </Badge>
                          <span className="font-semibold">{registration.totalAmount} NOK</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div><strong>Registration ID:</strong> {registration.registrationId}</div>
                          <div><strong>Event ID:</strong> {registration.eventId}</div>
                          <div><strong>Date:</strong> {new Date(registration.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
