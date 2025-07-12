import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Calendar,
  CheckCheck,
  Clock,
  X,
} from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: "text" | "file" | "system";
  status: "sent" | "delivered" | "read";
}

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  profilePhoto?: string;
  online: boolean;
  lastSeen?: string;
}

interface ChatInterfaceProps {
  currentUser: ChatUser;
  otherUser: ChatUser;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onScheduleSession?: () => void;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
}

export default function ChatInterface({
  currentUser,
  otherUser,
  messages,
  onSendMessage,
  onScheduleSession,
  onVideoCall,
  onVoiceCall,
}: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach((message) => {
      const date = formatDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const getMessageStatus = (status: string) => {
    switch (status) {
      case "sent":
        return <Clock className="w-3 h-3 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-400" />;
      default:
        return null;
    }
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600 h-[600px] flex flex-col">
      {/* Chat Header */}
      <CardHeader className="pb-4 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={otherUser.profilePhoto}
                  alt={otherUser.name}
                />
                <AvatarFallback className="bg-primary text-white">
                  {otherUser.avatar}
                </AvatarFallback>
              </Avatar>
              {otherUser.online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800"></div>
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold">{otherUser.name}</h3>
              <p className="text-sm text-gray-400">
                {otherUser.online
                  ? "Online"
                  : `Last seen ${otherUser.lastSeen || "recently"}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onVoiceCall && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onVoiceCall}
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <Phone className="w-4 h-4" />
              </Button>
            )}
            {onVideoCall && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onVideoCall}
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <Video className="w-4 h-4" />
              </Button>
            )}
            {onScheduleSession && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onScheduleSession}
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <Calendar className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedMessages).map(([date, dayMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
                {date}
              </div>
            </div>

            {/* Messages for this date */}
            {dayMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === currentUser.id
                    ? "justify-end"
                    : "justify-start"
                } mb-2`}
              >
                <div
                  className={`max-w-[70%] ${
                    message.senderId === currentUser.id
                      ? "bg-primary text-white rounded-l-2xl rounded-tr-2xl"
                      : "bg-gray-700 text-white rounded-r-2xl rounded-tl-2xl"
                  } px-4 py-2 shadow-sm`}
                >
                  {message.type === "system" ? (
                    <div className="text-center text-sm text-gray-400 italic">
                      {message.content}
                    </div>
                  ) : (
                    <>
                      <p className="text-sm">{message.content}</p>
                      <div
                        className={`flex items-center mt-1 space-x-1 ${
                          message.senderId === currentUser.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <span className="text-xs opacity-70">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.senderId === currentUser.id &&
                          getMessageStatus(message.status)}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-white rounded-r-2xl rounded-tl-2xl px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* Message Input */}
      <div className="border-t border-gray-600 p-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary pr-10"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-primary hover:bg-primary/80"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
