import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StarBorder from "@/components/ui/StarBorder";
import SkillsManager from "@/components/SkillsManager";
import ProfileSettings from "@/components/ProfileSettings";
import ChatInterface from "@/components/ChatInterface";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Settings,
  MessageCircle,
  BarChart3,
  BookOpen,
  Trophy,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface ProfileStats {
  rating: number;
  completedExchanges: number;
  profileCompleteness: number;
  requestsReceived: number;
  requestsSent: number;
}

interface Activity {
  type: "completed" | "upcoming" | "request";
  title: string;
  date: string;
  id?: string;
}

interface Achievement {
  title: string;
  description: string;
  earned: boolean;
}

export default function Profile() {
  const { user } = useAuth();
  const [localUser, setLocalUser] = useState(user);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<ProfileStats>({
    rating: 0,
    completedExchanges: 0,
    profileCompleteness: 0,
    requestsReceived: 0,
    requestsSent: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data from API
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const authData = JSON.parse(
          localStorage.getItem("skillswap_auth") || "{}",
        );
        const token = authData.token;

        if (!token) {
          setError("No authentication token found");
          return;
        }

        // Fetch requests to calculate stats
        const requestsResponse = await fetch("/api/requests", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          const requests = requestsData.requests;

          // Calculate profile completeness
          let completeness = 0;
          if (user.name) completeness += 20;
          if (user.email) completeness += 10;
          if (user.location) completeness += 20;
          if (user.skillsOffered.length > 0) completeness += 25;
          if (user.skillsWanted.length > 0) completeness += 25;

          // Set stats
          setStats({
            rating: 4.5 + Math.random() * 0.5, // Mock rating for now
            completedExchanges:
              requests.incoming.filter((r: any) => r.status === "accepted")
                .length +
              requests.outgoing.filter((r: any) => r.status === "accepted")
                .length,
            profileCompleteness: completeness,
            requestsReceived: requests.incoming.length,
            requestsSent: requests.outgoing.length,
          });

          // Set recent activity from requests
          const activity: Activity[] = [];
          requests.incoming.slice(0, 2).forEach((req: any) => {
            activity.push({
              type: req.status === "accepted" ? "completed" : "request",
              title: `${req.status === "accepted" ? "Completed" : "Received"} exchange request from ${req.from.name}`,
              date: new Date(req.createdAt).toLocaleDateString(),
              id: req._id,
            });
          });
          requests.outgoing.slice(0, 1).forEach((req: any) => {
            activity.push({
              type: req.status === "accepted" ? "completed" : "request",
              title: `${req.status === "accepted" ? "Completed" : "Sent"} exchange request to ${req.to.name}`,
              date: new Date(req.createdAt).toLocaleDateString(),
              id: req._id,
            });
          });
          setRecentActivity(activity);
        }

        // Set achievements based on user data
        const userAchievements: Achievement[] = [
          {
            title: "Profile Complete",
            description: "Complete your profile setup",
            earned: user.profileCompleted,
          },
          {
            title: "Skill Teacher",
            description: "Add skills you can teach",
            earned: user.skillsOffered.length > 0,
          },
          {
            title: "Skill Learner",
            description: "Add skills you want to learn",
            earned: user.skillsWanted.length > 0,
          },
          {
            title: "First Exchange",
            description: "Complete your first skill exchange",
            earned: false, // Would need session data
          },
          {
            title: "Active Member",
            description: "Send or receive multiple requests",
            earned: false, // Will be updated based on requests
          },
        ];
        setAchievements(userAchievements);
      } catch (err: any) {
        setError(err.message || "Failed to load profile data");
        console.error("Failed to fetch profile data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  if (!user || !localUser) {
    return null; // This should not happen due to protected route
  }

  const handleSendMessage = (content: string) => {
    console.log("Sending message:", content);
  };

  const handleAddTeachingSkill = async (skill: {
    skill: string;
    description: string;
    isApproved?: boolean;
  }) => {
    try {
      const authData = JSON.parse(
        localStorage.getItem("skillswap_auth") || "{}",
      );
      const token = authData.token;

      const response = await fetch("/api/users/skills/offered", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(skill),
      });

      if (!response.ok) {
        throw new Error("Failed to add teaching skill");
      }

      const data = await response.json();
      const updatedUser = {
        ...localUser,
        skillsOffered: [...localUser.skillsOffered, data.skill],
      };
      setLocalUser(updatedUser);
    } catch (error: any) {
      setError(error.message || "Failed to add teaching skill");
      console.error("Failed to add teaching skill:", error);
    }
  };

  const handleAddLearningSkill = async (skill: {
    skill: string;
    description: string;
  }) => {
    try {
      const authData = JSON.parse(
        localStorage.getItem("skillswap_auth") || "{}",
      );
      const token = authData.token;

      const response = await fetch("/api/users/skills/wanted", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(skill),
      });

      if (!response.ok) {
        throw new Error("Failed to add learning skill");
      }

      const data = await response.json();
      const updatedUser = {
        ...localUser,
        skillsWanted: [...localUser.skillsWanted, data.skill],
      };
      setLocalUser(updatedUser);
    } catch (error: any) {
      setError(error.message || "Failed to add learning skill");
      console.error("Failed to add learning skill:", error);
    }
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
            {error && (
              <div className="mt-4 bg-red-900/50 border border-red-700 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}
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
                        {stats.rating.toFixed(1)}
                      </span>
                      <span className="text-gray-400">
                        ({stats.completedExchanges} exchanges)
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
                    {stats.profileCompleteness}%
                  </span>
                </div>
                <Progress value={stats.profileCompleteness} className="h-2" />
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
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-6 bg-gray-800/50 border border-gray-600">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-primary"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="skills"
                className="data-[state=active]:bg-primary"
              >
                <BookOpen className="w-4 h-4 mr-1" />
                Skills
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-primary"
              >
                <Clock className="w-4 h-4 mr-1" />
                Activity
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="data-[state=active]:bg-primary"
              >
                <Trophy className="w-4 h-4 mr-1" />
                Achievements
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="data-[state=active]:bg-primary"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Messages
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-primary"
              >
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {mockStats.completedExchanges}
                    </div>
                    <p className="text-gray-400">Total Exchanges</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {localUser.skillsOffered.length}
                    </div>
                    <p className="text-gray-400">Skills Teaching</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {localUser.skillsWanted.length}
                    </div>
                    <p className="text-gray-400">Skills Learning</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">
                      {mockStats.rating}
                    </div>
                    <p className="text-gray-400">Average Rating</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StarBorder as="div" color="#10b981" speed="5s">
                      <Button
                        onClick={() => setActiveTab("skills")}
                        className="w-full bg-transparent border-none p-0 h-auto font-medium"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Skill
                      </Button>
                    </StarBorder>
                    <StarBorder as="div" color="#3b82f6" speed="5s">
                      <Button
                        onClick={() => setActiveTab("messages")}
                        className="w-full bg-transparent border-none p-0 h-auto font-medium"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        View Messages
                      </Button>
                    </StarBorder>
                    <StarBorder as="div" color="#8b5cf6" speed="5s">
                      <Button
                        onClick={() => setActiveTab("settings")}
                        className="w-full bg-transparent border-none p-0 h-auto font-medium"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </StarBorder>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity Preview */}
              <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.slice(0, 3).map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 bg-gray-700/50 rounded-lg"
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
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("activity")}
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    View All Activity
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

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
                      {mockStats.completedExchanges}
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
                      {mockStats.rating}
                    </div>
                    <p className="text-gray-400">Average Rating</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages">
              <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-400" />
                    Recent Conversations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Mock conversations */}
                  {[
                    {
                      id: "1",
                      name: "Sarah Chen",
                      avatar: "SC",
                      lastMessage:
                        "Thanks for the React session! When can we do the design lesson?",
                      timestamp: "2 hours ago",
                      unread: 2,
                    },
                    {
                      id: "2",
                      name: "Mike Johnson",
                      avatar: "MJ",
                      lastMessage:
                        "Great explanation of Node.js concepts. Really helped!",
                      timestamp: "1 day ago",
                      unread: 0,
                    },
                    {
                      id: "3",
                      name: "Emma Rodriguez",
                      avatar: "ER",
                      lastMessage:
                        "Looking forward to our photography session this weekend",
                      timestamp: "2 days ago",
                      unread: 1,
                    },
                  ].map((conversation) => (
                    <div
                      key={conversation.id}
                      className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => setSelectedChat(conversation.id)}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-skill-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {conversation.avatar}
                          </span>
                        </div>
                        {conversation.unread > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">
                              {conversation.unread}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">
                          {conversation.name}
                        </h4>
                        <p className="text-gray-300 text-sm truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs">
                          {conversation.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="text-center pt-4">
                    <Button
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      View All Conversations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <ProfileSettings
                onSave={(settings) => console.log("Settings saved:", settings)}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Chat Interface Dialog */}
        {selectedChat && user && (
          <Dialog
            open={!!selectedChat}
            onOpenChange={() => setSelectedChat(null)}
          >
            <DialogContent className="bg-transparent border-none p-0 max-w-4xl">
              <DialogHeader className="sr-only">
                <DialogTitle>Chat with Sarah Chen</DialogTitle>
              </DialogHeader>
              <ChatInterface
                currentUser={{
                  id: user.id,
                  name: user.name,
                  avatar: user.avatar,
                  profilePhoto: user.profilePhoto,
                  online: true,
                }}
                otherUser={{
                  id: "other-user",
                  name: "Sarah Chen",
                  avatar: "SC",
                  profilePhoto:
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
                  online: true,
                  lastSeen: "5 minutes ago",
                }}
                messages={[
                  {
                    id: "1",
                    senderId: "other-user",
                    content:
                      "Thanks for the React session! When can we do the design lesson?",
                    timestamp: new Date(
                      Date.now() - 2 * 60 * 60 * 1000,
                    ).toISOString(),
                    type: "text",
                    status: "read",
                  },
                  {
                    id: "2",
                    senderId: user.id,
                    content:
                      "I'm glad you found it helpful! How about this Thursday at 7 PM for the design session?",
                    timestamp: new Date(
                      Date.now() - 1 * 60 * 60 * 1000,
                    ).toISOString(),
                    type: "text",
                    status: "read",
                  },
                ]}
                onSendMessage={handleSendMessage}
                onScheduleSession={() => console.log("Scheduling session")}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}
