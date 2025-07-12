import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock } from "lucide-react";

export default function Requests() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Swap Requests
            </h1>
            <p className="text-gray-600">
              Manage your incoming and outgoing skill swap requests
            </p>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-skill-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Swap Requests</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 font-medium">Feature in Progress</p>
                <p className="text-blue-600 text-sm mt-1">
                  Request management system is being developed. You'll be able
                  to send, receive, accept, and reject swap requests here.
                </p>
              </div>
              <Button>
                <Clock className="mr-2 w-4 h-4" />
                View Pending Requests
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
