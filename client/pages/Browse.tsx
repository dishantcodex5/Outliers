import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
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
const convertUserToChromaItem = (
  user: User,
  navigate: (path: string) => void,
): ChromaItem => {
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
    url: `/users/${user._id}`,
    rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(2)), // Mock rating for now
    reviews: parseFloat((Math.random() * 50 + 5).toFixed(2)),
    isOnline: Math.random() > 0.5,
    skillsOffered: user.skillsOffered.map((s) => s.skill),
    skillsWanted: user.skillsWanted.map((s) => s.skill),
    availability: availabilityText(),
    onClick: () => navigate(`/users/${user._id}`), // Add click handler
  };
};

export default function Browse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append("skill", searchTerm);
        if (locationFilter) params.append("location", locationFilter);

        // Get auth token if user is logged in
        const authData = JSON.parse(
          localStorage.getItem("skillswap_auth") || "{}",
        );
        const token = authData.token;

        const headers: any = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`/api/users?${params.toString()}`, {
          headers,
        });

        // Check for HTML responses (API routing issues)
        const responseText = await response.text();
        if (responseText.startsWith("<!DOCTYPE")) {
          throw new Error(
            "Users API endpoint not found. Please check server configuration.",
          );
        }

        if (!response.ok) {
          throw new Error(
            `Failed to fetch users: ${response.status} ${response.statusText}`,
          );
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error("Invalid response format from server");
        }

        setUsers(data.users || []);
        setError(null); // Clear any previous errors
      } catch (err: any) {
        const errorMessage = err.message || "Failed to load users";
        setError(errorMessage);
        console.error("Failed to fetch users:", err);

        // Auto-retry on certain errors (up to 2 times)
        if (
          retryCount < 2 &&
          (errorMessage.includes("endpoint not found") ||
            errorMessage.includes("Invalid response"))
        ) {
          console.log(`Retrying user fetch (attempt ${retryCount + 1}/2)...`);
          setRetryCount((prev) => prev + 1);
          setTimeout(() => {
            fetchUsers();
          }, 1000);
          return;
        }
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
  const chromaItems = filteredUsers.map((user) =>
    convertUserToChromaItem(user, navigate),
  );

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
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Users className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                <span className="text-center">Discover Amazing Talent</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-4">
                Connect with skilled professionals ready to share their
                expertise and learn new skills in our interactive community
              </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4 max-w-4xl mx-auto px-4">
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
                <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-600 p-4 md:p-6 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
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

            {/* Error Display */}
            {error && (
              <div className="mb-8 bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300">{error}</span>
              </div>
            )}

            {/* Results Count */}
            <div className="mb-8 text-center">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-gray-400 text-lg">
                    Searching for talented individuals...
                  </span>
                </div>
              ) : (
                <p className="text-gray-400 text-lg">
                  <span className="text-primary font-semibold">
                    {chromaItems.length}
                  </span>{" "}
                  talented individuals ready to connect
                </p>
              )}
            </div>

            {/* ChromaGrid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">
                    Loading talented individuals...
                  </p>
                </div>
              </div>
            ) : chromaItems.length > 0 ? (
              <div style={{ minHeight: "800px", position: "relative" }}>
                <ChromaGrid
                  items={chromaItems}
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
