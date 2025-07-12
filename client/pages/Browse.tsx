import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ChromaGrid, { ChromaItem } from "@/components/ChromaGrid";
import Layout from "@/components/Layout";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  location: string;
  profilePhoto: string;
  skillsOffered: Array<{
    skill: string;
    description: string;
    isApproved: boolean;
  }>;
  skillsWanted: Array<{ skill: string; description: string }>;
  availability: {
    weekdays: boolean;
    weekends: boolean;
    mornings: boolean;
    afternoons: boolean;
    evenings: boolean;
  };
  isPublic: boolean;
  profileCompleted: boolean;
}

// Convert API user to ChromaGrid item format
const convertUserToChromaItem = (user: User): ChromaItem => {
  const availabilityText = () => {
    const times = [];
    if (user.availability.weekdays) times.push("Weekdays");
    if (user.availability.weekends) times.push("Weekends");
    return times.length > 0 ? times.join(", ") : "Flexible";
  };

  return {
    image: user.profilePhoto,
    title: user.name,
    subtitle:
      user.skillsOffered.length > 0
        ? user.skillsOffered[0].skill
        : "Skill Exchanger",
    handle: `@${user.name.toLowerCase().replace(/\s+/g, "")}`,
    location: user.location,
    borderColor: "#4F46E5",
    gradient: "linear-gradient(145deg, #4F46E5, #1e293b)",
    url: `/profile/${user._id}`,
    rating: 4.5 + Math.random() * 0.5, // Mock rating for now
    reviews: Math.floor(Math.random() * 50) + 5,
    isOnline: Math.random() > 0.5,
    skillsOffered: user.skillsOffered.map((s) => s.skill),
    skillsWanted: user.skillsWanted.map((s) => s.skill),
    availability: availabilityText(),
  };
};

export default function Browse() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append("skill", searchTerm);
        if (locationFilter) params.append("location", locationFilter);

        const response = await fetch(`/api/users?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data.users || []);
      } catch (err: any) {
        setError(err.message || "Failed to load users");
        console.error("Failed to fetch users:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchUsers, 300); // Debounce search
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, locationFilter]);

  // Filter users based on availability (client-side filtering for UX)
  const filteredUsers = users.filter((user) => {
    if (!availabilityFilter) return true;

    const availability = user.availability;
    switch (availabilityFilter) {
      case "Weekdays":
        return availability.weekdays;
      case "Weekends":
        return availability.weekends;
      case "Evenings":
        return availability.evenings;
      case "Flexible":
        return availability.weekdays && availability.weekends;
      default:
        return true;
    }
  });

  // Convert users to ChromaGrid format
  const chromaItems = filteredUsers.map(convertUserToChromaItem);

  return (
    <Layout>
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 left-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-skill-600/20 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>

        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                <Users className="w-10 h-10 text-primary" />
                Discover Amazing Talent
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Connect with skilled professionals ready to share their
                expertise and learn new skills in our interactive community
              </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by name, role, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800/80 backdrop-blur-sm border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary/20 h-12 text-lg"
                  />
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="lg"
                    onClick={() => setViewMode("grid")}
                    className={
                      viewMode === "grid"
                        ? "h-12"
                        : "border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 h-12"
                    }
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="lg"
                    onClick={() => setViewMode("list")}
                    className={
                      viewMode === "list"
                        ? "h-12"
                        : "border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 h-12"
                    }
                  >
                    <List className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowFilters(!showFilters)}
                    className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 h-12"
                  >
                    <Filter className="w-5 h-5 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-600 p-6 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Location
                    </label>
                    <Input
                      placeholder="Enter location..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="bg-gray-700/80 border-gray-600 text-white placeholder-gray-400 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Availability
                    </label>
                    <Select
                      value={availabilityFilter}
                      onValueChange={setAvailabilityFilter}
                    >
                      <SelectTrigger className="bg-gray-700/80 border-gray-600 text-white">
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
                      className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="mb-8 text-center">
              <p className="text-gray-400 text-lg">
                <span className="text-primary font-semibold">
                  {filteredUsers.length}
                </span>{" "}
                talented individuals ready to connect
              </p>
            </div>

            {/* ChromaGrid */}
            {filteredUsers.length > 0 ? (
              <div style={{ minHeight: "800px", position: "relative" }}>
                <ChromaGrid
                  items={filteredUsers}
                  radius={350}
                  damping={0.45}
                  fadeOut={0.6}
                  ease="power3.out"
                  columns={3}
                />
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="text-2xl font-medium text-white mb-4">
                  No professionals found
                </h3>
                <p className="text-gray-400 text-lg max-w-md mx-auto">
                  Try adjusting your search criteria or filters to discover more
                  talented individuals in our community
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
