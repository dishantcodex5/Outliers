import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import StarBorder from "@/components/ui/StarBorder";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, Users, AlertCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/profile");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail("alex.thompson@email.com");
    setPassword("password");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-skill-600/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-blue-500/10 rounded-full blur-lg"></div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-skill-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">
              Welcome back to SkillSwap
            </h2>
            <p className="mt-2 text-gray-300">
              Sign in to your account to continue learning and teaching
            </p>
          </div>

          <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-600 shadow-2xl">
            <CardContent className="p-6">
              {/* Demo Credentials Banner */}
              <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-3 mb-6">
                <p className="text-blue-200 text-sm font-medium mb-2">
                  Demo Account:
                </p>
                <div className="text-xs text-blue-300 space-y-1">
                  <p>Email: alex.thompson@email.com</p>
                  <p>Password: password</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fillDemoCredentials}
                  className="mt-2 text-xs border-blue-600 text-blue-300 hover:bg-blue-800"
                >
                  Use Demo Credentials
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-300 text-sm">{error}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-gray-700/80 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-gray-700/80 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-600 bg-gray-700 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-300"
                    >
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                <StarBorder
                  as="div"
                  className="w-full"
                  color="#a855f7"
                  speed="4s"
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-transparent border-none p-0 h-auto font-medium"
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </StarBorder>
              </form>

              <div className="mt-6">
                <Separator className="my-4 bg-gray-600" />
                <div className="text-center">
                  <span className="text-gray-400">Don't have an account? </span>
                  <Link
                    to="/signup"
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Sign up for free
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
