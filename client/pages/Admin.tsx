import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StarBorder from "@/components/ui/StarBorder";
import { useAuth } from "@/contexts/AuthContext";
import {
  Shield,
  Users,
  Flag,
  MessageSquare,
  BarChart3,
  Search,
  Ban,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Clock,
  TrendingUp,
  UserCheck,
  Activity,
  BookOpen,
  Download,
  Send,
  Eye,
  X,
  Plus,
  FileText,
} from "lucide-react";

interface AdminStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  requests: {
    total: number;
    pending: number;
    accepted: number;
    successRate: number;
  };
  conversations: {
    total: number;
  };
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileCompleted: boolean;
  createdAt: string;
  status?: string;
}

interface ActivityItem {
  type: string;
  description: string;
  timestamp: string;
  user?: string;
  status?: string;
}

interface SkillSubmission {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  skill: string;
  description: string;
  category: string;
  isApproved: boolean;
  createdAt: string;
}

interface SwapRequest {
  _id: string;
  from: {
    _id: string;
    name: string;
    email: string;
  };
  to: {
    _id: string;
    name: string;
    email: string;
  };
  offeredSkill: string;
  requestedSkill: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

interface PlatformMessage {
  _id?: string;
  title: string;
  content: string;
  type: "announcement" | "maintenance" | "feature";
  priority: "low" | "medium" | "high";
  targetUsers: "all" | "active" | "inactive";
  scheduledAt?: string;
  createdAt?: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [skillSubmissions, setSkillSubmissions] = useState<SkillSubmission[]>(
    [],
  );
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [messageForm, setMessageForm] = useState<PlatformMessage>({
    title: "",
    content: "",
    type: "announcement",
    priority: "medium",
    targetUsers: "all",
  });
  const [showMessageForm, setShowMessageForm] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user || user.role !== "admin") return;

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

