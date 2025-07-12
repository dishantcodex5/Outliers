import React from "react";

const { createContext, useContext, useState, useEffect } = React;

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
  updateUser: (userData: Partial<User>) => Promise<void>;
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
  profileCompleted: true, // Mock user has completed profile
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-15T12:00:00Z",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Check for existing auth on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem("skillswap_auth");
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        if (authData.user && authData.token) {
          setUser(authData.user);
        } else {
          // Invalid auth data, remove it
          localStorage.removeItem("skillswap_auth");
        }
      } catch (error) {
        // Invalid JSON, remove it
        localStorage.removeItem("skillswap_auth");
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setUser(data.user);
      localStorage.setItem(
        "skillswap_auth",
        JSON.stringify({ user: data.user, token: data.token }),
      );
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    }
  };

  const signup = async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      // Add avatar initials for display
      const userWithAvatar = {
        ...data.user,
        avatar: userData.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase(),
      };

      setUser(userWithAvatar);
      localStorage.setItem(
        "skillswap_auth",
        JSON.stringify({ user: userWithAvatar, token: data.token }),
      );
    } catch (error: any) {
      throw new Error(error.message || "Signup failed");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("skillswap_auth");
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      const authData = JSON.parse(
        localStorage.getItem("skillswap_auth") || "{}",
      );
      const token = authData.token;

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(data.message || "Update failed");
      }

      // Add avatar if not present
      const updatedUser = {
        ...data.user,
        avatar: data.user.avatar || user.avatar,
      };

      setUser(updatedUser);
      localStorage.setItem(
        "skillswap_auth",
        JSON.stringify({ user: updatedUser, token }),
      );
    } catch (error: any) {
      throw new Error(error.message || "Update failed");
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
    updateUser,
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
