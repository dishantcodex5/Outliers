import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  location: string;
  profilePhoto: string;
  skillsOffered: Array<{
    skill: string;
    description: string;
    isApproved: boolean;
  }>;
  skillsWanted: Array<{
    skill: string;
    description: string;
  }>;
  availability: {
    weekdays: boolean;
    weekends: boolean;
    mornings: boolean;
    afternoons: boolean;
    evenings: boolean;
  };
  isPublic: boolean;
  role: "user" | "admin";
  avatar: string; // Generated from name initials
  profileCompleted: boolean; // Flag for first-time setup
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (userData: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data
const mockUser: User = {
  id: "1",
  name: "Alex Thompson",
  email: "alex.thompson@email.com",
  location: "San Francisco, CA",
  profilePhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  skillsOffered: [
    {
      skill: "React Development",
      description:
        "Advanced React development including hooks, context, and performance optimization",
      isApproved: true,
    },
    {
      skill: "Node.js",
      description:
        "Backend development with Express, APIs, and database integration",
      isApproved: true,
    },
    {
      skill: "Spanish Language",
      description:
        "Conversational Spanish for beginners and intermediate learners",
      isApproved: true,
    },
  ],
  skillsWanted: [
    {
      skill: "Photography",
      description: "Portrait and landscape photography techniques",
    },
    {
      skill: "Graphic Design",
      description: "Logo design and brand identity creation",
    },
  ],
  availability: {
    weekdays: true,
    weekends: false,
    mornings: false,
    afternoons: true,
    evenings: true,
  },
  isPublic: true,
  role: "user",
  avatar: "AT",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-15T12:00:00Z",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Check for existing auth on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem("skillswap_auth");
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setUser(authData.user);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock authentication - in real app this would call an API
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

    if (email === "alex.thompson@email.com" && password === "password") {
      setUser(mockUser);
      localStorage.setItem(
        "skillswap_auth",
        JSON.stringify({ user: mockUser }),
      );
    } else {
      throw new Error("Invalid credentials");
    }
  };

  const signup = async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    // Mock signup - in real app this would call an API
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      location: "",
      profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
      skillsOffered: [],
      skillsWanted: [],
      availability: {
        weekdays: false,
        weekends: false,
        mornings: false,
        afternoons: false,
        evenings: false,
      },
      isPublic: true,
      role: "user",
      avatar: userData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setUser(newUser);
    localStorage.setItem("skillswap_auth", JSON.stringify({ user: newUser }));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("skillswap_auth");
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
