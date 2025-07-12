import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import StarBorder from "@/components/ui/StarBorder";
import ChatInterface from "@/components/ChatInterface";
import { useAuth } from "@/contexts/AuthContext";
import {
  MessageSquare,
  Clock,
  Check,
  X,
  Send,
  Calendar,
  User,
  ArrowRight,
  Plus,
  Filter,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Mock data for swap requests
const mockRequests = {
  incoming: [
    {
      id: "1",
      from: {
        name: "Sarah Chen",
        avatar: "SC",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        rating: 4.9,
      },
      skill: {
        offering: "UI/UX Design",
        wanting: "React Development",
      },
      message:
        "Hi! I'd love to learn React from you. I can teach you UI/UX design principles and Figma workflows in return.",
      date: "2024-01-15",
      status: "pending",
      duration: "2 hours per week",
    },
    {
      id: "2",
      from: {
        name: "Mike Johnson",
        avatar: "MJ",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
        rating: 4.7,
      },
      skill: {
        offering: "Digital Marketing",
        wanting: "Node.js",
      },
      message:
        "I'm looking to build a backend for my startup. Can we exchange marketing knowledge for Node.js tutorials?",
      date: "2024-01-14",
      status: "pending",
      duration: "1 hour per session",
    },
  ],
  outgoing: [
    {
      id: "3",
      to: {
        name: "Emma Rodriguez",
        avatar: "ER",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
        rating: 4.8,
      },
      skill: {
        offering: "React Development",
        wanting: "Photography",
      },
      message:
        "Hi Emma! I saw your photography portfolio and would love to learn composition and lighting techniques. I can help you with React in return.",
      date: "2024-01-13",
      status: "pending",
      duration: "90 minutes per session",
    },
    {
      id: "4",
      to: {
        name: "David Kim",
        avatar: "DK",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        rating: 4.6,
      },
      skill: {
        offering: "JavaScript",
        wanting: "Korean Language",
      },
      message:
        "안녕하세요! I'd like to learn Korean and can teach JavaScript in exchange.",
      date: "2024-01-12",
      status: "accepted",
      duration: "2 hours per week",
    },
  ],
  scheduled: [
    {
      id: "5",
      partner: {
        name: "Lisa Wang",
        avatar: "LW",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
        rating: 4.9,
      },
      skill: {
        teaching: "Node.js",
        learning: "Mandarin Chinese",
      },
      nextSession: "2024-01-20T15:00:00Z",
      status: "active",
      sessionsCompleted: 3,
      totalSessions: 8,
    },
  ],
};

export default function Requests() {
  const [requests, setRequests] = useState(mockRequests);

  const handleAcceptRequest = (requestId: string) => {
    // Mock accept logic
    console.log("Accepting request:", requestId);
  };

  const handleRejectRequest = (requestId: string) => {
    // Mock reject logic
    console.log("Rejecting request:", requestId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-900/50 text-yellow-300 border-yellow-600";
      case "accepted":
        return "bg-green-900/50 text-green-300 border-green-600";
      case "rejected":
        return "bg-red-900/50 text-red-300 border-red-600";
      case "active":
        return "bg-blue-900/50 text-blue-300 border-blue-600";
      default:
        return "bg-gray-900/50 text-gray-300 border-gray-600";
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Swap Requests
            </h1>
            <p className="text-gray-300">
              Manage your skill exchange requests and active sessions
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {
                    requests.incoming.filter((r) => r.status === "pending")
                      .length
                  }
                </div>
                <p className="text-sm text-gray-400">Pending Incoming</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {
                    requests.outgoing.filter((r) => r.status === "pending")
                      .length
                  }
                </div>
                <p className="text-sm text-gray-400">Pending Outgoing</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {requests.scheduled.length}
                </div>
                <p className="text-sm text-gray-400">Active Sessions</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
              <CardContent className="p-4 text-center">
                <StarBorder color="#60a5fa" speed="4s" className="h-full">
                  <Plus className="w-4 h-4 mr-2" />
                  New Request
                </StarBorder>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="incoming" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-600">
              <TabsTrigger
                value="incoming"
                className="data-[state=active]:bg-primary"
              >
                Incoming ({requests.incoming.length})
              </TabsTrigger>
              <TabsTrigger
                value="outgoing"
                className="data-[state=active]:bg-primary"
              >
                Outgoing ({requests.outgoing.length})
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="data-[state=active]:bg-primary"
              >
                Active Sessions ({requests.scheduled.length})
              </TabsTrigger>
            </TabsList>

            {/* Incoming Requests */}
            <TabsContent value="incoming" className="space-y-4">
              {requests.incoming.map((request) => (
                <Card
                  key={request.id}
                  className="bg-gray-800/90 backdrop-blur-sm border-gray-600"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarImage
                            src={request.from.profilePicture}
                            alt={request.from.name}
                          />
                          <AvatarFallback className="bg-primary text-white">
                            {request.from.avatar}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {request.from.name}
                            </h3>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </div>

                          <div className="mb-3">
                            <div className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                              <span className="text-green-400">Offering:</span>
                              <span>{request.skill.offering}</span>
                              <ArrowRight className="w-4 h-4" />
                              <span className="text-blue-400">Wants:</span>
                              <span>{request.skill.wanting}</span>
                            </div>
                            <div className="text-sm text-gray-400">
                              Duration: {request.duration}
                            </div>
                          </div>

                          <p className="text-gray-300 mb-4">
                            {request.message}
                          </p>

                          <div className="text-sm text-gray-400">
                            Requested on{" "}
                            {new Date(request.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {request.status === "pending" && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectRequest(request.id)}
                            className="border-red-600 text-red-400 hover:bg-red-900/50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(request.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Outgoing Requests */}
            <TabsContent value="outgoing" className="space-y-4">
              {requests.outgoing.map((request) => (
                <Card
                  key={request.id}
                  className="bg-gray-800/90 backdrop-blur-sm border-gray-600"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={request.to.profilePicture}
                          alt={request.to.name}
                        />
                        <AvatarFallback className="bg-primary text-white">
                          {request.to.avatar}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {request.to.name}
                          </h3>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>

                        <div className="mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                            <span className="text-green-400">Your Offer:</span>
                            <span>{request.skill.offering}</span>
                            <ArrowRight className="w-4 h-4" />
                            <span className="text-blue-400">You Want:</span>
                            <span>{request.skill.wanting}</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            Duration: {request.duration}
                          </div>
                        </div>

                        <p className="text-gray-300 mb-4">{request.message}</p>

                        <div className="text-sm text-gray-400">
                          Sent on {new Date(request.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Active Sessions */}
            <TabsContent value="active" className="space-y-4">
              {requests.scheduled.map((session) => (
                <Card
                  key={session.id}
                  className="bg-gray-800/90 backdrop-blur-sm border-gray-600"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarImage
                            src={session.partner.profilePicture}
                            alt={session.partner.name}
                          />
                          <AvatarFallback className="bg-primary text-white">
                            {session.partner.avatar}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {session.partner.name}
                            </h3>
                            <Badge className={getStatusColor(session.status)}>
                              Active Exchange
                            </Badge>
                          </div>

                          <div className="mb-3">
                            <div className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                              <span className="text-green-400">Teaching:</span>
                              <span>{session.skill.teaching}</span>
                              <ArrowRight className="w-4 h-4" />
                              <span className="text-blue-400">Learning:</span>
                              <span>{session.skill.learning}</span>
                            </div>
                            <div className="text-sm text-gray-400">
                              Progress: {session.sessionsCompleted}/
                              {session.totalSessions} sessions completed
                            </div>
                          </div>

                          <div className="text-sm text-gray-300 mb-4">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Next session:{" "}
                            {new Date(session.nextSession).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/80"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
