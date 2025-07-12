import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings } from "lucide-react";

export default function Profile() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              User Profile
            </h1>
            <p className="text-gray-600">
              Manage your skills, availability, and profile information
            </p>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-skill-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Profile Management</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 font-medium">Under Development</p>
                <p className="text-yellow-600 text-sm mt-1">
                  Profile editing features are being built. You'll be able to
                  manage your skills, availability, and personal information
                  here.
                </p>
              </div>
              <Button>
                <Settings className="mr-2 w-4 h-4" />
                Configure Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
