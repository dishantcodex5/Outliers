import { Link } from "react-router-dom";
import { Users, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-skill-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">SkillSwap</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Connect with others and exchange skills to grow together. Find
              mentors, share knowledge, and build lasting professional
              relationships through skill trading.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-gray-400">
                <Mail className="w-4 h-4" />
                <span>hello@skillswap.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/browse"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Browse Skills
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  My Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/requests"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Swap Requests
                </Link>
              </li>
              <li>
                <Link
                  to="/feedback"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Give Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/help"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 SkillSwap Platform. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              to="/admin"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
