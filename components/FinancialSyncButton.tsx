"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  CheckCircle, 
  Users, 
  Heart,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SyncResults {
  eventRegistrations: { synced: number; skipped: number; total: number };
  donations: { synced: number; skipped: number; total: number };
}

export default function FinancialSyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResults | null>(null);
  const { toast } = useToast();

  const handleSync = async (syncType: "event-registrations" | "donations" | "all") => {
    setIsSyncing(true);
    setSyncResults(null);

    try {
      const response = await fetch("/api/admin/sync-financial-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncType }),
      });

      if (response.ok) {
        const data = await response.json();
        setSyncResults(data.results);
        
        toast({
          title: "Sync Completed",
          description: `Successfully synced ${data.results.eventRegistrations.synced} event registrations and ${data.results.donations.synced} donations`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to sync financial data",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to sync financial data",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const renderSyncCard = (title: string, icon: React.ReactNode, results: { synced: number; skipped: number; total: number }) => {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Synced:</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {results.synced}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Skipped:</span>
              <Badge variant="secondary">
                {results.skipped}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total:</span>
              <span className="font-semibold">{results.total}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Financial Data Synchronization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Sync existing event registrations and donations with the unified financial transaction system.
            This will create financial transactions for historical data that wasn&apos;t previously tracked.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleSync("event-registrations")}
              disabled={isSyncing}
              variant="outline"
              size="sm"
            >
              {isSyncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Users className="h-4 w-4 mr-2" />}
              Sync Event Registrations
            </Button>
            
            <Button
              onClick={() => handleSync("donations")}
              disabled={isSyncing}
              variant="outline"
              size="sm"
            >
              {isSyncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Heart className="h-4 w-4 mr-2" />}
              Sync Donations
            </Button>
            
            <Button
              onClick={() => handleSync("all")}
              disabled={isSyncing}
              className="bg-brand hover:bg-brand/90"
              size="sm"
            >
              {isSyncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Sync All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {syncResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderSyncCard(
            "Event Registrations",
            <Users className="h-4 w-4 text-blue-600" />,
            syncResults.eventRegistrations
          )}
          
          {renderSyncCard(
            "Donations",
            <Heart className="h-4 w-4 text-pink-600" />,
            syncResults.donations
          )}
        </div>
      )}

      {syncResults && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Synchronization completed successfully!
              </span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Your historical financial data has been integrated into the unified system.
              Check the Financial Analytics dashboard to see the updated totals.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
