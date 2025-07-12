import { Router, Response, Request, NextFunction } from "express";
import { User } from "../models/User";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import jwt from "jsonwebtoken";

const router = Router();

// Get user profile
router.get(
  "/profile",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await User.findById(req.user!.id);
      if (!user) {
        return res.status(404).json({
          error: "User not found",
          message: "User does not exist",
        });
      }

      res.json({
        user: user.toJSON(),
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        error: "Failed to get profile",
        message: "Internal server error",
      });
    }
  },
);

// Update user profile
router.put(
  "/profile",
  authenticateToken,
  validateRequest([
    {
      field: "name",
      type: "string",
      minLength: 2,
      maxLength: 50,
    },
    {
      field: "location",
      type: "string",
      maxLength: 100,
    },
    {
      field: "isPublic",
      type: "boolean",
    },
    {
      field: "skillsOffered",
      type: "array",
    },
    {
      field: "skillsWanted",
      type: "array",
    },
    {
      field: "availability",
      type: "object",
    },
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        name,
        location,
        isPublic,
        skillsOffered,
        skillsWanted,
        availability,
        profileCompleted,
      } = req.body;

      const user = await User.findById(req.user!.id);
      if (!user) {
        return res.status(404).json({
          error: "User not found",
          message: "User does not exist",
        });
      }

      // Update fields if provided
      if (name !== undefined) user.name = name;
      if (location !== undefined) user.location = location;
      if (isPublic !== undefined) user.isPublic = isPublic;
      if (skillsOffered !== undefined) user.skillsOffered = skillsOffered;
      if (skillsWanted !== undefined) user.skillsWanted = skillsWanted;
      if (availability !== undefined) user.availability = availability;
      if (profileCompleted !== undefined)
        user.profileCompleted = profileCompleted;

      await user.save();

      res.json({
        message: "Profile updated successfully",
        user: user.toJSON(),
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        error: "Failed to update profile",
        message: "Internal server error",
      });
    }
  },
);

// Complete profile setup
router.put(
  "/profile/setup",
  authenticateToken,
  validateRequest([
    {
      field: "location",
      required: true,
      type: "string",
      minLength: 1,
      maxLength: 100,
    },
    {
      field: "skillsOffered",
      required: true,
      type: "array",
      custom: (value) =>
        Array.isArray(value) && value.length > 0
          ? true
          : "At least one skill offered is required",
    },
    {
      field: "skillsWanted",
      required: true,
      type: "array",
      custom: (value) =>
        Array.isArray(value) && value.length > 0
          ? true
          : "At least one skill wanted is required",
    },
    {
      field: "availability",
      required: true,
      type: "object",
    },
    {
      field: "isPublic",
      required: true,
      type: "boolean",
    },
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { location, skillsOffered, skillsWanted, availability, isPublic } =
        req.body;

      const user = await User.findById(req.user!.id);
      if (!user) {
        return res.status(404).json({
          error: "User not found",
          message: "User does not exist",
        });
      }

      // Validate availability has at least one time slot
      const hasAvailability = Object.values(availability).some(
        (value) => value === true,
      );
      if (!hasAvailability) {
        return res.status(400).json({
          error: "Validation failed",
          message: "At least one availability option must be selected",
        });
      }

      // Update profile
      user.location = location;
      user.skillsOffered = skillsOffered.map((skill: any) => ({
        ...skill,
        isApproved: true, // Auto-approve for now
      }));
      user.skillsWanted = skillsWanted;
      user.availability = availability;
      user.isPublic = isPublic;
      user.profileCompleted = true;

      await user.save();

      res.json({
        message: "Profile setup completed successfully",
        user: user.toJSON(),
      });
    } catch (error) {
      console.error("Profile setup error:", error);
      res.status(500).json({
        error: "Failed to complete profile setup",
        message: "Internal server error",
      });
    }
  },
);

// Add skill to offered skills
router.post(
  "/skills/offered",
  authenticateToken,
  validateRequest([
    {
      field: "skill",
      required: true,
      type: "string",
      minLength: 1,
      maxLength: 100,
    },
    {
      field: "description",
      type: "string",
      maxLength: 500,
    },
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { skill, description = "" } = req.body;

      const user = await User.findById(req.user!.id);
      if (!user) {
        return res.status(404).json({
          error: "User not found",
          message: "User does not exist",
        });
      }

      // Check if skill already exists
      const existingSkill = user.skillsOffered.find(
        (s) => s.skill.toLowerCase() === skill.toLowerCase(),
      );
      if (existingSkill) {
        return res.status(400).json({
          error: "Skill already exists",
          message: "You already have this skill in your offered skills",
        });
      }

      user.skillsOffered.push({
        skill,
        description,
        isApproved: true,
      });

      await user.save();

      res.json({
        message: "Skill added successfully",
        skill: { skill, description, isApproved: true },
      });
    } catch (error) {
      console.error("Add offered skill error:", error);
      res.status(500).json({
        error: "Failed to add skill",
        message: "Internal server error",
      });
    }
  },
);

