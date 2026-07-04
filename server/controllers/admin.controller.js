import User from "../models/user.model.js";
import Job from "../models/job.model.js";
import Company from "../models/company.model.js";
import Application from "../models/application.model.js";
import bcrypt from "bcryptjs";
import { sendSuccess, sendError } from "../utils/response.js";

// @route GET /api/admin/stats
export const getStats = async (req, res) => {
  try {
    const [studentCount, recruiterCount, jobCount, companyCount, applicationCount] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "recruiter" }),
        Job.countDocuments(),
        Company.countDocuments(),
        Application.countDocuments(),
      ]);

    return sendSuccess(res, "Stats fetched", {
      studentCount,
      recruiterCount,
      jobCount,
      companyCount,
      applicationCount,
    });
  } catch (error) {
    console.error("getStats error:", error);
    return sendError(res, "Server error fetching stats");
  }
};

const VALID_ROLES = ["student", "recruiter", "admin"];

// @route GET /api/admin/users (optional ?role=student)
export const getUsers = async (req, res) => {
  try {
    const filter = {};
    const { role } = req.query;
    if (typeof role === "string" && VALID_ROLES.includes(role)) filter.role = role;

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    return sendSuccess(res, "Users fetched", { users });
  } catch (error) {
    console.error("getUsers error:", error);
    return sendError(res, "Server error fetching users");
  }
};

// @route POST /api/admin/users (create a recruiter or admin account)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, company } = req.body;

    if (!name || !email || !password || !role) {
      return sendError(res, "Name, email, password and role are required", 400);
    }
    if (!["recruiter", "admin"].includes(role)) {
      return sendError(res, "Admins can only create recruiter or admin accounts here", 400);
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return sendError(res, "An account with this email already exists", 400);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      company: role === "recruiter" ? company : undefined,
    });

    const { password: _pw, ...safeUser } = user.toObject();
    return sendSuccess(res, `${role} account created`, { user: safeUser }, 201);
  } catch (error) {
    console.error("createUser error:", error);
    return sendError(res, "Server error creating user");
  }
};

// @route PATCH /api/admin/users/:id/status (activate/deactivate)
export const setUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: !!isActive },
      { new: true }
    ).select("-password");
    if (!user) return sendError(res, "User not found", 404);
    return sendSuccess(res, "User status updated", { user });
  } catch (error) {
    console.error("setUserStatus error:", error);
    return sendError(res, "Server error updating user status");
  }
};

// @route DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, "User not found", 404);

    if (user.role === "student") {
      await Application.deleteMany({ student: user._id });
    }
    if (user.role === "recruiter") {
      await Job.deleteMany({ postedBy: user._id });
    }

    await user.deleteOne();
    return sendSuccess(res, "User deleted successfully");
  } catch (error) {
    console.error("deleteUser error:", error);
    return sendError(res, "Server error deleting user");
  }
};

// @route GET /api/admin/jobs (all jobs, any status)
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("company", "name")
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });
    return sendSuccess(res, "All jobs fetched", { jobs });
  } catch (error) {
    console.error("getAllJobs error:", error);
    return sendError(res, "Server error fetching jobs");
  }
};

// @route DELETE /api/admin/jobs/:id
export const deleteJobAsAdmin = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return sendError(res, "Job not found", 404);

    await Application.deleteMany({ job: job._id });
    await job.deleteOne();

    return sendSuccess(res, "Job deleted successfully");
  } catch (error) {
    console.error("deleteJobAsAdmin error:", error);
    return sendError(res, "Server error deleting job");
  }
};
