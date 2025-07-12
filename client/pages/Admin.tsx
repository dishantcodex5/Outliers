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
import { Textarea } from "@/components/ui/textarea";
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

        // Fetch core admin data first
        const corePromises = [
          fetch("/api/admin/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/admin/users?page=${currentPage}&search=${searchTerm}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/admin/activity", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ];

        const [statsRes, usersRes, activityRes] =
          await Promise.all(corePromises);

        // Check if we got HTML responses (indicating API routing issues)
        const statsText = await statsRes.text();
        const usersText = await usersRes.text();
        const activityText = await activityRes.text();

        if (
          statsText.startsWith("<!DOCTYPE") ||
          usersText.startsWith("<!DOCTYPE") ||
          activityText.startsWith("<!DOCTYPE")
        ) {
          throw new Error(
            "Admin API endpoints not found. Please check server configuration.",
          );
        }

        if (!statsRes.ok || !usersRes.ok || !activityRes.ok) {
          throw new Error(
            `Failed to fetch admin data: ${statsRes.status}, ${usersRes.status}, ${activityRes.status}`,
          );
        }

        // Parse core data
        const statsData = JSON.parse(statsText);
        const usersData = JSON.parse(usersText);
        const activityData = JSON.parse(activityText);

        setStats(statsData);
        setUsers(usersData.users || []);
        setTotalPages(usersData.pagination?.pages || 1);
        setActivity(activityData.activity || []);

        // Fetch optional data with error handling
        try {
          const skillsRes = await fetch("/api/admin/skills/pending", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (skillsRes.ok) {
            const skillsText = await skillsRes.text();
            if (!skillsText.startsWith("<!DOCTYPE")) {
              const skillsData = JSON.parse(skillsText);
              setSkillSubmissions(skillsData.skills || []);
            }
          }
        } catch (error) {
          console.warn("Skills endpoint not available:", error);
          setSkillSubmissions([]);
        }

        try {
          const swapsRes = await fetch("/api/admin/swaps", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (swapsRes.ok) {
            const swapsText = await swapsRes.text();
            if (!swapsText.startsWith("<!DOCTYPE")) {
              const swapsData = JSON.parse(swapsText);
              setSwapRequests(swapsData.swaps || []);
            }
          }
        } catch (error) {
          console.warn("Swaps endpoint not available:", error);
          setSwapRequests([]);
        }
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

  const handleSkillAction = async (
    skillId: string,
    action: "approve" | "reject",
  ) => {
    try {
      setActionLoading(skillId);
      const authData = JSON.parse(
        localStorage.getItem("skillswap_auth") || "{}",
      );
      const token = authData.token;

      const response = await fetch(`/api/admin/skills/${skillId}/${action}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const responseText = await response.text();
      if (responseText.startsWith("<!DOCTYPE")) {
        throw new Error(`Admin skills API endpoint not found`);
      }

      if (!response.ok) {
        throw new Error(`Failed to ${action} skill: ${response.status}`);
      }

      // Remove from pending list
      setSkillSubmissions(
        skillSubmissions.filter((skill) => skill._id !== skillId),
      );
    } catch (err: any) {
      setError(err.message || `Failed to ${action} skill`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendMessage = async () => {
    try {
      setActionLoading("message");
      const authData = JSON.parse(
        localStorage.getItem("skillswap_auth") || "{}",
      );
      const token = authData.token;

      const response = await fetch("/api/admin/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messageForm),
      });

      const responseText = await response.text();
      if (responseText.startsWith("<!DOCTYPE")) {
        throw new Error("Admin messages API endpoint not found");
      }

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const result = JSON.parse(responseText);

      // Clear any previous errors and show success
      setError(null);
      console.log("✅ Message sent successfully:", result.details || result);

      setShowMessageForm(false);
      setMessageForm({
        title: "",
        content: "",
        type: "announcement",
        priority: "medium",
        targetUsers: "all",
      });
    } catch (err: any) {
      setError(err.message || "Failed to send message");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadReport = async (reportType: string) => {
    try {
      setActionLoading(reportType);
      const authData = JSON.parse(
        localStorage.getItem("skillswap_auth") || "{}",
      );
      const token = authData.token;

      const response = await fetch(`/api/admin/reports/${reportType}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}-report-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Failed to download report");
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
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
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-gray-800/50 border border-gray-600">
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-primary text-xs sm:text-sm"
              >
                <Users className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger
                value="skills"
                className="data-[state=active]:bg-primary text-xs sm:text-sm"
              >
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                <span className="hidden sm:inline">Skills</span>
              </TabsTrigger>
              <TabsTrigger
                value="swaps"
                className="data-[state=active]:bg-primary text-xs sm:text-sm"
              >
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                <span className="hidden sm:inline">Swaps</span>
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="data-[state=active]:bg-primary text-xs sm:text-sm col-span-3 md:col-span-1"
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                <span className="hidden sm:inline">Messages</span>
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-primary text-xs sm:text-sm col-span-1.5 md:col-span-1"
              >
                <Activity className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="data-[state=active]:bg-primary text-xs sm:text-sm col-span-1.5 md:col-span-1"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                <span className="hidden sm:inline">Reports</span>
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

            {/* Skills Management Tab */}
            <TabsContent value="skills" className="space-y-6">
              <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Pending Skills Approval
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {skillSubmissions.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-white mb-2">
                        No Pending Skills
                      </h3>
                      <p className="text-gray-400">
                        All skills have been reviewed.
                      </p>
                    </div>
                  ) : (
                    skillSubmissions.map((skill) => (
                      <div
                        key={skill._id}
                        className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-white font-medium">
                              {skill.skill}
                            </h4>
                            <Badge className="bg-yellow-900/50 text-yellow-300 border-yellow-600">
                              Pending Review
                            </Badge>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">
                            {skill.description}
                          </p>
                          <p className="text-gray-400 text-xs">
                            Submitted by: {skill.user.name} ({skill.user.email})
                          </p>
                          <p className="text-gray-500 text-xs">
                            {new Date(skill.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-600 text-green-300 hover:bg-green-700"
                            onClick={() =>
                              handleSkillAction(skill._id, "approve")
                            }
                            disabled={actionLoading === skill._id}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-300 hover:bg-red-700"
                            onClick={() =>
                              handleSkillAction(skill._id, "reject")
                            }
                            disabled={actionLoading === skill._id}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Swaps Management Tab */}
            <TabsContent value="swaps" className="space-y-6">
              <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Skill Exchange Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {swapRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-white mb-2">
                        No Swap Requests
                      </h3>
                      <p className="text-gray-400">
                        No skill exchange requests to monitor.
                      </p>
                    </div>
                  ) : (
                    swapRequests.map((swap) => (
                      <div
                        key={swap._id}
                        className="p-4 bg-gray-700/50 rounded-lg border border-gray-600"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-medium">
                              {swap.from.name} → {swap.to.name}
                            </h4>
                            <Badge
                              className={
                                swap.status === "pending"
                                  ? "bg-yellow-900/50 text-yellow-300 border-yellow-600"
                                  : swap.status === "accepted"
                                    ? "bg-green-900/50 text-green-300 border-green-600"
                                    : "bg-red-900/50 text-red-300 border-red-600"
                              }
                            >
                              {swap.status.charAt(0).toUpperCase() +
                                swap.status.slice(1)}
                            </Badge>
                          </div>
                          <span className="text-gray-400 text-sm">
                            {new Date(swap.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Offering:</p>
                            <p className="text-white">{swap.offeredSkill}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Requesting:</p>
                            <p className="text-white">{swap.requestedSkill}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Platform Messages Tab */}
            <TabsContent value="messages" className="space-y-6">
              <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-white">
                      <Send className="w-5 h-5 mr-2" />
                      Platform Messages
                    </CardTitle>
                    <Button
                      onClick={() => setShowMessageForm(true)}
                      className="bg-primary hover:bg-primary/80"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Message
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {showMessageForm ? (
                    <div className="space-y-4 p-4 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-medium">
                          Send Platform Message
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowMessageForm(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Title
                          </label>
                          <Input
                            value={messageForm.title}
                            onChange={(e) =>
                              setMessageForm({
                                ...messageForm,
                                title: e.target.value,
                              })
                            }
                            placeholder="Message title"
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Type
                          </label>
                          <Select
                            value={messageForm.type}
                            onValueChange={(value: any) =>
                              setMessageForm({ ...messageForm, type: value })
                            }
                          >
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              <SelectItem value="announcement">
                                Announcement
                              </SelectItem>
                              <SelectItem value="maintenance">
                                Maintenance
                              </SelectItem>
                              <SelectItem value="feature">
                                Feature Update
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Priority
                          </label>
                          <Select
                            value={messageForm.priority}
                            onValueChange={(value: any) =>
                              setMessageForm({
                                ...messageForm,
                                priority: value,
                              })
                            }
                          >
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Target Users
                          </label>
                          <Select
                            value={messageForm.targetUsers}
                            onValueChange={(value: any) =>
                              setMessageForm({
                                ...messageForm,
                                targetUsers: value,
                              })
                            }
                          >
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              <SelectItem value="all">All Users</SelectItem>
                              <SelectItem value="active">
                                Active Users
                              </SelectItem>
                              <SelectItem value="inactive">
                                Inactive Users
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Message Content
                        </label>
                        <textarea
                          value={messageForm.content}
                          onChange={(e) =>
                            setMessageForm({
                              ...messageForm,
                              content: e.target.value,
                            })
                          }
                          placeholder="Enter your message..."
                          rows={4}
                          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowMessageForm(false)}
                          className="border-gray-600 text-gray-300"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSendMessage}
                          disabled={
                            !messageForm.title ||
                            !messageForm.content ||
                            actionLoading === "message"
                          }
                          className="bg-primary hover:bg-primary/80"
                        >
                          {actionLoading === "message" ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          Send Message
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Send className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-white mb-2">
                        Platform Messaging
                      </h3>
                      <p className="text-gray-400 mb-4">
                        Send announcements, feature updates, or maintenance
                        alerts to users.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Updated Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Download className="w-5 h-5 mr-2" />
                    Download Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                      <FileText className="w-8 h-8 text-blue-400 mb-3" />
                      <h3 className="text-white font-medium mb-2">
                        User Activity Report
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Complete user activity, registrations, and engagement
                        metrics.
                      </p>
                      <Button
                        onClick={() => handleDownloadReport("user-activity")}
                        disabled={actionLoading === "user-activity"}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {actionLoading === "user-activity" ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        Download CSV
                      </Button>
                    </div>

                    <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                      <FileText className="w-8 h-8 text-green-400 mb-3" />
                      <h3 className="text-white font-medium mb-2">
                        Swap Statistics
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Skill exchange data, success rates, and completion
                        metrics.
                      </p>
                      <Button
                        onClick={() => handleDownloadReport("swap-stats")}
                        disabled={actionLoading === "swap-stats"}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading === "swap-stats" ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        Download CSV
                      </Button>
                    </div>

                    <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                      <FileText className="w-8 h-8 text-purple-400 mb-3" />
                      <h3 className="text-white font-medium mb-2">
                        Feedback Logs
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        User feedback, ratings, and platform improvement
                        suggestions.
                      </p>
                      <Button
                        onClick={() => handleDownloadReport("feedback-logs")}
                        disabled={actionLoading === "feedback-logs"}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        {actionLoading === "feedback-logs" ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        Download CSV
                      </Button>
                    </div>
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
