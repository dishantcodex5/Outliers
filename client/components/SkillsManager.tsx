import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, X } from "lucide-react";

interface Skill {
  skill: string;
  description: string;
  isApproved?: boolean;
}

interface SkillsManagerProps {
  type: "teaching" | "learning";
  onAddSkill: (skill: Skill) => void;
}

export default function SkillsManager({
  type,
  onAddSkill,
}: SkillsManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    skill: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.skill.trim()) return;

    const newSkill: Skill = {
      skill: formData.skill,
      description: formData.description,
      ...(type === "teaching" && { isApproved: true }), // Auto-approve for demo
    };

    onAddSkill(newSkill);
    setFormData({ skill: "", description: "" });
    setIsOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {type === "teaching" ? "Teaching" : "Learning"} Skill
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-600 text-white">
        <DialogHeader>
          <DialogTitle>
            Add {type === "teaching" ? "Teaching" : "Learning"} Skill
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skill" className="text-gray-200">
              Skill Name *
            </Label>
            <Input
              id="skill"
              placeholder={`e.g., ${type === "teaching" ? "React Development" : "Photography"}`}
              value={formData.skill}
              onChange={(e) => handleInputChange("skill", e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-200">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder={`Describe your ${type === "teaching" ? "expertise and what you can teach" : "learning goals and current level"}`}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="bg-gray-700 border-gray-600 text-white resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/80"
            >
              <Save className="w-4 h-4 mr-2" />
              Add Skill
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
