import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";

interface SwapRequest {
  _id: string;
  from: {
    _id: string;
    name: string;
    email: string;
    profilePhoto: string;
  };
  to: {
    _id: string;
    name: string;
    email: string;
    profilePhoto: string;
  };
  skillOffered: string;
  skillWanted: string;
  message: string;
  duration: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

interface RequestsData {
  incoming: SwapRequest[];
  outgoing: SwapRequest[];
  all: SwapRequest[];
}

export default function Requests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestsData>({
    incoming: [],
    outgoing: [],
    all: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState<string | null>(null);
  const [acceptMessage, setAcceptMessage] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch requests from API
  useEffect(() => {
    const fetchRequests = async () => {
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

        const response = await fetch("/api/requests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch requests");
        }

        const data = await response.json();
        setRequests(data.requests);
      } catch (err: any) {
        setError(err.message || "Failed to load requests");
        console.error("Failed to fetch requests:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  const handleAcceptRequest = async (requestId: string) => {
    setIsProcessing(true);
    try {
      const authData = JSON.parse(
        localStorage.getItem("skillswap_auth") || "{}",
      );
      const token = authData.token;

      const response = await fetch(`/api/requests/${requestId}/accept`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ welcomeMessage: acceptMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept request");
      }

      const data = await response.json();

      // Update local state
      setRequests((prev) => ({
        ...prev,
        incoming: prev.incoming.map((req) =>
          req._id === requestId ? { ...req, status: "accepted" as const } : req,
        ),
      }));

      setShowAcceptDialog(null);
      setAcceptMessage("");
      console.log("Request accepted successfully");
    } catch (error: any) {
      setError(error.message || "Failed to accept request");
      console.error("Failed to accept request:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setIsProcessing(true);
    try {
      const authData = JSON.parse(
        localStorage.getItem("skillswap_auth") || "{}",
      );
      const token = authData.token;

      const response = await fetch(`/api/requests/${requestId}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject request");
      }

      // Update local state
      setRequests((prev) => ({
        ...prev,
        incoming: prev.incoming.map((req) =>
          req._id === requestId ? { ...req, status: "rejected" as const } : req,
        ),
      }));

      setShowRejectDialog(null);
      setRejectReason("");
      console.log("Request rejected successfully");
    } catch (error: any) {
      setError(error.message || "Failed to reject request");
      console.error("Failed to reject request:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = (content: string) => {
    // Mock sending message
    console.log("Sending message:", content);
  };

  const handleScheduleSession = () => {
    // Mock scheduling session
    console.log("Scheduling session");
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
                            onClick={() => setShowRejectDialog(request.id)}
                            className="border-red-600 text-red-400 hover:bg-red-900/50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setShowAcceptDialog(request.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                        </div>
                      )}

                      {request.status === "accepted" && (
                        <div className="flex space-x-2">
                          <Badge className="bg-green-900/50 text-green-300 border-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Accepted
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => setSelectedChat(request.id)}
                            className="bg-primary hover:bg-primary/80"
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Chat
                          </Button>
                        </div>
                      )}

                      {request.status === "rejected" && (
                        <Badge className="bg-red-900/50 text-red-300 border-red-600">
                          <XCircle className="w-3 h-3 mr-1" />
                          Declined
                        </Badge>
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

        {/* Accept Request Dialog */}
        <Dialog
          open={!!showAcceptDialog}
          onOpenChange={() => setShowAcceptDialog(null)}
        >
          <DialogContent className="bg-gray-800 border-gray-600 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Accept Skill Exchange Request
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-300">
                You're about to accept this skill exchange request. You can add
                a welcome message to start the conversation.
              </p>

              <div className="space-y-2">
                <Label htmlFor="accept-message" className="text-gray-200">
                  Welcome Message (Optional)
                </Label>
                <Textarea
                  id="accept-message"
                  value={acceptMessage}
                  onChange={(e) => setAcceptMessage(e.target.value)}
                  placeholder="Hi! I'm excited to help you learn React. When would be a good time to start?"
                  className="bg-gray-700 border-gray-600 text-white resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAcceptDialog(null)}
                  className="flex-1 border-gray-600 text-gray-300"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    showAcceptDialog && handleAcceptRequest(showAcceptDialog)
                  }
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Accepting..." : "Accept Request"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reject Request Dialog */}
        <Dialog
          open={!!showRejectDialog}
          onOpenChange={() => setShowRejectDialog(null)}
        >
          <DialogContent className="bg-gray-800 border-gray-600 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                Decline Skill Exchange Request
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-300">
                You're about to decline this skill exchange request. You can
                optionally provide a reason.
              </p>

              <div className="space-y-2">
                <Label htmlFor="reject-reason" className="text-gray-200">
                  Reason (Optional)
                </Label>
                <Textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Sorry, I'm not available for new exchanges at the moment..."
                  className="bg-gray-700 border-gray-600 text-white resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(null)}
                  className="flex-1 border-gray-600 text-gray-300"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    showRejectDialog && handleRejectRequest(showRejectDialog)
                  }
                  variant="destructive"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Declining..." : "Decline Request"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Chat Interface */}
        {selectedChat && user && (
          <Dialog
            open={!!selectedChat}
            onOpenChange={() => setSelectedChat(null)}
          >
            <DialogContent className="bg-transparent border-none p-0 max-w-4xl">
              <DialogHeader className="sr-only">
                <DialogTitle>Chat with Exchange Partner</DialogTitle>
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
                      "Hi! I'd love to learn React from you. I can teach you UI/UX design principles and Figma workflows in return.",
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
                      "Great! I'm excited to help you learn React. When would be a good time to start our first session?",
                    timestamp: new Date(
                      Date.now() - 1 * 60 * 60 * 1000,
                    ).toISOString(),
                    type: "text",
                    status: "read",
                  },
                  {
                    id: "3",
                    senderId: "other-user",
                    content:
                      "How about this Saturday at 2 PM? We could start with React fundamentals and I can show you some design patterns afterward.",
                    timestamp: new Date(
                      Date.now() - 30 * 60 * 1000,
                    ).toISOString(),
                    type: "text",
                    status: "read",
                  },
                ]}
                onSendMessage={handleSendMessage}
                onScheduleSession={handleScheduleSession}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}
