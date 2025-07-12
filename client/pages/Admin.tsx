import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StarBorder from "@/components/ui/StarBorder";
import { Shield, Users, Flag, MessageSquare, BarChart3 } from "lucide-react";

export default function Admin() {
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
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600 hover:bg-gray-700 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">1,247</div>
                <div className="text-gray-400">Total Users</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600 hover:bg-gray-700 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <MessageSquare className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">2,834</div>
                <div className="text-gray-400">Active Swaps</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600 hover:bg-gray-700 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Flag className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-gray-400">Flagged Content</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600 hover:bg-gray-700 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">94.2%</div>
                <div className="text-gray-400">Success Rate</div>
              </CardContent>
            </Card>
          </div>

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
