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

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

        // Fetch stats, users, and activity in parallel
        const [statsRes, usersRes, activityRes] = await Promise.all([
          fetch("/api/admin/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/admin/users?page=${currentPage}&search=${searchTerm}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/admin/activity", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!statsRes.ok || !usersRes.ok || !activityRes.ok) {
          throw new Error("Failed to fetch admin data");
        }

        const [statsData, usersData, activityData] = await Promise.all([
          statsRes.json(),
          usersRes.json(),
          activityRes.json(),
        ]);

        setStats(statsData);
        setUsers(usersData.users);
        setTotalPages(usersData.pagination.pages);
        setActivity(activityData.activity);
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

          {/* Management Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Management */}
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Users className="w-5 h-5 mr-2" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div>
                      <div className="font-medium text-white">
                        Alex Thompson
                      </div>
                      <div className="text-sm text-gray-400">
                        alex@example.com
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className="bg-green-800 text-green-200"
                      >
                        Active
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        Actions
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div>
                      <div className="font-medium text-white">
                        Sarah Martinez
                      </div>
                      <div className="text-sm text-gray-400">
                        sarah@example.com
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className="bg-green-800 text-green-200"
                      >
                        Active
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        Actions
                      </Button>
                    </div>
                  </div>
                  <StarBorder className="w-full" color="#a855f7" speed="6s">
                    View All Users
                  </StarBorder>
                </div>
              </CardContent>
            </Card>

            {/* Content Moderation */}
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Flag className="w-5 h-5 mr-2" />
                  Content Moderation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-900/30 border border-red-700 rounded-lg">
                    <div>
                      <div className="font-medium text-red-200">
                        Inappropriate Skill Description
                      </div>
                      <div className="text-sm text-red-300">
                        Reported by user #1247
                      </div>
                    </div>
                    <Button size="sm" variant="destructive">
                      Review
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                    <div>
                      <div className="font-medium text-yellow-200">
                        Spam Profile Content
                      </div>
                      <div className="text-sm text-yellow-300">
                        Auto-flagged content
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      Review
                    </Button>
                  </div>
                  <StarBorder className="w-full" color="#f59e0b" speed="5s">
                    View All Reports
                  </StarBorder>
                </div>
              </CardContent>
            </Card>

            {/* Platform Messages */}
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Platform Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                    <div className="font-medium text-blue-200 mb-2">
                      System Maintenance Notice
                    </div>
                    <div className="text-sm text-blue-300 mb-3">
                      Scheduled maintenance on Dec 15th from 2-4 AM PST
                    </div>
                    <Button size="sm" className="bg-blue-700 hover:bg-blue-600">
                      Edit Message
                    </Button>
                  </div>
                  <StarBorder className="w-full" color="#3b82f6" speed="4s">
                    Send New Message
                  </StarBorder>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Ban User
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Flag Content
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