// Add skill to wanted skills
router.post(
  "/skills/wanted",
  authenticateToken,
  validateRequest([
    {
      field: "skill",
      required: true,
      type: "string",
      minLength: 1,
      maxLength: 100,
    },
    {
      field: "description",
      type: "string",
      maxLength: 500,
    },
  ]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { skill, description = "" } = req.body;

      const user = await User.findById(req.user!.id);
      if (!user) {
        return res.status(404).json({
          error: "User not found",
          message: "User does not exist",
        });
      }

      // Check if skill already exists
      const existingSkill = user.skillsWanted.find(
        (s) => s.skill.toLowerCase() === skill.toLowerCase(),
      );
      if (existingSkill) {
        return res.status(400).json({
          error: "Skill already exists",
          message: "You already have this skill in your wanted skills",
        });
      }

      user.skillsWanted.push({
        skill,
        description,
      });

      await user.save();

      res.json({
        message: "Skill added successfully",
        skill: { skill, description },
      });
    } catch (error) {
      console.error("Add wanted skill error:", error);
      res.status(500).json({
        error: "Failed to add skill",
        message: "Internal server error",
      });
    }
  },
);

// Remove skill from offered skills
router.delete(
  "/skills/offered/:index",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { index } = req.params;
      const skillIndex = parseInt(index);

      if (isNaN(skillIndex)) {
        return res.status(400).json({
          error: "Invalid index",
          message: "Skill index must be a number",
        });
      }

      const user = await User.findById(req.user!.id);
      if (!user) {
        return res.status(404).json({
          error: "User not found",
          message: "User does not exist",
        });
      }

      if (skillIndex < 0 || skillIndex >= user.skillsOffered.length) {
        return res.status(400).json({
          error: "Invalid index",
          message: "Skill index out of range",
        });
      }

      user.skillsOffered.splice(skillIndex, 1);
      await user.save();

      res.json({
        message: "Skill removed successfully",
      });
    } catch (error) {
      console.error("Remove offered skill error:", error);
      res.status(500).json({
        error: "Failed to remove skill",
        message: "Internal server error",
      });
    }
  },
);

// Remove skill from wanted skills
router.delete(
  "/skills/wanted/:index",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { index } = req.params;
      const skillIndex = parseInt(index);

      if (isNaN(skillIndex)) {
        return res.status(400).json({
          error: "Invalid index",
          message: "Skill index must be a number",
        });
      }

      const user = await User.findById(req.user!.id);
      if (!user) {
        return res.status(404).json({
          error: "User not found",
          message: "User does not exist",
        });
      }

      if (skillIndex < 0 || skillIndex >= user.skillsWanted.length) {
        return res.status(400).json({
          error: "Invalid index",
          message: "Skill index out of range",
        });
      }

      user.skillsWanted.splice(skillIndex, 1);
      await user.save();

      res.json({
        message: "Skill removed successfully",
      });
    } catch (error) {
      console.error("Remove wanted skill error:", error);
      res.status(500).json({
        error: "Failed to remove skill",
        message: "Internal server error",
      });
    }
  },
);

// Get public user profile
router.get("/:id", async (req, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "User does not exist",
      });
    }

    // Only return public profiles or basic info for private profiles
    if (!user.isPublic) {
      return res.json({
        user: {
          id: user._id,
          name: user.name,
          isPublic: false,
        },
      });
    }

    res.json({
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      error: "Failed to get user",
      message: "Internal server error",
    });
  }
});

// Optional authentication middleware - adds user info if token is present
const optionalAuth = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback-secret",
      ) as any;
      req.user = { id: decoded.userId, email: decoded.email };
    } catch (error) {
      // Token is invalid but don't fail the request
    }
  }

  next();
};

