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
  avatar: "AT",
  profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
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
      avatar: userData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
      profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
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
