import { useState } from "react";
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
import { Search, Filter, Grid3X3, List, Users } from "lucide-react";

// Enhanced user data adapted for ChromaGrid
const users: ChromaItem[] = [
  {
    image: "https://i.pravatar.cc/300?img=1",
    title: "Alex Thompson",
    subtitle: "Full Stack Developer",
    handle: "@alexthompson",
    location: "San Francisco, CA",
    borderColor: "#4F46E5",
    gradient: "linear-gradient(145deg, #4F46E5, #1e293b)",
    url: "https://github.com/alexthompson",
    rating: 4.9,
    reviews: 23,
    isOnline: true,
    skillsOffered: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    skillsWanted: ["UI/UX Design", "Figma", "Adobe XD"],
    availability: "Weekends",
  },
  {
    image: "https://i.pravatar.cc/300?img=2",
    title: "Sarah Martinez",
    subtitle: "UI/UX Designer",
    handle: "@sarahdesigns",
    location: "New York, NY",
    borderColor: "#10B981",
    gradient: "linear-gradient(210deg, #10B981, #1e293b)",
    url: "https://dribbble.com/sarahdesigns",
    rating: 5.0,
    reviews: 31,
    isOnline: false,
    skillsOffered: [
      "Graphic Design",
      "Adobe Creative Suite",
      "Branding",
      "Prototyping",
    ],
    skillsWanted: ["Python", "Data Analysis", "Machine Learning"],
    availability: "Evenings",
  },
  {
    image: "https://i.pravatar.cc/300?img=3",
    title: "David Kim",
    subtitle: "Photographer & Editor",
    handle: "@davidkim_photo",
    location: "Remote",
    borderColor: "#F59E0B",
    gradient: "linear-gradient(165deg, #F59E0B, #1e293b)",
    url: "https://unsplash.com/@davidkim",
    rating: 4.8,
    reviews: 18,
    isOnline: true,
    skillsOffered: [
      "Photography",
      "Video Editing",
      "Lightroom",
      "Premiere Pro",
    ],
    skillsWanted: ["Web Development", "SEO", "Digital Marketing"],
    availability: "Flexible",
  },
  {
    image: "https://i.pravatar.cc/300?img=4",
    title: "Emily Chen",
    subtitle: "Content Strategist",
    handle: "@emilychen_writes",
    location: "Los Angeles, CA",
    borderColor: "#EF4444",
    gradient: "linear-gradient(195deg, #EF4444, #1e293b)",
    url: "https://medium.com/@emilychen",
    rating: 4.7,
    reviews: 15,
    isOnline: true,
    skillsOffered: [
      "Content Writing",
      "Copywriting",
      "SEO",
      "Content Strategy",
    ],
    skillsWanted: ["Social Media Marketing", "Analytics", "Paid Advertising"],
    availability: "Weekdays",
  },
  {
    image: "https://i.pravatar.cc/300?img=5",
    title: "Michael Rodriguez",
    subtitle: "Digital Marketing Expert",
    handle: "@mikemarketing",
    location: "Chicago, IL",
    borderColor: "#8B5CF6",
    gradient: "linear-gradient(225deg, #8B5CF6, #1e293b)",
    url: "https://linkedin.com/in/mikemarketing",
    rating: 4.9,
    reviews: 27,
    isOnline: false,
    skillsOffered: [
      "Digital Marketing",
      "Google Ads",
      "Analytics",
      "Email Marketing",
    ],
    skillsWanted: ["Graphic Design", "Video Production", "Animation"],
    availability: "Weekends",
  },
  {
    image: "https://i.pravatar.cc/300?img=6",
    title: "Jessica Wang",
    subtitle: "Product Designer",
    handle: "@jessicawang_ux",
    location: "Seattle, WA",
    borderColor: "#06B6D4",
    gradient: "linear-gradient(135deg, #06B6D4, #1e293b)",
    url: "https://behance.net/jessicawang",
    rating: 5.0,
    reviews: 42,
    isOnline: true,
    skillsOffered: ["UI/UX Design", "Figma", "Prototyping", "User Research"],
    skillsWanted: ["React Native", "Mobile Development", "Flutter"],
    availability: "Evenings",
  },
  {
    image: "https://i.pravatar.cc/300?img=7",
    title: "Carlos Lopez",
    subtitle: "Backend Developer",
    handle: "@carlosdev",
    location: "Austin, TX",
    borderColor: "#F97316",
    gradient: "linear-gradient(155deg, #F97316, #1e293b)",
    url: "https://github.com/carlosdev",
    rating: 4.6,
    reviews: 19,
    isOnline: true,
    skillsOffered: ["Python", "Django", "PostgreSQL", "Docker"],
    skillsWanted: ["React", "Vue.js", "Frontend Architecture"],
    availability: "Flexible",
  },
  {
    image: "https://i.pravatar.cc/300?img=8",
    title: "Nina Patel",
    subtitle: "Data Scientist",
    handle: "@nina_data",
    location: "Boston, MA",
    borderColor: "#EC4899",
    gradient: "linear-gradient(175deg, #EC4899, #1e293b)",
    url: "https://kaggle.com/ninadata",
    rating: 4.8,
    reviews: 33,
    isOnline: false,
    skillsOffered: [
      "Machine Learning",
      "Python",
      "TensorFlow",
      "Data Visualization",
    ],
    skillsWanted: ["Web Development", "Cloud Architecture", "DevOps"],
    availability: "Weekdays",
  },
  {
    image: "https://i.pravatar.cc/300?img=9",
    title: "Ryan O'Connor",
    subtitle: "Mobile Developer",
    handle: "@ryanoconnor_dev",
    location: "Portland, OR",
    borderColor: "#84CC16",
    gradient: "linear-gradient(185deg, #84CC16, #1e293b)",
    url: "https://github.com/ryanoconnor",
    rating: 4.7,
    reviews: 21,
    isOnline: true,
    skillsOffered: ["React Native", "Swift", "Kotlin", "Firebase"],
    skillsWanted: ["Backend Development", "API Design", "System Architecture"],
    availability: "Evenings",
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
      user.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.skillsOffered?.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase()),
      ) ||
      user.skillsWanted?.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesLocation =
      locationFilter === "" ||
      user.location?.toLowerCase().includes(locationFilter.toLowerCase());

    const matchesAvailability =
      availabilityFilter === "" || user.availability === availabilityFilter;

    return matchesSearch && matchesLocation && matchesAvailability;
  });

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
