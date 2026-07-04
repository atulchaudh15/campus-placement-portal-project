import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";
import { sendSuccess, sendError } from "../utils/response.js";

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  college: user.college,
  branch: user.branch,
  year: user.year,
  skills: user.skills,
  resumeUrl: user.resumeUrl,
  company: user.company,
});

// @route POST /api/auth/register
// @desc  Student self-registration (recruiter & admin accounts are seeded/created by admin)
export const registerStudent = async (req, res) => {
  try {
    const { name, email, password, phone, college, branch, year } = req.body;

    if (!name || !email || !password) {
      return sendError(res, "Name, email and password are required", 400);
    }
    if (password.length < 6) {
      return sendError(res, "Password must be at least 6 characters", 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return sendError(res, "An account with this email already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "student",
      phone: phone || "",
      college: college || "",
      branch: branch || "",
      year: year || "",
    });

    const token = generateToken(newUser);

    return sendSuccess(
      res,
      "Registration successful",
      { token, user: publicUser(newUser) },
      201
    );
  } catch (error) {
    console.error("registerStudent error:", error);
    return sendError(res, "Server error during registration");
  }
};

// @route POST /api/auth/login
// @desc  Role-aware login for student, recruiter, or admin
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return sendError(res, "Email, password and role are required", 400);
    }

    if (!["student", "recruiter", "admin"].includes(role)) {
      return sendError(res, "Invalid role selected", 400);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !user.isActive) {
      return sendError(res, "Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, "Invalid credentials", 401);
    }

    if (user.role !== role) {
      return sendError(res, `No ${role} account found with these credentials`, 401);
    }

    const token = generateToken(user);

    return sendSuccess(res, "Login successful", { token, user: publicUser(user) });
  } catch (error) {
    console.error("login error:", error);
    return sendError(res, "Server error during login");
  }
};

// @route GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    return sendSuccess(res, "Current user fetched", { user: publicUser(req.user) });
  } catch (error) {
    console.error("getMe error:", error);
    return sendError(res, "Server error");
  }
};

// @route POST /api/auth/logout
// @desc  Stateless JWT logout — client discards the token. Endpoint kept for a
//        consistent API surface and as a place to hook in token blacklisting later.
export const logout = async (req, res) => {
  return sendSuccess(res, "Logged out successfully");
};
