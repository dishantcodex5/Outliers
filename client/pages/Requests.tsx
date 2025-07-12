import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StarBorder from "@/components/ui/StarBorder";
import { MessageSquare, Clock } from "lucide-react";

export default function Requests() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Swap Requests
            </h1>
            <p className="text-gray-300">
              Manage your incoming and outgoing skill swap requests
            </p>
          </div>

          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600 shadow-2xl">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-skill-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">
                Swap Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 mb-6">
                <p className="text-blue-200 font-medium">Feature in Progress</p>
                <p className="text-blue-300 text-sm mt-1">
                  Request management system is being developed. You'll be able
                  to send, receive, accept, and reject swap requests here.
                </p>
              </div>
              <StarBorder color="#60a5fa" speed="4s">
                <Clock className="mr-2 w-4 h-4" />
                View Pending Requests
              </StarBorder>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
