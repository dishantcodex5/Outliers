import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Send } from "lucide-react";

export default function Feedback() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Give Feedback
            </h1>
            <p className="text-gray-600">
              Rate and review your skill swap experiences
            </p>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-skill-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Feedback System</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium">Coming Soon</p>
                <p className="text-green-600 text-sm mt-1">
                  Rating and review system is being implemented. Help build
                  trust in our community by sharing your experiences.
                </p>
              </div>
              <Button>
                <Send className="mr-2 w-4 h-4" />
                Submit Feedback
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
