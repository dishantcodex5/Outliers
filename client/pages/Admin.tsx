import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Flag, MessageSquare, BarChart3 } from "lucide-react";

export default function Admin() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Shield className="w-8 h-8 mr-3 text-primary" />
              Admin Panel
            </h1>
            <p className="text-gray-600">
              Manage users, monitor content, and oversee platform operations
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">1,247</div>
                <div className="text-gray-600">Total Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">2,834</div>
                <div className="text-gray-600">Active Swaps</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Flag className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">12</div>
                <div className="text-gray-600">Flagged Content</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">94.2%</div>
                <div className="text-gray-600">Success Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Management Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Alex Thompson</div>
                      <div className="text-sm text-gray-600">
                        alex@example.com
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Active</Badge>
                      <Button size="sm" variant="outline">
                        Actions
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Sarah Martinez</div>
                      <div className="text-sm text-gray-600">
                        sarah@example.com
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Active</Badge>
                      <Button size="sm" variant="outline">
                        Actions
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full">View All Users</Button>
                </div>
              </CardContent>
            </Card>

            {/* Content Moderation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Flag className="w-5 h-5 mr-2" />
                  Content Moderation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-medium text-red-800">
                        Inappropriate Skill Description
                      </div>
                      <div className="text-sm text-red-600">
                        Reported by user #1247
                      </div>
                    </div>
                    <Button size="sm" variant="destructive">
                      Review
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <div className="font-medium text-yellow-800">
                        Spam Profile Content
                      </div>
                      <div className="text-sm text-yellow-600">
                        Auto-flagged content
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                  <Button className="w-full">View All Reports</Button>
                </div>
              </CardContent>
            </Card>

            {/* Platform Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Platform Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-800 mb-2">
                      System Maintenance Notice
                    </div>
                    <div className="text-sm text-blue-600 mb-3">
                      Scheduled maintenance on Dec 15th from 2-4 AM PST
                    </div>
                    <Button size="sm">Edit Message</Button>
                  </div>
                  <Button className="w-full">Send New Message</Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Ban User
                  </Button>
                  <Button variant="outline">
                    <Flag className="w-4 h-4 mr-2" />
                    Flag Content
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline">
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
