import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import StarBorder from "@/components/ui/StarBorder";
import { useAuth } from "@/contexts/AuthContext";
import {
  MapPin,
  Plus,
  X,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Lightbulb,
} from "lucide-react";

interface Skill {
  skill: string;
  description: string;
}

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    location: "",
    skillsOffered: [] as Skill[],
    skillsWanted: [] as Skill[],
    availability: {
      weekdays: false,
      weekends: false,
      mornings: false,
      afternoons: false,
      evenings: false,
    },
    isPublic: true,
  });

  const [skillInput, setSkillInput] = useState({
    type: "offered" as "offered" | "wanted",
    skill: "",
    description: "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvailabilityChange = (field: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      availability: { ...prev.availability, [field]: checked },
    }));
  };

  const addSkill = () => {
    if (!skillInput.skill.trim()) return;

    const newSkill: Skill = {
      skill: skillInput.skill,
      description: skillInput.description,
    };

    if (skillInput.type === "offered") {
      setFormData((prev) => ({
        ...prev,
        skillsOffered: [...prev.skillsOffered, newSkill],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        skillsWanted: [...prev.skillsWanted, newSkill],
      }));
    }

    setSkillInput({ type: skillInput.type, skill: "", description: "" });
  };

  const removeSkill = (index: number, type: "offered" | "wanted") => {
    if (type === "offered") {
      setFormData((prev) => ({
        ...prev,
        skillsOffered: prev.skillsOffered.filter((_, i) => i !== index),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        skillsWanted: prev.skillsWanted.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Update user profile with collected data
      await updateUser({
        location: formData.location,
        skillsOffered: formData.skillsOffered.map((skill) => ({
          ...skill,
          isApproved: true,
        })),
        skillsWanted: formData.skillsWanted,
        availability: formData.availability,
        isPublic: formData.isPublic,
        profileCompleted: true,
      });

      // Redirect to profile page
      navigate("/profile");
    } catch (error) {
      console.error("Failed to complete profile setup:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.location.trim().length > 0;
      case 2:
        return (
          formData.skillsOffered.length > 0 && formData.skillsWanted.length > 0
        );
      case 3:
        return Object.values(formData.availability).some(
          (value) => value === true,
        );
      default:
        return false;
    }
  };

  const getStepIcon = (step: number) => {
    if (step < currentStep) {
      return <CheckCircle className="w-6 h-6 text-green-400" />;
    } else if (step === currentStep) {
      return (
        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">{step}</span>
        </div>
      );
    } else {
      return (
        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
          <span className="text-gray-300 text-sm">{step}</span>
        </div>
      );
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-300">
              Welcome {user?.name}! Let's set up your SkillSwap profile to help
              you connect with others.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                {getStepIcon(1)}
                <span className="ml-2 text-white font-medium">Location</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-600"></div>
              <div className="flex items-center">
                {getStepIcon(2)}
                <span className="ml-2 text-white font-medium">Skills</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-600"></div>
              <div className="flex items-center">
                {getStepIcon(3)}
                <span className="ml-2 text-white font-medium">
                  Availability
                </span>
              </div>
            </div>
          </div>

          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600 shadow-2xl">
            <CardContent className="p-8">
              {/* Step 1: Location */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Where are you located?
                    </h2>
                    <p className="text-gray-300">
                      This helps us connect you with people in your area for
                      in-person skill exchanges.
                    </p>
                  </div>

                  <div className="max-w-md mx-auto">
                    <Label htmlFor="location" className="text-gray-200">
                      Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="e.g., San Francisco, CA or London, UK"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      className="mt-2 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Skills */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">
                      What skills do you have?
                    </h2>
                    <p className="text-gray-300">
                      Add skills you can teach and skills you want to learn.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Skills I Can Teach */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Lightbulb className="w-5 h-5 text-green-400 mr-2" />
                        Skills I Can Teach
                      </h3>

                      <div className="space-y-3 mb-4">
                        {formData.skillsOffered.map((skill, index) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-700/50 rounded-lg flex justify-between items-start"
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSkill(index, "offered")}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {skillInput.type === "offered" && (
                        <div className="space-y-3 p-4 bg-gray-700/30 rounded-lg">
                          <Input
                            placeholder="Skill name (e.g., React Development)"
                            value={skillInput.skill}
                            onChange={(e) =>
                              setSkillInput((prev) => ({
                                ...prev,
                                skill: e.target.value,
                              }))
                            }
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                          <Textarea
                            placeholder="Brief description (optional)"
                            value={skillInput.description}
                            onChange={(e) =>
                              setSkillInput((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            className="bg-gray-700 border-gray-600 text-white resize-none"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={addSkill}
                              disabled={!skillInput.skill.trim()}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() =>
                                setSkillInput((prev) => ({
                                  ...prev,
                                  skill: "",
                                  description: "",
                                }))
                              }
                              className="border-gray-600 text-gray-300"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {skillInput.type !== "offered" && (
                        <Button
                          variant="outline"
                          onClick={() =>
                            setSkillInput((prev) => ({
                              ...prev,
                              type: "offered",
                            }))
                          }
                          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Teaching Skill
                        </Button>
                      )}
                    </div>

                    {/* Skills I Want to Learn */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <BookOpen className="w-5 h-5 text-blue-400 mr-2" />
                        Skills I Want to Learn
                      </h3>

                      <div className="space-y-3 mb-4">
                        {formData.skillsWanted.map((skill, index) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-700/50 rounded-lg flex justify-between items-start"
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSkill(index, "wanted")}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {skillInput.type === "wanted" && (
                        <div className="space-y-3 p-4 bg-gray-700/30 rounded-lg">
                          <Input
                            placeholder="Skill name (e.g., Photography)"
                            value={skillInput.skill}
                            onChange={(e) =>
                              setSkillInput((prev) => ({
                                ...prev,
                                skill: e.target.value,
                              }))
                            }
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                          <Textarea
                            placeholder="What you'd like to learn (optional)"
                            value={skillInput.description}
                            onChange={(e) =>
                              setSkillInput((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            className="bg-gray-700 border-gray-600 text-white resize-none"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={addSkill}
                              disabled={!skillInput.skill.trim()}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() =>
                                setSkillInput((prev) => ({
                                  ...prev,
                                  skill: "",
                                  description: "",
                                }))
                              }
                              className="border-gray-600 text-gray-300"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {skillInput.type !== "wanted" && (
                        <Button
                          variant="outline"
                          onClick={() =>
                            setSkillInput((prev) => ({
                              ...prev,
                              type: "wanted",
                            }))
                          }
                          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Learning Interest
                        </Button>
                      )}
                    </div>
                  </div>

                  {(formData.skillsOffered.length === 0 ||
                    formData.skillsWanted.length === 0) && (
                    <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                        <p className="text-yellow-300 font-medium">
                          Please add at least one skill you can teach and one
                          skill you want to learn.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Availability */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">
                      When are you available?
                    </h2>
                    <p className="text-gray-300">
                      Let others know when you're generally available for skill
                      exchanges.
                    </p>
                  </div>

                  <div className="max-w-2xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">
                          Days
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="weekdays"
                              checked={formData.availability.weekdays}
                              onCheckedChange={(checked) =>
                                handleAvailabilityChange(
                                  "weekdays",
                                  checked as boolean,
                                )
                              }
                            />
                            <Label htmlFor="weekdays" className="text-gray-200">
                              Weekdays (Mon-Fri)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="weekends"
                              checked={formData.availability.weekends}
                              onCheckedChange={(checked) =>
                                handleAvailabilityChange(
                                  "weekends",
                                  checked as boolean,
                                )
                              }
                            />
                            <Label htmlFor="weekends" className="text-gray-200">
                              Weekends (Sat-Sun)
                            </Label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">
                          Times
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="mornings"
                              checked={formData.availability.mornings}
                              onCheckedChange={(checked) =>
                                handleAvailabilityChange(
                                  "mornings",
                                  checked as boolean,
                                )
                              }
                            />
                            <Label htmlFor="mornings" className="text-gray-200">
                              Mornings (6AM-12PM)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="afternoons"
                              checked={formData.availability.afternoons}
                              onCheckedChange={(checked) =>
                                handleAvailabilityChange(
                                  "afternoons",
                                  checked as boolean,
                                )
                              }
                            />
                            <Label
                              htmlFor="afternoons"
                              className="text-gray-200"
                            >
                              Afternoons (12PM-6PM)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="evenings"
                              checked={formData.availability.evenings}
                              onCheckedChange={(checked) =>
                                handleAvailabilityChange(
                                  "evenings",
                                  checked as boolean,
                                )
                              }
                            />
                            <Label htmlFor="evenings" className="text-gray-200">
                              Evenings (6PM-10PM)
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isPublic"
                          checked={formData.isPublic}
                          onCheckedChange={(checked) =>
                            handleInputChange("isPublic", checked as boolean)
                          }
                        />
                        <Label htmlFor="isPublic" className="text-gray-200">
                          Make my profile public (recommended)
                        </Label>
                      </div>
                      <p className="text-gray-400 text-sm mt-2 ml-6">
                        Public profiles can be discovered by others looking for
                        skill exchanges. You can change this later.
                      </p>
                    </div>

                    {!Object.values(formData.availability).some(
                      (value) => value === true,
                    ) && (
                      <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-400" />
                          <p className="text-yellow-300 font-medium">
                            Please select at least one availability option.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-600">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i + 1 <= currentStep ? "bg-primary" : "bg-gray-600"
                      }`}
                    />
                  ))}
                </div>

                {currentStep < 3 ? (
                  <Button
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="bg-primary hover:bg-primary/80"
                  >
                    Next
                  </Button>
                ) : (
                  <StarBorder
                    as="div"
                    color="#60a5fa"
                    speed="5s"
                    disabled={!canProceed() || isLoading}
                  >
                    <Button
                      onClick={handleSubmit}
                      disabled={!canProceed() || isLoading}
                      className="bg-transparent border-none p-0 h-auto font-medium"
                    >
                      {isLoading ? "Completing Setup..." : "Complete Setup"}
                    </Button>
                  </StarBorder>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
