"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
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
}

export default function MyEvents() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchEvents = async () => {
    if (!session?.user?.email) return;

    try {
      setLoading(true);
      // For now, we'll create mock data. Later this will be replaced with actual API call
      const mockEvents: Event[] = [
        {
          id: "1",
          title: "Annual General Meeting 2024",
          description: "Join us for our annual general meeting where we'll discuss the year's achievements and future plans.",
          date: "2024-03-15",
          time: "18:00",
          location: "Community Center, Oslo",
          status: "completed",
          category: "Meeting",
          participantCount: 45,
          maxParticipants: 60,
          registrationDate: "2024-02-20",
          role: "Member",
          organizer: "PNSB Norway"
        },
        {
          id: "2",
          title: "Cultural Festival Celebration",
          description: "Celebrate Nepali culture with traditional music, dance, and food.",
          date: "2024-06-20",
          time: "14:00",
          location: "Frogner Park, Oslo",
          status: "upcoming",
          category: "Cultural",
          participantCount: 120,
          maxParticipants: 200,
          registrationDate: "2024-05-10",
          role: "Volunteer",
          organizer: "Cultural Committee"
        },
        {
          id: "3",
          title: "Charity Fundraising Dinner",
          description: "An elegant dinner event to raise funds for our community projects.",
          date: "2024-09-10",
          time: "19:00",
          location: "Grand Hotel, Oslo",
          status: "upcoming",
          category: "Fundraising",
          participantCount: 30,
          maxParticipants: 100,
          registrationDate: "2024-08-01",
          role: "Sponsor",
          organizer: "Fundraising Committee"
        },
        {
          id: "4",
          title: "Sports Day 2024",
          description: "A fun-filled day of sports activities for all ages.",
          date: "2024-07-15",
          time: "10:00",
          location: "Sports Complex, Oslo",
          status: "completed",
          category: "Sports",
          participantCount: 85,
          maxParticipants: 150,
          registrationDate: "2024-06-01",
          role: "Participant",
          organizer: "Sports Committee"
        }
      ];
      
      setEvents(mockEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [session, fetchEvents]);

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
                  <Link href="/events">Browse Events</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Event Image Placeholder */}
                      <div className="w-full md:w-48 h-32 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                        {getCategoryIcon(event.category)}
                      </div>
                      
                      {/* Event Details */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {event.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                              {event.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Badge className={getStatusColor(event.status)}>
                                {event.status}
                              </Badge>
                              <Badge className={getRoleColor(event.role || "")}>
                                {event.role}
                              </Badge>
                              <Badge variant="outline">
                                {event.category}
                              </Badge>
                            </div>
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
