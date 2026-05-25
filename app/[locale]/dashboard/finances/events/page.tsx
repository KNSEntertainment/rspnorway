"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Search,
  Filter,
  Download,
  Eye
} from "lucide-react";

interface EventFinancial {
  id: string;
  title: string;
  date: string;
  status: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  ticketsSold: number;
  totalTickets: number;
  averageTicketPrice: number;
  registrationCount: number;
}

export default function EventsFinancial() {
  const { data: session } = useSession();
  const params = useParams();
  const locale = params.locale as string;

  const [events, setEvents] = useState<EventFinancial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchEventsFinancial = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/finances/events?period=${selectedPeriod}&year=${selectedYear}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Failed to fetch events financial data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedYear]);

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchEventsFinancial();
    }
  }, [session, selectedPeriod, selectedYear, fetchEventsFinancial]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nb-NO", {
      style: "currency",
      currency: "NOK",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = events.reduce((sum, event) => sum + event.totalRevenue, 0);
  const totalExpenses = events.reduce((sum, event) => sum + event.totalExpenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const totalTicketsSold = events.reduce((sum, event) => sum + event.ticketsSold, 0);

  if (!session || session.user.role !== "admin") {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-600 mb-6">You need admin privileges to view event financial data.</p>
        <Button asChild>
          <Link href={`/${locale}/dashboard`}>Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
        <Button variant="outline" size="sm" asChild>
          <Link href={`/${locale}/dashboard/finances`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Financial Analytics
          </Link>
        </Button>
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-8 w-8 text-purple-600" />
            Event Financial Performance
          </h1>
          <p className="text-gray-600 mt-1">Detailed financial analysis for all events</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{formatCurrency(totalRevenue)}</div>
            <div className="text-xs text-emerald-700 mt-1">From {events.length} events</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{formatCurrency(totalExpenses)}</div>
            <div className="text-xs text-red-700 mt-1">Operational costs</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(totalProfit)}</div>
            <div className="text-xs text-blue-700 mt-1">
              {totalRevenue > 0 ? `${((totalProfit / totalRevenue) * 100).toFixed(1)}% margin` : "0% margin"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Tickets Sold</CardTitle>
            <Eye className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{totalTicketsSold}</div>
            <div className="text-xs text-purple-700 mt-1">Total tickets sold</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Event Financial Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      {new Date(event.date).toLocaleDateString()} • {event.registrationCount} registrations
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Revenue</div>
                        <div className="font-semibold text-green-600">{formatCurrency(event.totalRevenue)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Expenses</div>
                        <div className="font-semibold text-red-600">{formatCurrency(event.totalExpenses)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Profit</div>
                        <div className={`font-semibold ${event.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(event.netProfit)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Tickets</div>
                        <div className="font-semibold">{event.ticketsSold}/{event.totalTickets}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(event.netProfit)}
                    </div>
                    <div className="text-sm text-gray-600">net profit</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