// Search users by skills
router.get("/", optionalAuth, async (req: any, res: Response) => {
  try {
    const { skill, location, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // Development mode without database - return mock users
    if (req.noDatabaseConnection) {
      const mockUsers = [
        {
          _id: "mock-user-1",
          name: "Sarah Johnson",
          email: "sarah@example.com",
          location: "San Francisco, CA",
          profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah`,
          skillsOffered: [
            {
              skill: "React Development",
              description: "Advanced React patterns and hooks",
              isApproved: true,
            },
            {
              skill: "UI/UX Design",
              description: "User interface and experience design",
              isApproved: true,
            },
          ],
          skillsWanted: [
            {
              skill: "Photography",
              description: "Portrait and landscape photography",
            },
            {
              skill: "Spanish Language",
              description: "Conversational Spanish",
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
          profileCompleted: true,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          _id: "mock-user-2",
          name: "Mike Chen",
          email: "mike@example.com",
          location: "New York, NY",
          profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=Mike`,
          skillsOffered: [
            {
              skill: "Photography",
              description: "Professional photography and editing",
              isApproved: true,
            },
            {
              skill: "Guitar",
              description: "Acoustic and electric guitar lessons",
              isApproved: true,
            },
          ],
          skillsWanted: [
            {
              skill: "Web Development",
              description: "Full-stack web development",
            },
            {
              skill: "Digital Marketing",
              description: "Social media and content marketing",
            },
          ],
          availability: {
            weekdays: false,
            weekends: true,
            mornings: true,
            afternoons: false,
            evenings: true,
          },
          isPublic: true,
          profileCompleted: true,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          _id: "mock-user-3",
          name: "Emma Rodriguez",
          email: "emma@example.com",
          location: "Austin, TX",
          profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=Emma`,
          skillsOffered: [
            {
              skill: "Spanish Language",
              description: "Native Spanish speaker and tutor",
              isApproved: true,
            },
            {
              skill: "Cooking",
              description: "Traditional and modern cuisine",
              isApproved: true,
            },
          ],
          skillsWanted: [
            {
              skill: "Programming",
              description: "Python and JavaScript programming",
            },
            { skill: "Graphic Design", description: "Logo and brand design" },
          ],
          availability: {
            weekdays: true,
            weekends: true,
            mornings: true,
            afternoons: false,
            evenings: false,
          },
          isPublic: true,
          profileCompleted: true,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          _id: "mock-user-4",
          name: "Alex Thompson",
          email: "alex@example.com",
          location: "Seattle, WA",
          profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=Alex`,
          skillsOffered: [
            {
              skill: "Digital Marketing",
              description: "SEO, SEM, and social media marketing",
              isApproved: true,
            },
            {
              skill: "Content Writing",
              description: "Blog posts and copywriting",
              isApproved: true,
            },
          ],
          skillsWanted: [
            {
              skill: "Video Editing",
              description: "Professional video production",
            },
            {
              skill: "Music Production",
              description: "Audio recording and mixing",
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
          profileCompleted: true,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          _id: "mock-user-5",
          name: "Jordan Kim",
          email: "jordan@example.com",
          location: "Los Angeles, CA",
          profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan`,
          skillsOffered: [
            {
              skill: "Video Editing",
              description: "Professional video production and editing",
              isApproved: true,
            },
            {
              skill: "Animation",
              description: "2D and motion graphics animation",
              isApproved: true,
            },
          ],
          skillsWanted: [
            {
              skill: "Data Science",
              description: "Python data analysis and machine learning",
            },
            {
              skill: "Public Speaking",
              description: "Presentation and communication skills",
            },
          ],
          availability: {
            weekdays: false,
            weekends: true,
            mornings: false,
            afternoons: true,
            evenings: true,
          },
          isPublic: true,
          profileCompleted: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ];

      // Filter by skill if provided
      let filteredUsers = mockUsers;
      if (skill) {
        filteredUsers = mockUsers.filter((user) =>
          user.skillsOffered.some((s) =>
            s.skill.toLowerCase().includes(skill.toLowerCase()),
          ),
        );
      }

      // Filter by location if provided
      if (location) {
        filteredUsers = filteredUsers.filter((user) =>
          user.location.toLowerCase().includes(location.toLowerCase()),
        );
      }

      // Exclude current user if authenticated
      if (req.user && req.user.id && req.user.id !== "admin-user-fixed") {
        filteredUsers = filteredUsers.filter(
          (user) => user._id !== req.user.id,
        );
      }

      // Pagination
      const skip = (pageNum - 1) * limitNum;
      const paginatedUsers = filteredUsers.slice(skip, skip + limitNum);

      return res.json({
        users: paginatedUsers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: filteredUsers.length,
          pages: Math.ceil(filteredUsers.length / limitNum),
        },
      });
    }

    const query: any = { isPublic: true, profileCompleted: true };

    // Exclude current user if authenticated
    if (req.user && req.user.id) {
      query._id = { $ne: req.user.id };
    }

    if (skill) {
      query["skillsOffered.skill"] = {
        $regex: skill,
        $options: "i",
      };
    }

    if (location) {
      query.location = {
        $regex: location,
        $options: "i",
      };
    }

    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .select("-password")
      .limit(limitNum)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({
      error: "Failed to search users",
      message: "Internal server error",
    });
  }
});

export { router as userRoutes };
