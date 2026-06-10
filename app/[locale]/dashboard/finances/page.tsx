"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingDown, 
  Calendar, 
  Ticket, 
  Heart, 
  PiggyBank,
  Target,
  PieChart,
  BarChart3,
  Download,
  Eye,
  AlertCircle
} from "lucide-react";

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  pendingTransactions: number;
  verifiedTransactions: number;
  disputedTransactions: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  weeklyIncome: number;
  weeklyExpenses: number;
  donationIncome: number;
  eventIncome: number;
  membershipIncome: number;
  otherIncome: number;
}

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
}

interface BudgetCategory {
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  tickets: number;
  donations: number;
}

interface EventData {
  _id: string;
  eventname: string;
  eventdate: string;
  createdAt: string;
  registeredSeats: number;
  maximumSeats: number;
}

interface FinancialTransaction {
  _id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  date: string;
  relatedTo: string;
  eventId?: string;
  budgetId?: string;
}

export default function FinancialDashboard() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [events, setEvents] = useState<EventFinancial[]>([]);
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchFinancialData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch summary data using new transaction system
      const summaryResponse = await fetch(`/api/financial-transactions/summary`);
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummary(summaryData);
      }

      // Fetch transactions for detailed analysis
      const transactionsResponse = await fetch(`/api/financial-transactions`);
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        const allTransactions = transactionsData.transactions || [];
        
        // Fetch actual events and combine with financial data
        const eventsResponse = await fetch(`/api/events`);
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          const actualEvents = eventsData.events || [];
          
          // Process financial transactions related to events
          const eventTransactions = allTransactions.filter((t: FinancialTransaction) => 
            t.relatedTo === "event" || 
            t.category === "event revenue" ||
            t.category === "event" ||
            t.description?.toLowerCase().includes("event") ||
            t.description?.toLowerCase().includes("registration")
          );
          
          // Combine event data with financial data
          const eventsWithFinancials = actualEvents.map((event: EventData) => {
            // Find transactions related to this event
            const relatedTransactions = eventTransactions.filter((t: FinancialTransaction) => 
              t.eventId === event._id?.toString() || 
              t.description?.toLowerCase().includes(event.eventname?.toLowerCase())
            );
            
            const totalRevenue = relatedTransactions
              .filter((t: FinancialTransaction) => t.type === "income")
              .reduce((sum: number, t: FinancialTransaction) => sum + t.amount, 0);
            
            const totalExpenses = relatedTransactions
              .filter((t: FinancialTransaction) => t.type === "expense")
              .reduce((sum: number, t: FinancialTransaction) => sum + t.amount, 0);
            
            const netProfit = totalRevenue - totalExpenses;
            
            return {
              id: event._id?.toString(),
              title: event.eventname,
              date: event.eventdate || event.createdAt,
              status: "completed",
              totalRevenue,
              totalExpenses,
              netProfit,
              ticketsSold: event.registeredSeats || 0,
              totalTickets: event.maximumSeats || 0,
              averageTicketPrice: event.maximumSeats > 0 && event.registeredSeats > 0 ? totalRevenue / event.registeredSeats : 0
            };
          });
          
          setEvents(eventsWithFinancials);
        } else {
          setEvents([]);
        }
      }

      // Fetch budget data
      const budgetResponse = await fetch(`/api/finances/budgets`);
      if (budgetResponse.ok) {
        const budgetData = await budgetResponse.json();
        setBudgets(budgetData);
      }

      // Process monthly data from transactions
      const monthlyResponse = await fetch(`/api/financial-transactions`);
      if (monthlyResponse.ok) {
        const transactionsData = await monthlyResponse.json();
        const allTransactions = transactionsData.transactions || [];
        
        const monthlyData = allTransactions.reduce((acc: MonthlyData[], transaction: FinancialTransaction) => {
          const date = new Date(transaction.date);
          const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          
          const existingMonth = acc.find((m: MonthlyData) => m.month === monthKey);
          if (existingMonth) {
            if (transaction.type === "income") {
              existingMonth.income += transaction.amount;
            } else {
              existingMonth.expenses += transaction.amount;
            }
          } else {
            acc.push({
              month: monthKey,
              income: transaction.type === "income" ? transaction.amount : 0,
              expenses: transaction.type === "expense" ? transaction.amount : 0,
              tickets: 0,
              donations: transaction.relatedTo === "donation" ? transaction.amount : 0
            });
          }
          return acc;
        }, [] as MonthlyData[]);
        setMonthlyData(monthlyData);
      }
    } catch (error) {
      console.error("Failed to fetch financial data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchFinancialData();
    }
  }, [session, selectedPeriod, selectedYear, fetchFinancialData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nb-NO", {
      style: "currency",
      currency: "NOK",
    }).format(amount);
  };

  const getLastThreeMonths = () => {
    const now = new Date();
    const months = [];
    
    for (let i = 2; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      
      // Find the corresponding data in monthlyData
      const monthData = monthlyData.find(m => {
        const dataDate = new Date(m.month + ' 1, ' + selectedYear);
        return dataDate.getMonth() === monthIndex && dataDate.getFullYear() === year;
      });
      
      months.push({
        name: monthName,
        income: monthData ? monthData.income : 0
      });
    }
    
    return months;
  };





  
  const handleExportReport = async () => {
    try {
      const response = await fetch(`/api/finances/export?period=${selectedPeriod}&year=${selectedYear}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-report-${selectedPeriod}-${selectedYear}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("Failed to export report");
      }
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  
  const handleViewAllEvents = () => {
    // Navigate to detailed events financial page
    router.push(`/${locale}/dashboard/finances/events`);
  };

  if (session?.user?.role !== "admin") {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-600 mb-6">You need admin privileges to access the financial dashboard.</p>
        <Button asChild>
          <Link href={`/${locale}/dashboard`}>Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-emerald-600" />
            Financial Analytics
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive financial overview and budget management</p>
        </div>
        <div className="flex items-center gap-2">
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
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{summary ? formatCurrency(summary.totalIncome) : "NOK 0"}</div>
            <div className="flex items-center text-xs text-emerald-700 mt-1">
              <span className="ml-1">
                {summary ? `${formatCurrency(summary.monthlyIncome)} this month` : "NOK 0 this month"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{summary ? formatCurrency(summary.totalExpenses) : "NOK 0"}</div>
            <div className="flex items-center text-xs text-red-700 mt-1">
              <span className="ml-1">
                {summary ? `${formatCurrency(summary.monthlyExpenses)} this month` : "NOK 0 this month"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Net Income</CardTitle>
            <PiggyBank className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{summary ? formatCurrency(summary.netIncome) : "NOK 0"}</div>
            <div className="flex items-center text-xs text-blue-700 mt-1">
              <Target className="h-3 w-3 mr-1" />
              {summary ? `${((summary.netIncome / summary.totalIncome) * 100).toFixed(1)}% profit margin` : "0% profit margin"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Revenue Sources</CardTitle>
            <PieChart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-purple-700">Pending:</span>
                <span className="font-semibold text-purple-900">
                  {summary ? summary.pendingTransactions : 0} transactions
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-purple-700">Verified:</span>
                <span className="font-semibold text-purple-900">
                  {summary ? summary.verifiedTransactions : 0} transactions
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Budget Summary
            </CardTitle>
            <Button 
                      variant="outline" 
                      className="w-fit"
                      onClick={() => router.push(`/${locale}/dashboard/finances/budget`)}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Manage Budget
                    </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No budgets found for this period.</p>
                  <p className="text-sm">Create budgets to track your expenses effectively.</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => router.push(`/${locale}/dashboard/finances/budget`)}
                  >
                    Create Budget
                  </Button>
                </div>
              ) : (
                <>
                  {/* Budget Summary Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {budgets.length}
                      </div>
                      <div className="text-sm text-gray-600">Active Budgets</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {budgets.filter(b => b.percentage < 80).length}
                      </div>
                      <div className="text-sm text-gray-600">On Track</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {budgets.filter(b => b.percentage >= 80).length}
                      </div>
                      <div className="text-sm text-gray-600">Need Attention</div>
                    </div>
                  </div>
                  
                  {/* Overall Budget Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Overall Budget Usage</span>
                      <span className="text-sm font-semibold">
                        {formatCurrency(budgets.reduce((sum, b) => sum + b.spent, 0))} / {formatCurrency(budgets.reduce((sum, b) => sum + b.allocated, 0))}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          budgets.reduce((sum, b) => sum + b.spent, 0) > budgets.reduce((sum, b) => sum + b.allocated, 0) 
                            ? "bg-red-500" 
                            : (budgets.reduce((sum, b) => sum + b.spent, 0) / budgets.reduce((sum, b) => sum + b.allocated, 0)) * 100 > 80 
                              ? "bg-yellow-500" 
                              : "bg-green-500"
                        }`}
                        style={{ 
                          width: `${Math.min((budgets.reduce((sum, b) => sum + b.spent, 0) / budgets.reduce((sum, b) => sum + b.allocated, 0)) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{((budgets.reduce((sum, b) => sum + b.spent, 0) / budgets.reduce((sum, b) => sum + b.allocated, 0)) * 100).toFixed(1)}% used</span>
                      <span>{formatCurrency(budgets.reduce((sum, b) => sum + b.remaining, 0))} remaining</span>
                    </div>
                  </div>
                  
             
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Event Financial Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Event Financial Performance
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleViewAllEvents}>
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                      <span>{event.ticketsSold}/{event.totalTickets} tickets</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">
                      {formatCurrency(event.netProfit)}
                    </div>
                    <div className="text-xs text-gray-600">profit</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-blue-600" />
              Ticket Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(events.reduce((sum, event) => sum + event.totalRevenue, 0))}
                </div>
                <div className="text-sm text-gray-600">Total event revenue</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Average ticket price:</span>
                  <span className="font-semibold">
                    {events.length > 0 
                      ? formatCurrency(events.reduce((sum, event) => sum + event.averageTicketPrice, 0) / events.length)
                      : "NOK 0"
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total tickets sold:</span>
                  <span className="font-semibold">
                    {events.reduce((sum, event) => sum + event.ticketsSold, 0)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-600" />
              Donation Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600">
                  {summary ? formatCurrency(summary.donationIncome) : "NOK 0"}
                </div>
                <div className="text-sm text-gray-600">Total donations</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Event Revenue:</span>
                  <span className="font-semibold">
                    {summary ? formatCurrency(summary.eventIncome) : "NOK 0"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Membership Revenue:</span>
                  <span className="font-semibold">
                    {summary ? formatCurrency(summary.membershipIncome) : "NOK 0"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              Monthly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {summary ? formatCurrency(summary.totalIncome) : "NOK 0"}
                </div>
                <div className="text-sm text-gray-600">Total income</div>
              </div>
              <div className="space-y-2">
                {getLastThreeMonths().map((month, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{month.name}:</span>
                    <span className="font-semibold">{formatCurrency(month.income)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
