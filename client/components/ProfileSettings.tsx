import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Camera,
  Bell,
  Shield,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  Trash2,
} from "lucide-react";

interface ProfileSettingsProps {
  onSave?: (settings: any) => void;
}

export default function ProfileSettings({ onSave }: ProfileSettingsProps) {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");

  const [settings, setSettings] = useState({
    // Profile Settings
    name: user?.name || "",
    email: user?.email || "",
    location: user?.location || "",
    bio: "",
    profilePhoto: user?.profilePhoto || "",

    // Privacy Settings
    isPublic: user?.isPublic || true,
    showEmail: false,
    showLocation: true,
    allowDirectMessages: true,

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    requestNotifications: true,
    messageNotifications: true,
    sessionReminders: true,
    weeklyDigest: false,

    // Availability Settings
    timezone: "UTC-8",
    defaultSessionLength: "60",
    bufferTime: "15",

    // Security Settings
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: "24",
  });

  const handleInputChange = (field: string, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Update user with relevant settings
      await updateUser({
        name: settings.name,
        location: settings.location,
        isPublic: settings.isPublic,
      });

      // Save other settings (would be separate API calls in real app)
      if (onSave) {
        onSave(settings);
      }

      console.log("Settings saved:", settings);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "availability", label: "Availability", icon: Globe },
    { id: "security", label: "Security", icon: Lock },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Settings Navigation */}
      <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-white">Settings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-700 transition-colors ${
                  activeSection === section.id
                    ? "bg-primary text-white border-r-2 border-primary"
                    : "text-gray-300"
                }`}
              >
                <section.icon className="w-4 h-4" />
                <span>{section.label}</span>
              </button>
            ))}
          </nav>
        </CardContent>
      </Card>

      {/* Settings Content */}
      <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600 lg:col-span-3">
        <CardContent className="p-6">
          {/* Profile Settings */}
          {activeSection === "profile" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Profile Information
                </h3>
                <p className="text-gray-400 mb-6">
                  Update your profile information and photo.
                </p>
              </div>

              {/* Profile Photo */}
              <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={settings.profilePhoto} alt="Profile" />
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {user?.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-sm text-gray-400 mt-2">
                    JPG, GIF or PNG. 1MB max.
                  </p>
                </div>
              </div>

              <Separator className="bg-gray-600" />

              {/* Profile Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-200">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location" className="text-gray-200">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={settings.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="e.g., San Francisco, CA"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio" className="text-gray-200">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={settings.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell others about yourself..."
                    className="bg-gray-700 border-gray-600 text-white resize-none"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeSection === "privacy" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Privacy Settings
                </h3>
                <p className="text-gray-400 mb-6">
                  Control who can see your information and contact you.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Public Profile</h4>
                    <p className="text-sm text-gray-400">
                      Allow others to discover your profile
                    </p>
                  </div>
                  <Switch
                    checked={settings.isPublic}
                    onCheckedChange={(checked) =>
                      handleInputChange("isPublic", checked)
                    }
                  />
                </div>

                <Separator className="bg-gray-600" />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Show Email</h4>
                    <p className="text-sm text-gray-400">
                      Display your email address on your profile
                    </p>
                  </div>
                  <Switch
                    checked={settings.showEmail}
                    onCheckedChange={(checked) =>
                      handleInputChange("showEmail", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Show Location</h4>
                    <p className="text-sm text-gray-400">
                      Display your location on your profile
                    </p>
                  </div>
                  <Switch
                    checked={settings.showLocation}
                    onCheckedChange={(checked) =>
                      handleInputChange("showLocation", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Direct Messages</h4>
                    <p className="text-sm text-gray-400">
                      Allow others to send you direct messages
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowDirectMessages}
                    onCheckedChange={(checked) =>
                      handleInputChange("allowDirectMessages", checked)
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeSection === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Notification Preferences
                </h3>
                <p className="text-gray-400 mb-6">
                  Choose how you want to be notified about activity.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">
                      Email Notifications
                    </h4>
                    <p className="text-sm text-gray-400">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) =>
                      handleInputChange("emailNotifications", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">
                      Push Notifications
                    </h4>
                    <p className="text-sm text-gray-400">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) =>
                      handleInputChange("pushNotifications", checked)
                    }
                  />
                </div>

                <Separator className="bg-gray-600" />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Swap Requests</h4>
                    <p className="text-sm text-gray-400">
                      Notify me about new skill swap requests
                    </p>
                  </div>
                  <Switch
                    checked={settings.requestNotifications}
                    onCheckedChange={(checked) =>
                      handleInputChange("requestNotifications", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Messages</h4>
                    <p className="text-sm text-gray-400">
                      Notify me about new messages
                    </p>
                  </div>
                  <Switch
                    checked={settings.messageNotifications}
                    onCheckedChange={(checked) =>
                      handleInputChange("messageNotifications", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">
                      Session Reminders
                    </h4>
                    <p className="text-sm text-gray-400">
                      Remind me about upcoming sessions
                    </p>
                  </div>
                  <Switch
                    checked={settings.sessionReminders}
                    onCheckedChange={(checked) =>
                      handleInputChange("sessionReminders", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Weekly Digest</h4>
                    <p className="text-sm text-gray-400">
                      Receive a weekly summary of your activity
                    </p>
                  </div>
                  <Switch
                    checked={settings.weeklyDigest}
                    onCheckedChange={(checked) =>
                      handleInputChange("weeklyDigest", checked)
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Availability Settings */}
          {activeSection === "availability" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Availability Settings
                </h3>
                <p className="text-gray-400 mb-6">
                  Configure your default availability and session preferences.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-200">Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) =>
                      handleInputChange("timezone", value)
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC-8">
                        Pacific Time (UTC-8)
                      </SelectItem>
                      <SelectItem value="UTC-5">
                        Eastern Time (UTC-5)
                      </SelectItem>
                      <SelectItem value="UTC+0">UTC</SelectItem>
                      <SelectItem value="UTC+1">
                        Central European Time (UTC+1)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-200">
                    Default Session Length
                  </Label>
                  <Select
                    value={settings.defaultSessionLength}
                    onValueChange={(value) =>
                      handleInputChange("defaultSessionLength", value)
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-200">Buffer Time</Label>
                  <Select
                    value={settings.bufferTime}
                    onValueChange={(value) =>
                      handleInputChange("bufferTime", value)
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No buffer</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeSection === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Security Settings
                </h3>
                <p className="text-gray-400 mb-6">
                  Manage your account security and login preferences.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">
                      Two-Factor Authentication
                    </h4>
                    <p className="text-sm text-gray-400">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      handleInputChange("twoFactorAuth", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Login Alerts</h4>
                    <p className="text-sm text-gray-400">
                      Get notified when someone logs into your account
                    </p>
                  </div>
                  <Switch
                    checked={settings.loginAlerts}
                    onCheckedChange={(checked) =>
                      handleInputChange("loginAlerts", checked)
                    }
                  />
                </div>

                <Separator className="bg-gray-600" />

                <div className="space-y-2">
                  <Label className="text-gray-200">Session Timeout</Label>
                  <Select
                    value={settings.sessionTimeout}
                    onValueChange={(value) =>
                      handleInputChange("sessionTimeout", value)
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="8">8 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="168">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300"
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          {activeSection === "danger" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-red-400 mb-4">
                  Danger Zone
                </h3>
                <p className="text-gray-400 mb-6">
                  Irreversible and destructive actions.
                </p>
              </div>

              <div className="border border-red-600 rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-white font-medium">Delete Account</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      Permanently delete your account and all associated data.
                      This action cannot be undone.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          {activeSection !== "danger" && (
            <div className="flex justify-end pt-6 border-t border-gray-600">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/80"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
