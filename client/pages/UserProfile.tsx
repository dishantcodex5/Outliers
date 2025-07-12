import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  User,
  Star,
  Clock,
  MapPin,
  Mail,
  Calendar,
  TrendingUp,
  Heart,
  Eye,
  EyeOff,
  MessageSquare,
  Send,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface UserData {
  _id: string;
  name: string;
  email: string;
  location: string;
  profilePhoto: string;
  skillsOffered: Array<{
    skill: string;
    description: string;
    isApproved: boolean;
  }>;
  skillsWanted: Array<{ skill: string; description: string }>;
  availability: {
    weekdays: boolean;
    weekends: boolean;
    mornings: boolean;
    afternoons: boolean;
    evenings: boolean;
  };
  isPublic: boolean;
  profileCompleted: boolean;
  createdAt: string;
}

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestForm, setRequestForm] = useState({
    skillOffered: "",
    skillWanted: "",
    message: "",
    duration: "1 hour",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async (retryCount = 0) => {
      if (!userId) return;

      try {
        setIsLoading(true);
        setError(null); // Clear previous errors

        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(`/api/users/${userId}`, {
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("User not found");
          } else if (response.status >= 500) {
            throw new Error("Server error. Please try again later.");
          } else {
            throw new Error(
              `Failed to fetch user profile (${response.status})`,
            );
          }
        }

        const data = await response.json();
        setUserData(data.user);
        setError(null); // Clear error on success
      } catch (err: any) {
        console.error("Failed to fetch user profile:", err);

        // Handle different types of errors
        if (err.name === "AbortError") {
          setError(
            "Request timed out. Please check your connection and try again.",
          );
        } else if (err.message === "Failed to fetch") {
          // Network error - maybe retry
          if (retryCount < 2) {
            console.log(`Retrying fetch (attempt ${retryCount + 1})`);
            setTimeout(
              () => fetchUserProfile(retryCount + 1),
              1000 * (retryCount + 1),
            );
            return;
          }
          setError(
            "Unable to connect to server. Please check your internet connection and try again.",
          );
        } else {
          setError(err.message || "Failed to load user profile");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleSendRequest = async () => {
    if (!currentUser || !userData) return;

    try {
      setIsSubmitting(true);
      setRequestError(null); // Clear any previous request errors

      // Frontend validation before sending
      if (!requestForm.skillOffered) {
        setRequestError("Please select a skill you can teach");
        return;
      }

      if (!requestForm.skillWanted) {
        setRequestError("Please select a skill you want to learn");
        return;
      }

      if (!requestForm.message || requestForm.message.trim().length < 10) {
        setRequestError("Please provide a message with at least 10 characters");
        return;
      }

      // Check if currentUser has the skill they're offering
      const hasOfferedSkill = currentUser.skillsOffered?.some(
        (skill) => skill.skill === requestForm.skillOffered,
      );
      if (!hasOfferedSkill) {
        setRequestError("You don't have the skill you selected to offer");
        return;
      }

      // Check if target user has the skill being requested
      const hasWantedSkill = userData.skillsOffered.some(
        (skill) => skill.skill === requestForm.skillWanted,
      );
      if (!hasWantedSkill) {
        setRequestError("This user doesn't offer the skill you selected");
        return;
      }

      const authData = JSON.parse(
        localStorage.getItem("skillswap_auth") || "{}",
      );
      const token = authData.token;

      if (!token) {
        setRequestError("Please log in to send requests");
        return;
      }

      const requestData = {
        to: userData._id,
        skillOffered: requestForm.skillOffered,
        skillWanted: requestForm.skillWanted,
        message: requestForm.message.trim(),
        duration: requestForm.duration,
      };

      console.log("Sending request data:", requestData);

      // Add timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = "Failed to send request";

        // Handle different status codes
        if (response.status === 400) {
          errorMessage = "Invalid request data. Please check your selections.";
        } else if (response.status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
        } else if (response.status === 403) {
          errorMessage = "You don't have permission to send this request.";
        } else if (response.status === 429) {
          errorMessage =
            "Too many requests. Please wait a moment and try again.";
        } else if (response.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }

        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (jsonError) {
          // If we can't parse the error response as JSON, keep our default message
          console.warn("Could not parse error response as JSON:", jsonError);
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Request sent successfully:", result);

      setShowRequestDialog(false);
      setRequestForm({
        skillOffered: "",
        skillWanted: "",
        message: "",
        duration: "1 hour",
      });
      setRequestError(null);

      // Show success message (would be a toast in real app)
      alert("Request sent successfully!");
    } catch (err: any) {
      console.error("Failed to send request:", err);

      // Handle different types of errors
      if (err.name === "AbortError") {
        setRequestError("Request timed out. Please try again.");
      } else if (err.message === "Failed to fetch") {
        setRequestError(
          "Unable to connect to server. Please check your internet connection and try again.",
        );
      } else {
        setRequestError(
          err.message || "Failed to send request. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailabilityText = () => {
    if (!userData) return "";

    const times = [];
    const days = [];

    if (userData.availability.weekdays) days.push("Weekdays");
    if (userData.availability.weekends) days.push("Weekends");
    if (userData.availability.mornings) times.push("Mornings");
    if (userData.availability.afternoons) times.push("Afternoons");
    if (userData.availability.evenings) times.push("Evenings");

    const dayText = days.length > 0 ? days.join(", ") : "No days set";
    const timeText = times.length > 0 ? times.join(", ") : "No times set";

    return `${dayText} - ${timeText}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Loading user profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !userData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              {error?.includes("connect") ||
              error?.includes("fetch") ||
              error?.includes("timed out")
                ? "Connection Error"
                : "Profile Not Found"}
            </h3>
            <p className="text-gray-400 mb-6">
              {error || "This user profile could not be found."}
            </p>
            <div className="flex gap-3 justify-center">
              {(error?.includes("connect") ||
                error?.includes("fetch") ||
                error?.includes("timed out")) && (
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-primary hover:bg-primary/80"
                >
                  Try Again
                </Button>
              )}
              <Button onClick={() => navigate("/browse")} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Browse
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Don't show private profiles
  if (!userData.isPublic) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <EyeOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              Private Profile
            </h3>
            <p className="text-gray-400 mb-6">
              This user has a private profile.
            </p>
            <Button onClick={() => navigate("/browse")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Button
            onClick={() => navigate("/browse")}
            variant="outline"
            className="mb-6 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Button>

          {/* Profile Header Card */}
          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600 shadow-2xl mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-2 border-primary/20">
                  {userData.profilePhoto ? (
                    <img
                      src={userData.profilePhoto}
                      alt={userData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-skill-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {userData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                    <h2 className="text-3xl font-bold text-white">
                      {userData.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-white font-semibold">
                        {(4.5 + Math.random() * 0.5).toFixed(2)}
                      </span>
                      <span className="text-gray-400">
                        ({(Math.random() * 50 + 5).toFixed(2)} reviews)
                      </span>
                    </div>
                    <Badge className="bg-green-900/50 text-green-300 border-green-600">
                      <Eye className="w-3 h-3 mr-1" />
                      Public Profile
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                    {userData.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {userData.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined{" "}
                      {new Date(userData.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          year: "numeric",
                        },
                      )}
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
                  {currentUser && currentUser.id !== userData._id && (
                    <>
                      <StarBorder as="div" color="#60a5fa" speed="5s">
                        <Button
                          onClick={() => {
                            if (
                              !currentUser?.skillsOffered ||
                              currentUser.skillsOffered.length === 0
                            ) {
                              alert(
                                "You need to add skills to your profile before sending requests",
                              );
                              return;
                            }
                            if (
                              !userData.skillsOffered ||
                              userData.skillsOffered.length === 0
                            ) {
                              alert("This user doesn't offer any skills yet");
                              return;
                            }
                            setRequestError(null);
                            setShowRequestDialog(true);
                          }}
                          className="bg-transparent border-none p-0 h-auto font-medium"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send Request
                        </Button>
                      </StarBorder>
                      <Button
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Skills Teaching ({userData.skillsOffered.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userData.skillsOffered.length > 0 ? (
                  userData.skillsOffered.map((skill, index) => (
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
                          {skill.isApproved ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No teaching skills listed</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  Skills Learning ({userData.skillsWanted.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userData.skillsWanted.length > 0 ? (
                  userData.skillsWanted.map((skill, index) => (
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
                    <p>No learning interests listed</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Send Request Dialog */}
        <Dialog
          open={showRequestDialog}
          onOpenChange={(open) => {
            setShowRequestDialog(open);
            if (!open) {
              setRequestError(null);
            }
          }}
        >
          <DialogContent className="bg-gray-800 border-gray-600 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                Send Skill Exchange Request to {userData.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {requestError && (
                <div className="bg-red-900/50 border border-red-600 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <p className="text-red-300 text-sm">{requestError}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="skill-offered" className="text-gray-200">
                  Skill You'll Teach *
                </Label>
                <Select
                  value={requestForm.skillOffered}
                  onValueChange={(value) =>
                    setRequestForm({ ...requestForm, skillOffered: value })
                  }
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select a skill you can teach" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {currentUser?.skillsOffered.map((skill, index) => (
                      <SelectItem key={index} value={skill.skill}>
                        {skill.skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill-wanted" className="text-gray-200">
                  Skill You Want to Learn *
                </Label>
                <Select
                  value={requestForm.skillWanted}
                  onValueChange={(value) =>
                    setRequestForm({ ...requestForm, skillWanted: value })
                  }
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select a skill to learn" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {userData.skillsOffered.map((skill, index) => (
                      <SelectItem key={index} value={skill.skill}>
                        {skill.skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-gray-200">
                  Session Duration
                </Label>
                <Select
                  value={requestForm.duration}
                  onValueChange={(value) =>
                    setRequestForm({ ...requestForm, duration: value })
                  }
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="30 minutes">30 minutes</SelectItem>
                    <SelectItem value="1 hour">1 hour</SelectItem>
                    <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                    <SelectItem value="2 hours">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-200">
                  Message * (minimum 10 characters)
                </Label>
                <Textarea
                  id="message"
                  value={requestForm.message}
                  onChange={(e) =>
                    setRequestForm({ ...requestForm, message: e.target.value })
                  }
                  placeholder="Introduce yourself and explain what you'd like to learn..."
                  className="bg-gray-700 border-gray-600 text-white resize-none"
                  rows={4}
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Character count: {requestForm.message.length}</span>
                  {requestForm.message.length < 10 && (
                    <span className="text-red-400">
                      Need {10 - requestForm.message.length} more characters
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRequestDialog(false);
                    setRequestError(null);
                  }}
                  className="flex-1 border-gray-600 text-gray-300"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendRequest}
                  className="flex-1 bg-primary hover:bg-primary/80"
                  disabled={
                    isSubmitting ||
                    !requestForm.skillOffered ||
                    !requestForm.skillWanted ||
                    !requestForm.message
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Request
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
