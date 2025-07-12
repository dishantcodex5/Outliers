import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StarBorder from "@/components/ui/StarBorder";
import { Users, ArrowRight } from "lucide-react";

export default function Signup() {
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
          <CardContent className="text-center">
            <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 mb-6">
              <p className="text-blue-200 font-medium">Coming Soon!</p>
              <p className="text-blue-300 text-sm mt-1">
                We're working on the signup form. Check back soon!
              </p>
            </div>
            <StarBorder className="w-full" color="#60a5fa" speed="5s">
              Get Notified
              <ArrowRight className="ml-2 w-4 h-4" />
            </StarBorder>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
