import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StarBorder from "@/components/ui/StarBorder";
import Layout from "@/components/Layout";
import {
  Search,
  MapPin,
  Clock,
  Star,
  Filter,
  Grid3X3,
  List,
  MessageSquare,
} from "lucide-react";

// Dummy user data
const users = [
  {
    id: 1,
    name: "Alex Thompson",
    location: "San Francisco, CA",
    avatar: "",
    rating: 4.9,
    reviews: 23,
    skillsOffered: ["React", "Node.js", "TypeScript"],
    skillsWanted: ["UI/UX Design", "Figma"],
    availability: "Weekends",
    isOnline: true,
    joinedDate: "2023-05-15",
  },
  {
    id: 2,
    name: "Sarah Martinez",
    location: "New York, NY",
    avatar: "",
    rating: 5.0,
    reviews: 31,
    skillsOffered: ["Graphic Design", "Adobe Creative Suite", "Branding"],
    skillsWanted: ["Python", "Data Analysis"],
    availability: "Evenings",
    isOnline: false,
    joinedDate: "2023-03-10",
  },
  {
    id: 3,
    name: "David Kim",
    location: "Remote",
    avatar: "",
    rating: 4.8,
    reviews: 18,
    skillsOffered: ["Photography", "Video Editing", "Lightroom"],
    skillsWanted: ["Web Development", "SEO"],
    availability: "Flexible",
    isOnline: true,
    joinedDate: "2023-07-22",
  },
  {
    id: 4,
    name: "Emily Chen",
    location: "Los Angeles, CA",
    avatar: "",
    rating: 4.7,
    reviews: 15,
    skillsOffered: ["Content Writing", "Copywriting", "SEO"],
    skillsWanted: ["Social Media Marketing", "Analytics"],
    availability: "Weekdays",
    isOnline: true,
    joinedDate: "2023-06-08",
  },
  {
    id: 5,
    name: "Michael Rodriguez",
    location: "Chicago, IL",
    avatar: "",
    rating: 4.9,
    reviews: 27,
    skillsOffered: ["Digital Marketing", "Google Ads", "Analytics"],
    skillsWanted: ["Graphic Design", "Video Production"],
    availability: "Weekends",
    isOnline: false,
    joinedDate: "2023-04-12",
  },
  {
    id: 6,
    name: "Jessica Wang",
    location: "Seattle, WA",
    avatar: "",
    rating: 5.0,
    reviews: 42,
    skillsOffered: ["UI/UX Design", "Figma", "Prototyping"],
    skillsWanted: ["React Native", "Mobile Development"],
    availability: "Evenings",
    isOnline: true,
    joinedDate: "2023-02-20",
  },
];

export default function Browse() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Filter users based on search criteria
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.skillsOffered.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase()),
      ) ||
      user.skillsWanted.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesLocation =
      locationFilter === "" ||
      user.location.toLowerCase().includes(locationFilter.toLowerCase());

    const matchesAvailability =
      availabilityFilter === "" || user.availability === availabilityFilter;

    return matchesSearch && matchesLocation && matchesAvailability;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Layout>
      <div className="bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Browse Skills
            </h1>
            <p className="text-gray-300">
              Discover talented individuals ready to share their expertise
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name, skills offered, or skills wanted..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-primary"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={
                    viewMode === "grid"
                      ? ""
                      : "border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
                  }
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={
                    viewMode === "list"
                      ? ""
                      : "border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
                  }
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="bg-gray-800 border border-gray-600 p-4 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Location
                  </label>
                  <Input
                    placeholder="Enter location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Availability
                  </label>
                  <Select
                    value={availabilityFilter}
                    onValueChange={setAvailabilityFilter}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="Weekends">Weekends</SelectItem>
                      <SelectItem value="Evenings">Evenings</SelectItem>
                      <SelectItem value="Weekdays">Weekdays</SelectItem>
                      <SelectItem value="Flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setLocationFilter("");
                      setAvailabilityFilter("");
                    }}
                    className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-400">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>

          {/* User Grid/List */}
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredUsers.map((user) => (
              <Card
                key={user.id}
                className={`hover:shadow-xl transition-all duration-300 bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-primary/50 ${
                  viewMode === "list" ? "p-4" : ""
                }`}
              >
                <CardContent className={viewMode === "list" ? "p-0" : "p-6"}>
                  <div
                    className={
                      viewMode === "list"
                        ? "flex items-center space-x-4"
                        : "text-center"
                    }
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar
                        className={
                          viewMode === "list"
                            ? "w-16 h-16"
                            : "w-20 h-20 mx-auto mb-4"
                        }
                      >
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-skill-600 text-white font-semibold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      {user.isOnline && (
                        <div
                          className={`absolute ${
                            viewMode === "list"
                              ? "bottom-1 right-1"
                              : "bottom-3 right-4"
                          } w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800`}
                        ></div>
                      )}
                    </div>

                    <div className={viewMode === "list" ? "flex-1" : ""}>
                      {/* User Info */}
                      <div className={viewMode === "list" ? "mb-2" : "mb-4"}>
                        <h3 className="text-lg font-semibold text-white">
                          {user.name}
                        </h3>
                        <div className="flex items-center justify-center sm:justify-start text-gray-400 text-sm mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {user.location}
                        </div>
                        <div className="flex items-center justify-center sm:justify-start text-gray-400 text-sm mt-1">
                          <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                          {user.rating} ({user.reviews} reviews)
                        </div>
                      </div>

                      {/* Skills Offered */}
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-300 mb-2">
                          Offers:
                        </p>
                        <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
                          {user.skillsOffered.map((skill) => (
                            <Badge
                              key={skill}
                              variant="default"
                              className="text-xs bg-primary hover:bg-primary/80"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Skills Wanted */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-300 mb-2">
                          Wants:
                        </p>
                        <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
                          {user.skillsWanted.map((skill) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="text-xs border-gray-500 text-gray-300 hover:border-primary hover:text-primary"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Availability */}
                      <div className="mb-4">
                        <div className="flex items-center justify-center sm:justify-start text-gray-400 text-sm">
                          <Clock className="w-4 h-4 mr-1" />
                          Available {user.availability}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className={viewMode === "list" ? "ml-4" : ""}>
                      <StarBorder
                        className="text-sm px-4 py-2"
                        color="#a855f7"
                        speed="5s"
                      >
                        <MessageSquare className="w-4 h-4 mr-2 inline" />
                        Connect
                      </StarBorder>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No users found
              </h3>
              <p className="text-gray-400">
                Try adjusting your search criteria or filters
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
