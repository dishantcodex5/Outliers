import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StarBorder from "@/components/ui/StarBorder";
import SkillsManager from "@/components/SkillsManager";
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
  Plus,
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
  const { user, updateUser } = useAuth();
  const [localUser, setLocalUser] = useState(user);

  if (!user || !localUser) {
    return null; // This should not happen due to protected route
  }

  const handleAddTeachingSkill = (skill: {
    skill: string;
    description: string;
    isApproved?: boolean;
  }) => {
    const updatedUser = {
      ...localUser,
      skillsOffered: [...localUser.skillsOffered, skill],
    };
    setLocalUser(updatedUser);
    // In a real app, this would make an API call to update the user
    console.log("Added teaching skill:", skill);
  };

  const handleAddLearningSkill = (skill: {
    skill: string;
    description: string;
  }) => {
    const updatedUser = {
      ...localUser,
      skillsWanted: [...localUser.skillsWanted, skill],
    };
    setLocalUser(updatedUser);
    // In a real app, this would make an API call to update the user
    console.log("Added learning skill:", skill);
  };

  const getAvailabilityText = () => {
    const times = [];
    const days = [];

    if (localUser.availability.weekdays) days.push("Weekdays");
    if (localUser.availability.weekends) days.push("Weekends");
    if (localUser.availability.mornings) times.push("Mornings");
    if (localUser.availability.afternoons) times.push("Afternoons");
    if (localUser.availability.evenings) times.push("Evenings");

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
                  {localUser.profilePhoto ? (
                    <img
                      src={localUser.profilePhoto}
                      alt={localUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-skill-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {localUser.avatar}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                    <h2 className="text-3xl font-bold text-white">
                      {localUser.name}
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
                      {localUser.role === "admin" && (
                        <Badge className="bg-red-900/50 text-red-300 border-red-600">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      <Badge
                        className={
                          localUser.isPublic
                            ? "bg-green-900/50 text-green-300 border-green-600"
                            : "bg-gray-900/50 text-gray-300 border-gray-600"
                        }
                      >
                        {localUser.isPublic ? (
                          <Eye className="w-3 h-3 mr-1" />
                        ) : (
                          <EyeOff className="w-3 h-3 mr-1" />
                        )}
                        {localUser.isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {localUser.email}
                    </div>
                    {localUser.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {localUser.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined{" "}
                      {localUser.createdAt
                        ? new Date(localUser.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "long", year: "numeric" },
                          )
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
                    {mockStats.profileCompleteness}%
                  </span>
                </div>
                <Progress
                  value={mockStats.profileCompleteness}
                  className="h-2"
                />
                <p className="text-sm text-gray-400 mt-2">
                  {user.skillsOffered.length === 0 &&
                    "Add skills you can teach. "}
                  {user.skillsWanted.length === 0 &&
                    "Add skills you want to learn. "}
                  {!user.location && "Add your location. "}
                  Complete your profile to get more opportunities!
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
                      Skills I Teach ({localUser.skillsOffered.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {localUser.skillsOffered.length > 0 ? (
                      localUser.skillsOffered.map((skill, index) => (
                        <div
                          key={index}
                          className="space-y-2 p-3 bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-white font-medium">
                                {skill.skill}
                              </h4>
                              {skill.description && (
                                <p className="text-gray-300 text-sm mt-1">
                                  {skill.description}
                                </p>
                              )}
                            </div>
                            <Badge
                              variant="secondary"
                              className={
                                skill.isApproved
                                  ? "bg-green-900/50 text-green-300 border-green-600"
                                  : "bg-yellow-900/50 text-yellow-300 border-yellow-600"
                              }
                            >
                              {skill.isApproved ? "Approved" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No teaching skills added yet</p>
                        <p className="text-sm">
                          Add skills you can teach to start exchanging!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-400" />
                      Skills I Want to Learn ({user.skillsWanted.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {user.skillsWanted.length > 0 ? (
                      user.skillsWanted.map((skill, index) => (
                        <div
                          key={index}
                          className="space-y-2 p-3 bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="text-white font-medium">
                              {skill.skill}
                            </h4>
                            {skill.description && (
                              <p className="text-gray-300 text-sm mt-1">
                                {skill.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No learning interests added yet</p>
                        <p className="text-sm">Add skills you want to learn!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Add Skills Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StarBorder as="div" color="#10b981" speed="5s">
                  <Button className="w-full bg-transparent border-none p-0 h-auto font-medium">
                    Add Teaching Skill
                  </Button>
                </StarBorder>
                <StarBorder as="div" color="#f59e0b" speed="5s">
                  <Button className="w-full bg-transparent border-none p-0 h-auto font-medium">
                    Add Learning Interest
                  </Button>
                </StarBorder>
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
