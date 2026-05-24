"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, Search, Trophy, Star } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  category: string;
  participantCount?: number;
  maxParticipants?: number;
  registrationDate?: string;
  role?: string;
  image?: string;
  organizer?: string;
  qrCode?: string;
  registrationId?: string;
  paymentStatus?: string;
  checkedIn?: boolean;
  totalAmount?: number;
  price?: number;
}

export default function MyEvents() {
  const { data: session } = useSession();
  const params = useParams();
  const locale = params.locale as string;
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const fetchedEmailRef = useRef<string | null>(null);

  useEffect(() => {
    const email = session?.user?.email;
    if (email && email !== fetchedEmailRef.current) {
      fetchedEmailRef.current = email;
      
      const fetchEvents = async () => {
        if (!email) return;

        try {
          setLoading(true);
          const response = await fetch(`/api/events/my-events?email=${encodeURIComponent(email)}`);
          if (response.ok) {
            const data = await response.json();
            setEvents(data.events || []);
          } else {
            console.error("Failed to fetch events:", response.statusText);
            setEvents([]);
          }
        } catch (error) {
          console.error("Failed to fetch events:", error);
          setEvents([]);
        } finally {
          setLoading(false);
        }
      };

      fetchEvents();
    }
  }, [session?.user?.email]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || event.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "organizer":
        return "bg-purple-100 text-purple-800";
      case "volunteer":
        return "bg-orange-100 text-orange-800";
      case "sponsor":
        return "bg-emerald-100 text-emerald-800";
      case "participant":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "cultural":
        return <Star className="h-4 w-4" />;
      case "sports":
        return <Trophy className="h-4 w-4" />;
      case "fundraising":
        return <Users className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const stats = {
    total: events.length,
    upcoming: events.filter(e => e.status === "upcoming").length,
    completed: events.filter(e => e.status === "completed").length,
    volunteer: events.filter(e => e.role === "Volunteer").length,
  };

  if (!session?.user?.isMember) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-600 mb-6">You need to be a member to view your event participation.</p>
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
            <Calendar className="h-8 w-8 text-purple-600" />
            My Events
          </h1>
          <p className="text-gray-600 mt-1">Track your event participation and upcoming activities</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Add to Calendar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Events participated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">
              Events to attend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Events attended
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volunteer</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.volunteer}</div>
            <p className="text-xs text-muted-foreground">
              Events volunteered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Event Participation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                All
              </Button>
              <Button
                variant={filterStatus === "upcoming" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("upcoming")}
              >
                Upcoming
              </Button>
              <Button
                variant={filterStatus === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("completed")}
              >
                Completed
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading event history...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">
                {searchTerm ? "No events match your search criteria." : "You haven't participated in any events yet."}
              </p>
              {!searchTerm && (
                <Button className="mt-4" asChild>
                  <Link href={`/${locale}/events`}>Browse Events</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Event Image/QR Code */}
                      <div className="w-full md:w-48 h-40 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
                        {event.status === "completed" ? (
                          // Show event image for past events
                          event.image ? (
                            <Image 
                              src={event.image} 
                              alt={event.title} 
                              width={400}
                              height={400}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                              {getCategoryIcon(event.category)}
                            </div>
                          )
                        ) : (
                          // Show QR code for current/future events
                          event.qrCode ? (
                            <Image 
                              src={event.qrCode} 
                              alt="Event QR Code" 
                              width={400}
                              height={400}
                              className="w-full h-full object-contain bg-white p-2"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-xs text-center px-2">QR Code Available</span>
                            </div>
                          )
                        )}
                      </div>
                      
                      {/* Event Details */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {event.title}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge className={`${getStatusColor(event.status)} pointer-events-none`}>
                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                              </Badge>
                              <Badge className={`${getRoleColor(event.role || "")} pointer-events-none`}>
                                {event.role}
                              </Badge>
                            </div>
                            {event.totalAmount && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-semibold text-gray-700">Cost:</span>
                                <span className="text-emerald-600 font-bold">
                                  {new Intl.NumberFormat("nb-NO", {
                                    style: "currency",
                                    currency: "NOK",
                                  }).format(event.totalAmount)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(event.date).toLocaleDateString("nb-NO")}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {event.time}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {event.participantCount}/{event.maxParticipants} participants
                          </div>
                        </div>
                        
                        {event.registrationDate && (
                          <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                            Registered on: {new Date(event.registrationDate).toLocaleDateString("nb-NO")}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
