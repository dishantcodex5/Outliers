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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Exchange Skills,
              <span className="bg-gradient-to-r from-primary to-skill-400 bg-clip-text text-transparent">
                {" "}
                Grow Together
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Connect with like-minded individuals and trade your expertise.
              Learn something new while sharing your knowledge with others in
              our thriving community.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link to="/signup">
                <StarBorder
                  className="text-lg px-8 py-6"
                  color="#a855f7"
                  speed="4s"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </StarBorder>
              </Link>
              <Link to="/browse">
                <StarBorder
                  className="text-lg px-8 py-6"
                  color="#64748b"
                  speed="6s"
                >
                  Browse Skills
                </StarBorder>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">1,200+</div>
                <div className="text-gray-400">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">450+</div>
                <div className="text-gray-400">Skills Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">2,800+</div>
                <div className="text-gray-400">Successful Swaps</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-skill-600/30 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-500/10 rounded-full blur-lg"></div>
      </section>

      {/* Featured Skills */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Popular Skills on SkillSwap
            </h2>
            <p className="text-lg text-gray-300">
              Discover the most sought-after skills in our community
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {featuredSkills.map((skill) => (
              <Card
                key={skill.name}
                className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-primary/50"
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
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              How SkillSwap Works
            </h2>
            <p className="text-lg text-gray-300">
              Simple steps to start exchanging skills today
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="text-center border-gray-600 shadow-lg bg-gray-800 hover:bg-gray-700 transition-all duration-300 hover:border-primary/50"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-gray-300">
              Hear from our community members who found value in skill exchange
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.name}
                className="shadow-lg bg-gray-700 border-gray-600 hover:bg-gray-600 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-skill-600 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">
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
                  <p className="text-gray-300 mb-3">"{testimonial.comment}"</p>
                  <div className="text-sm text-gray-400">
                    <span className="text-green-400 font-medium">Learned:</span>{" "}
                    {testimonial.skill} •
                    <span className="text-blue-400 font-medium"> Taught:</span>{" "}
                    {testimonial.traded}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary via-skill-600 to-primary relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Skill Journey?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands of learners and teachers in our growing community
          </p>
          <Link to="/signup">
            <StarBorder
              className="text-lg px-8 py-6 inline-block"
              color="#ffffff"
              speed="3s"
            >
              <span className="text-white font-medium">
                Create Your Profile
                <ArrowRight className="ml-2 w-5 h-5 inline" />
              </span>
            </StarBorder>
          </Link>
        </div>

        {/* Additional decorative elements */}
        <div className="absolute top-4 right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
      </section>
    </Layout>
  );
}
