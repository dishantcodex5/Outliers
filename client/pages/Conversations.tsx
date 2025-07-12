import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ChatInterface from "@/components/ChatInterface";
import { useAuth } from "@/contexts/AuthContext";
import {
  MessageSquare,
  Search,
  Clock,
  Loader2,
  AlertCircle,
  ArrowRight,
  Plus,
} from "lucide-react";

interface ConversationData {
  id: string;
  otherUser: {
    _id: string;
    name: string;
    email: string;
    profilePhoto: string;
  };
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: string;
  };
  messageCount: number;
  unreadCount: number;
  updatedAt: string;
  swapRequest?: any;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: "text" | "file" | "system";
  status: "sent" | "delivered" | "read";
  fileUrl?: string;
  fileName?: string;
}

export default function Conversations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
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

        const response = await fetch("/api/conversations", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch conversations");
        }

        const data = await response.json();
        setConversations(data.conversations || []);
      } catch (err: any) {
        setError(err.message || "Failed to load conversations");
        console.error("Failed to fetch conversations:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      setMessagesLoading(true);
      const authData = JSON.parse(
        localStorage.getItem("skillswap_auth") || "{}",
      );
      const token = authData.token;

      const response = await fetch(`/api/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data.conversation.messages || []);
    } catch (err: any) {
      setError(err.message || "Failed to load messages");
      console.error("Failed to fetch messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !user) return;

    try {
      const authData = JSON.parse(
        localStorage.getItem("skillswap_auth") || "{}",
      );
      const token = authData.token;

      const response = await fetch(
        `/api/conversations/${selectedConversation}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content,
            type: "text",
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Add the new message to the local state
      setMessages((prev) => [...prev, data.messageData]);

      // Update the conversation's last message in the list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation
            ? {
                ...conv,
                lastMessage: {
                  content,
                  sender: user.id,
                  timestamp: new Date().toISOString(),
                },
              }
            : conv,
        ),
      );
    } catch (err: any) {
      setError(err.message || "Failed to send message");
      console.error("Failed to send message:", err);
    }
  };

  // Open conversation
  const openConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    fetchMessages(conversationId);
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage?.content
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              Sign In Required
            </h3>
            <p className="text-gray-400 mb-6">
              Please sign in to view your conversations.
            </p>
            <Button onClick={() => navigate("/login")}>Sign In</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <MessageSquare className="w-8 h-8 mr-3 text-primary" />
              Conversations
            </h1>
            <p className="text-gray-300">
              Chat with your skill exchange partners
            </p>
            {error && (
              <div className="mt-4 bg-red-900/50 border border-red-700 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}
          </div>

          {/* Search */}
          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600 mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Conversations List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-300">
                Loading conversations...
              </span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">
                {conversations.length === 0
                  ? "No conversations yet"
                  : "No matching conversations"}
              </h3>
              <p className="text-gray-400 mb-6">
                {conversations.length === 0
                  ? "Start exchanging skills to begin conversations with other users."
                  : "Try adjusting your search terms."}
              </p>
              {conversations.length === 0 && (
                <Button onClick={() => navigate("/browse")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Find Skills to Exchange
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConversations.map((conversation) => {
                const isLastMessageFromOther =
                  conversation.lastMessage?.sender !== user.id;

                return (
                  <Card
                    key={conversation.id}
                    className="bg-gray-800/90 backdrop-blur-sm border-gray-600 hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => openConversation(conversation.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage
                                src={conversation.otherUser.profilePhoto}
                                alt={conversation.otherUser.name}
                              />
                              <AvatarFallback className="bg-primary text-white">
                                {conversation.otherUser.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">
                                  {conversation.unreadCount}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-medium truncate">
                                {conversation.otherUser.name}
                              </h3>
                              {conversation.swapRequest && (
                                <Badge className="bg-blue-900/50 text-blue-300 border-blue-600 text-xs">
                                  Skill Exchange
                                </Badge>
                              )}
                            </div>

                            {conversation.lastMessage ? (
                              <>
                                <p
                                  className={`text-sm truncate ${
                                    isLastMessageFromOther &&
                                    conversation.unreadCount > 0
                                      ? "text-white font-medium"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {conversation.lastMessage.sender === user.id
                                    ? "You: "
                                    : ""}
                                  {conversation.lastMessage.content}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(
                                    conversation.lastMessage.timestamp,
                                  ).toLocaleString()}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-gray-400">
                                No messages yet
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-xs text-gray-400">
                              {conversation.messageCount} messages
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(
                                conversation.updatedAt,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat Interface Dialog */}
        {selectedConversation && user && (
          <Dialog
            open={!!selectedConversation}
            onOpenChange={() => setSelectedConversation(null)}
          >
            <DialogContent className="bg-transparent border-none p-0 max-w-4xl max-h-[90vh]">
              <DialogHeader className="sr-only">
                <DialogTitle>Chat Interface</DialogTitle>
              </DialogHeader>
              {messagesLoading ? (
                <div className="bg-gray-800 rounded-lg p-8 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-2 text-gray-300">
                    Loading messages...
                  </span>
                </div>
              ) : (
                (() => {
                  const conversation = conversations.find(
                    (c) => c.id === selectedConversation,
                  );
                  if (!conversation) return null;

                  return (
                    <ChatInterface
                      currentUser={{
                        id: user.id,
                        name: user.name,
                        avatar:
                          user.avatar ||
                          user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase(),
                        profilePhoto: user.profilePhoto,
                        online: true,
                      }}
                      otherUser={{
                        id: conversation.otherUser._id,
                        name: conversation.otherUser.name,
                        avatar: conversation.otherUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase(),
                        profilePhoto: conversation.otherUser.profilePhoto,
                        online: false, // We don't have real-time presence yet
                        lastSeen: "Recently",
                      }}
                      messages={messages}
                      onSendMessage={handleSendMessage}
                      onScheduleSession={() => console.log("Schedule session")}
                    />
                  );
                })()
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}
