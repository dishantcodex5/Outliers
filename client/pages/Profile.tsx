import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StarBorder from "@/components/ui/StarBorder";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Edit3,
  Star,
  Clock,
  MapPin,
  Mail,
  Calendar,
  Award,
  TrendingUp,
  Heart,
  CheckCircle,
  Shield,
  Eye,
  EyeOff,
  Globe,
} from "lucide-react";

// Mock additional data not in user schema
const mockStats = {
  rating: 4.8,
  completedExchanges: 24,
  profileCompleteness: 85,
};

const recentActivity = [
  {
    type: "completed",
    title: "React Hooks session with Sarah",
    date: "2 days ago",
  },
  {
    type: "upcoming",
    title: "Node.js basics with Mike",
    date: "Tomorrow, 3 PM",
  },
  {
    type: "completed",
    title: "Spanish conversation with Maria",
    date: "1 week ago",
  },
];

const achievements = [
  {
    title: "First Exchange",
    description: "Completed your first skill exchange",
    earned: true,
  },
  { title: "Teacher", description: "Taught 10+ sessions", earned: true },
  { title: "Student", description: "Learned 5+ skills", earned: true },
  { title: "Highly Rated", description: "Maintain 4.5+ rating", earned: true },
  { title: "Mentor", description: "Teach 25+ sessions", earned: false },
];

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return null; // This should not happen due to protected route
  }

  const getAvailabilityText = () => {
    const times = [];
    const days = [];

    if (user.availability.weekdays) days.push("Weekdays");
    if (user.availability.weekends) days.push("Weekends");
    if (user.availability.mornings) times.push("Mornings");
    if (user.availability.afternoons) times.push("Afternoons");
    if (user.availability.evenings) times.push("Evenings");

    const dayText = days.length > 0 ? days.join(", ") : "No days set";
    const timeText = times.length > 0 ? times.join(", ") : "No times set";

    return `${dayText} - ${timeText}`;
  };
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Profile Dashboard
            </h1>
            <p className="text-gray-300">
              Manage your skills, track your progress, and connect with the
              community
            </p>
          </div>

          {/* Profile Header Card */}
          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600 shadow-2xl mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-2 border-primary/20">
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-skill-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {user.avatar}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                    <h2 className="text-3xl font-bold text-white">
                      {user.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-white font-semibold">
                        {mockStats.rating}
                      </span>
                      <span className="text-gray-400">
                        ({mockStats.completedExchanges} exchanges)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.role === "admin" && (
                        <Badge className="bg-red-900/50 text-red-300 border-red-600">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      <Badge
                        className={
                          user.isPublic
                            ? "bg-green-900/50 text-green-300 border-green-600"
                            : "bg-gray-900/50 text-gray-300 border-gray-600"
                        }
                      >
                        {user.isPublic ? (
                          <Eye className="w-3 h-3 mr-1" />
                        ) : (
                          <EyeOff className="w-3 h-3 mr-1" />
                        )}
                        {user.isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {user.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined{" "}
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })
                        : "Recently"}
                    </div>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-white font-medium">
                        Availability
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      {getAvailabilityText()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <StarBorder color="#60a5fa" speed="5s">
                    Configure Profile
                  </StarBorder>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>

              {/* Profile Completeness */}
              <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">
                    Profile Completeness
                  </span>
                  <span className="text-primary font-semibold">
                    {userData.profileCompleteness}%
                  </span>
                </div>
                <Progress
                  value={userData.profileCompleteness}
                  className="h-2"
                />
                <p className="text-sm text-gray-400 mt-2">
                  Complete your profile to get more skill exchange opportunities
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="skills" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-gray-600">
              <TabsTrigger
                value="skills"
                className="data-[state=active]:bg-primary"
              >
                My Skills
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-primary"
              >
                Activity
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="data-[state=active]:bg-primary"
              >
                Achievements
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="data-[state=active]:bg-primary"
              >
                Statistics
              </TabsTrigger>
            </TabsList>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      Teaching Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {skills
                      .filter((skill) => skill.category === "Teaching")
                      .map((skill, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-medium">
                              {skill.name}
                            </span>
                            <Badge
                              variant="secondary"
                              className="bg-green-900/50 text-green-300"
                            >
                              {skill.sessions} sessions
                            </Badge>
                          </div>
                          <Progress value={skill.level} className="h-2" />
                          <span className="text-sm text-gray-400">
                            Expertise: {skill.level}%
                          </span>
                        </div>
                      ))}
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-400" />
                      Learning Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {skills
                      .filter((skill) => skill.category === "Learning")
                      .map((skill, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-medium">
                              {skill.name}
                            </span>
                            <Badge
                              variant="secondary"
                              className="bg-blue-900/50 text-blue-300"
                            >
                              {skill.sessions} sessions
                            </Badge>
                          </div>
                          <Progress value={skill.level} className="h-2" />
                          <span className="text-sm text-gray-400">
                            Progress: {skill.level}%
                          </span>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg"
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          activity.type === "completed"
                            ? "bg-green-400"
                            : "bg-blue-400"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-400">{activity.date}</p>
                      </div>
                      {activity.type === "completed" && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements">
              <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 ${
                          achievement.earned
                            ? "bg-yellow-900/20 border-yellow-600"
                            : "bg-gray-700/50 border-gray-600"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Award
                            className={`w-6 h-6 ${
                              achievement.earned
                                ? "text-yellow-400"
                                : "text-gray-500"
                            }`}
                          />
                          <h3
                            className={`font-semibold ${
                              achievement.earned
                                ? "text-yellow-300"
                                : "text-gray-400"
                            }`}
                          >
                            {achievement.title}
                          </h3>
                        </div>
                        <p
                          className={`text-sm ${
                            achievement.earned
                              ? "text-yellow-200"
                              : "text-gray-500"
                          }`}
                        >
                          {achievement.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="stats">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {userData.completedExchanges}
                    </div>
                    <p className="text-gray-400">Total Exchanges</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      18
                    </div>
                    <p className="text-gray-400">Sessions Taught</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      6
                    </div>
                    <p className="text-gray-400">Sessions Learned</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">
                      {userData.rating}
                    </div>
                    <p className="text-gray-400">Average Rating</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