        // Fetch stats, users, activity, skills, and swaps in parallel
        const [statsRes, usersRes, activityRes, skillsRes, swapsRes] =
          await Promise.all([
            fetch("/api/admin/stats", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`/api/admin/users?page=${currentPage}&search=${searchTerm}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("/api/admin/activity", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("/api/admin/skills/pending", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("/api/admin/swaps", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        if (!statsRes.ok || !usersRes.ok || !activityRes.ok) {
          throw new Error("Failed to fetch admin data");
        }

        const [statsData, usersData, activityData, skillsData, swapsData] =
          await Promise.all([
            statsRes.json(),
            usersRes.json(),
            activityRes.json(),
            skillsRes.ok ? skillsRes.json() : { skills: [] },
            swapsRes.ok ? swapsRes.json() : { swaps: [] },
          ]);

        setStats(statsData);
        setUsers(usersData.users);
        setTotalPages(usersData.pagination.pages);
        setActivity(activityData.activity);
        setSkillSubmissions(skillsData.skills || []);
        setSwapRequests(swapsData.swaps || []);
      } catch (err: any) {
        setError(err.message || "Failed to load admin data");
        console.error("Failed to fetch admin data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [user, currentPage, searchTerm]);

  const handleUserStatusChange = async (userId: string, newStatus: string) => {
    try {
      setActionLoading(userId);
      const authData = JSON.parse(
        localStorage.getItem("skillswap_auth") || "{}",
      );
      const token = authData.token;

      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      // Update local state
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, status: newStatus } : user,
        ),
      );
    } catch (err: any) {
      setError(err.message || "Failed to update user status");
      console.error("Failed to update user status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              Access Denied
            </h3>
            <p className="text-gray-400 mb-6">
              Admin privileges required to access this page.
            </p>
            <Button onClick={() => navigate("/")} variant="outline">
              Go Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <Shield className="w-8 h-8 mr-3 text-primary" />
              Admin Panel
            </h1>
            <p className="text-gray-300">
              Manage users, monitor content, and oversee platform operations
            </p>
            {error && (
              <div className="mt-4 bg-red-900/50 border border-red-700 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}
          </div>

          {/* Stats Overview */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-300">Loading admin data...</span>
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600 hover:bg-gray-700 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {stats.users.total}
                  </div>
                  <div className="text-gray-400">Total Users</div>
                  <div className="text-xs text-green-400 mt-1">
                    +{stats.users.newThisMonth} this month
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600 hover:bg-gray-700 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {stats.requests.accepted}
                  </div>
                  <div className="text-gray-400">Active Swaps</div>
                  <div className="text-xs text-yellow-400 mt-1">
                    {stats.requests.pending} pending
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600 hover:bg-gray-700 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <UserCheck className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {stats.users.active}
                  </div>
                  <div className="text-gray-400">Active Users</div>
                  <div className="text-xs text-blue-400 mt-1">
                    {Math.round((stats.users.active / stats.users.total) * 100)}
                    % completion rate
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600 hover:bg-gray-700 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {stats.requests.successRate}%
                  </div>
                  <div className="text-gray-400">Success Rate</div>
                  <div className="text-xs text-green-400 mt-1">
                    {stats.requests.total} total requests
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* Main Content Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-gray-800/50 border border-gray-600">
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-primary"
              >
                <Users className="w-4 h-4 mr-1" />
                Users
              </TabsTrigger>
              <TabsTrigger
                value="skills"
                className="data-[state=active]:bg-primary"
              >
                <BookOpen className="w-4 h-4 mr-1" />
                Skills
              </TabsTrigger>
              <TabsTrigger
                value="swaps"
                className="data-[state=active]:bg-primary"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Swaps
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="data-[state=active]:bg-primary"
              >
                <Send className="w-4 h-4 mr-1" />
                Messages
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-primary"
              >
                <Activity className="w-4 h-4 mr-1" />
                Activity
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="data-[state=active]:bg-primary"
              >
                <Download className="w-4 h-4 mr-1" />
                Reports
              </TabsTrigger>
            </TabsList>

            {/* User Management Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-white">
                      <Users className="w-5 h-5 mr-2" />
                      User Management
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary text-white">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-white flex items-center gap-2">
                              {user.name}
                              {user.role === "admin" && (
                                <Badge className="bg-red-900/50 text-red-300 border-red-600">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-400">
                              {user.email}
                            </div>
                            <div className="text-xs text-gray-500">
                              Joined{" "}
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="secondary"
                            className={
                              user.status === "banned"
                                ? "bg-red-900/50 text-red-300 border-red-600"
                                : user.profileCompleted
                                  ? "bg-green-900/50 text-green-300 border-green-600"
                                  : "bg-yellow-900/50 text-yellow-300 border-yellow-600"
                            }
                          >
                            {user.status === "banned"
                              ? "Banned"
                              : user.profileCompleted
                                ? "Active"
                                : "Incomplete"}
                          </Badge>
                          {user.role !== "admin" && (
                            <Select
                              disabled={actionLoading === user._id}
                              onValueChange={(value) =>
                                handleUserStatusChange(user._id, value)
                              }
                            >
                              <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                                <SelectValue placeholder="Actions" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-700 border-gray-600">
                                <SelectItem value="active">
                                  <div className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                                    Activate
                                  </div>
                                </SelectItem>
                                <SelectItem value="banned">
                                  <div className="flex items-center">
                                    <Ban className="w-4 h-4 mr-2 text-red-400" />
                                    Ban User
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          {actionLoading === user._id && (
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                          className="border-gray-600 text-gray-300"
                        >
                          Previous
                        </Button>
                        <span className="text-gray-400 text-sm">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1),
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="border-gray-600 text-gray-300"
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Activity className="w-5 h-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activity.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 bg-gray-700/50 rounded-lg"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item.type === "user_joined"
                              ? "bg-green-400"
                              : "bg-blue-400"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-white text-sm">
                            {item.description}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {item.status && (
                          <Badge
                            className={
                              item.status === "accepted"
                                ? "bg-green-900/50 text-green-300 border-green-600"
                                : item.status === "pending"
                                  ? "bg-yellow-900/50 text-yellow-300 border-yellow-600"
                                  : "bg-gray-900/50 text-gray-300 border-gray-600"
                            }
                          >
                            {item.status}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Flag className="w-5 h-5 mr-2" />
                    Content Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Flag className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">
                      No Reports
                    </h3>
                    <p className="text-gray-400">
                      No flagged content at this time.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
