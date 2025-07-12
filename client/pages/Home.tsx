import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StarBorder from "@/components/ui/StarBorder";
import Hyperspeed from "@/components/Hyperspeed";
import { hyperspeedPresets } from "@/components/HyperspeedPresets";
import Layout from "@/components/Layout";
import {
  Users,
  Search,
  MessageSquare,
  Star,
  ArrowRight,
  CheckCircle,
  BookOpen,
  Code,
  Palette,
  Camera,
  Music,
  Dumbbell,
} from "lucide-react";

const featuredSkills = [
  { name: "Web Development", icon: Code, users: 245 },
  { name: "Graphic Design", icon: Palette, users: 189 },
  { name: "Photography", icon: Camera, users: 156 },
  { name: "Music Production", icon: Music, users: 98 },
  { name: "Content Writing", icon: BookOpen, users: 134 },
  { name: "Fitness Training", icon: Dumbbell, users: 167 },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    skill: "Learned UI/UX Design",
    traded: "Python Programming",
    rating: 5,
    comment:
      "Amazing experience! I taught Python and learned Figma in return. The community here is incredibly supportive.",
    avatar: "S",
  },
  {
    name: "Mike Chen",
    skill: "Learned Photography",
    traded: "Web Development",
    rating: 5,
    comment:
      "Found the perfect mentor for photography. Now I can capture professional shots for my portfolio!",
    avatar: "M",
  },
  {
    name: "Emma Davis",
    skill: "Learned Digital Marketing",
    traded: "Graphic Design",
    rating: 5,
    comment:
      "The skill exchange process was seamless. Both parties benefited and we're now good friends.",
    avatar: "E",
  },
];

const features = [
  {
    icon: Search,
    title: "Discover Skills",
    description:
      "Browse through hundreds of skills offered by talented individuals in your area or remotely.",
  },
  {
    icon: MessageSquare,
    title: "Connect & Swap",
    description:
      "Send swap requests and negotiate fair exchanges that benefit both parties involved.",
  },
  {
    icon: Star,
    title: "Rate & Review",
    description:
      "Build trust through our rating system and give feedback to improve the community.",
  },
  {
    icon: Users,
    title: "Build Network",
    description:
      "Create lasting professional relationships and expand your network through skill sharing.",
  },
];

export default function Home() {
  return (
    <Layout>
      {/* Hero Section with Hyperspeed Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hyperspeed Background */}
        <div className="absolute inset-0 z-0">
          <Hyperspeed effectOptions={hyperspeedPresets.one} />
        </div>

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80 z-10"></div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Exchange Skills,
            <span className="bg-gradient-to-r from-primary to-skill-400 bg-clip-text text-transparent">
              {" "}
              Grow Together
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed">
            Connect with like-minded individuals and trade your expertise. Learn
            something new while sharing your knowledge with others in our
            thriving community.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
            <Link to="/signup">
              <StarBorder
                className="text-xl px-10 py-8 font-semibold"
                color="#a855f7"
                speed="3s"
              >
                Get Started
                <ArrowRight className="ml-3 w-6 h-6" />
              </StarBorder>
            </Link>
            <Link to="/browse">
              <StarBorder
                className="text-xl px-10 py-8 font-semibold"
                color="#64748b"
                speed="5s"
              >
                Browse Skills
              </StarBorder>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-primary mb-2">1,200+</div>
              <div className="text-gray-200 text-lg">Active Users</div>
            </div>
            <div className="text-center backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-primary mb-2">450+</div>
              <div className="text-gray-200 text-lg">Skills Available</div>
            </div>
            <div className="text-center backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-primary mb-2">2,800+</div>
              <div className="text-gray-200 text-lg">Successful Swaps</div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Skills */}
      <section className="py-20 bg-gray-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Popular Skills on SkillSwap
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover the most sought-after skills in our community
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {featuredSkills.map((skill) => (
              <Card
                key={skill.name}
                className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-gray-700/80 backdrop-blur-sm border-gray-600 hover:bg-gray-600 hover:border-primary/50 hover:scale-105"
              >
                <CardContent className="p-6 text-center">
                  <skill.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-medium text-white mb-2">{skill.name}</h3>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-gray-600 text-gray-200"
                  >
                    {skill.users} users
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              How SkillSwap Works
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Simple steps to start exchanging skills today
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="text-center border-gray-600 shadow-lg bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700 transition-all duration-300 hover:border-primary/50 hover:scale-105"
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Success Stories
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Hear from our community members who found value in skill exchange
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.name}
                className="shadow-xl bg-gray-700/80 backdrop-blur-sm border-gray-600 hover:bg-gray-600 transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-skill-600 text-white rounded-full flex items-center justify-center font-semibold text-lg mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg">
                        {testimonial.name}
                      </h4>
                      <div className="flex items-center">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 text-yellow-400 fill-current"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4 text-lg leading-relaxed">
                    "{testimonial.comment}"
                  </p>
                  <div className="text-sm text-gray-400">
                    <span className="text-green-400 font-medium">Learned:</span>{" "}
                    {testimonial.skill} •{" "}
                    <span className="text-blue-400 font-medium">Taught:</span>{" "}
                    {testimonial.traded}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-skill-600 to-primary relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Skill Journey?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of learners and teachers in our growing community
          </p>
          <Link to="/signup">
            <StarBorder
              className="text-xl px-10 py-8 font-semibold inline-block"
              color="#ffffff"
              speed="2s"
            >
              <span className="text-white">
                Create Your Profile
                <ArrowRight className="ml-3 w-6 h-6 inline" />
              </span>
            </StarBorder>
          </Link>
        </div>

        {/* Additional decorative elements */}
        <div className="absolute top-8 right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-8 left-8 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
      </section>
    </Layout>
  );
}
