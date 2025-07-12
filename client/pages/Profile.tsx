import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StarBorder from "@/components/ui/StarBorder";
import { User, Settings } from "lucide-react";

export default function Profile() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">User Profile</h1>
            <p className="text-gray-300">
              Manage your skills, availability, and profile information
            </p>
          </div>

          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600 shadow-2xl">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-skill-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">
                Profile Management
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-4 mb-6">
                <p className="text-yellow-200 font-medium">Under Development</p>
                <p className="text-yellow-300 text-sm mt-1">
                  Profile editing features are being built. You'll be able to
                  manage your skills, availability, and personal information
                  here.
                </p>
              </div>
              <StarBorder color="#eab308" speed="6s">
                <Settings className="mr-2 w-4 h-4" />
                Configure Profile
              </StarBorder>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
