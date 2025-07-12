import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StarBorder from "@/components/ui/StarBorder";
import { Users, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-skill-600/20 rounded-full blur-2xl"></div>

        <Card className="max-w-md w-full bg-gray-800/90 backdrop-blur-sm border-gray-600 shadow-2xl relative z-10">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-skill-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">
              Join SkillSwap
            </CardTitle>
            <p className="text-gray-300">
              Create your account and start exchanging skills
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-gray-200 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-gray-200 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-gray-200 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-gray-200 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-primary"
                  required
                />
              </div>

              <div className="pt-4">
                <StarBorder className="w-full" color="#60a5fa" speed="5s">
                  Create Account
                </StarBorder>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Sign in
                </a>
              </p>
            </div>

            <div className="mt-4 text-center">
              <StarBorder className="w-full" color="#a855f7" speed="6s">
                Get Notified
              </StarBorder>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
