import { Router, Response } from "express";
import { User } from "../models/User";
import { optionalAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Browse users by skills
router.get(
  "/browse",
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        skill,
        location,
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const currentUserId = req.user?.id;

      // Build query
      const query: any = {
        isPublic: true,
        profileCompleted: true,
      };

      // Exclude current user from results
      if (currentUserId) {
        query._id = { $ne: currentUserId };
      }

      // Filter by skill
      if (skill && typeof skill === "string") {
        query["skillsOffered.skill"] = {
          $regex: skill,
          $options: "i",
        };
      }

      // Filter by location
      if (location && typeof location === "string") {
        query.location = {
          $regex: location,
          $options: "i",
        };
      }

      // Pagination
      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
      const skip = (pageNum - 1) * limitNum;

      // Sorting
      const sortOptions: any = {};
      const validSortFields = ["createdAt", "rating", "totalExchanges", "name"];
      const sortField = validSortFields.includes(sortBy as string)
        ? (sortBy as string)
        : "createdAt";
      const order = sortOrder === "asc" ? 1 : -1;
      sortOptions[sortField] = order;

      // Execute query
      const users = await User.find(query)
        .select(
          "-password -email -availability -role -profileCompleted -createdAt -updatedAt",
        )
        .limit(limitNum)
        .skip(skip)
        .sort(sortOptions);

      const total = await User.countDocuments(query);

      // Get all unique skills for filtering
      const allSkills = await User.aggregate([
        { $match: { isPublic: true, profileCompleted: true } },
        { $unwind: "$skillsOffered" },
        {
          $group: {
            _id: "$skillsOffered.skill",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 100 },
      ]);

      // Get all unique locations
      const allLocations = await User.aggregate([
        {
          $match: {
            isPublic: true,
            profileCompleted: true,
            location: { $ne: "" },
          },
        },
        {
          $group: {
            _id: "$location",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 50 },
      ]);

      res.json({
        users: users.map((user) => ({
          ...user.toJSON(),
          canContact: currentUserId && currentUserId !== user._id.toString(),
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1,
        },
        filters: {
          skills: allSkills.map((s) => ({
            name: s._id,
            count: s.count,
          })),
          locations: allLocations.map((l) => ({
            name: l._id,
            count: l.count,
          })),
        },
      });
    } catch (error) {
      console.error("Browse skills error:", error);
      res.status(500).json({
        error: "Failed to browse skills",
        message: "Internal server error",
      });
    }
  },
);

// Get popular skills
router.get("/popular", async (req, res: Response) => {
  try {
    const { limit = 20 } = req.query;
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));

    const popularSkills = await User.aggregate([
      { $match: { isPublic: true, profileCompleted: true } },
      { $unwind: "$skillsOffered" },
      {
        $group: {
          _id: "$skillsOffered.skill",
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" },
          totalExchanges: { $sum: "$totalExchanges" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limitNum },
    ]);

    res.json({
      skills: popularSkills.map((skill) => ({
        name: skill._id,
        userCount: skill.count,
        averageRating: Math.round((skill.avgRating || 0) * 10) / 10,
        totalExchanges: skill.totalExchanges || 0,
      })),
    });
  } catch (error) {
    console.error("Get popular skills error:", error);
    res.status(500).json({
      error: "Failed to get popular skills",
      message: "Internal server error",
    });
  }
});

// Search skills by name
router.get("/search", async (req, res: Response) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({
        error: "Invalid query",
        message: "Search query is required",
      });
    }

    const limitNum = Math.min(20, Math.max(1, parseInt(limit as string)));

    const skills = await User.aggregate([
      { $match: { isPublic: true, profileCompleted: true } },
      { $unwind: "$skillsOffered" },
      {
        $match: {
          "skillsOffered.skill": {
            $regex: q,
            $options: "i",
          },
        },
      },
      {
        $group: {
          _id: "$skillsOffered.skill",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limitNum },
    ]);

    res.json({
      skills: skills.map((skill) => ({
        name: skill._id,
        userCount: skill.count,
      })),
    });
  } catch (error) {
    console.error("Search skills error:", error);
    res.status(500).json({
      error: "Failed to search skills",
      message: "Internal server error",
    });
  }
});

// Get skill details with available users
router.get(
  "/:skillName",
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { skillName } = req.params;
      const { location, page = 1, limit = 20 } = req.query;
      const currentUserId = req.user?.id;

      const query: any = {
        isPublic: true,
        profileCompleted: true,
        "skillsOffered.skill": {
          $regex: `^${skillName}$`,
          $options: "i",
        },
      };

      // Exclude current user
      if (currentUserId) {
        query._id = { $ne: currentUserId };
      }

      // Filter by location
      if (location && typeof location === "string") {
        query.location = {
          $regex: location,
          $options: "i",
        };
      }

      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
      const skip = (pageNum - 1) * limitNum;

      const users = await User.find(query)
        .select(
          "-password -email -availability -role -profileCompleted -createdAt -updatedAt",
        )
        .limit(limitNum)
        .skip(skip)
        .sort({ rating: -1, totalExchanges: -1 });

      const total = await User.countDocuments(query);

      // Get skill statistics
      const skillStats = await User.aggregate([
        {
          $match: {
            isPublic: true,
            profileCompleted: true,
            "skillsOffered.skill": {
              $regex: `^${skillName}$`,
              $options: "i",
            },
          },
        },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            avgRating: { $avg: "$rating" },
            totalExchanges: { $sum: "$totalExchanges" },
          },
        },
      ]);

      const stats = skillStats[0] || {
        totalUsers: 0,
        avgRating: 0,
        totalExchanges: 0,
      };

      res.json({
        skill: {
          name: skillName,
          totalUsers: stats.totalUsers,
          averageRating: Math.round((stats.avgRating || 0) * 10) / 10,
          totalExchanges: stats.totalExchanges || 0,
        },
        users: users.map((user) => ({
          ...user.toJSON(),
          canContact: currentUserId && currentUserId !== user._id.toString(),
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1,
        },
      });
    } catch (error) {
      console.error("Get skill details error:", error);
      res.status(500).json({
        error: "Failed to get skill details",
        message: "Internal server error",
      });
    }
  },
);

export { router as skillRoutes };
