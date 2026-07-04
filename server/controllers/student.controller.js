import User from "../models/user.model.js";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";
import { sendSuccess, sendError } from "../utils/response.js";

const publicProfile = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  college: user.college,
  branch: user.branch,
  year: user.year,
  cgpa: user.cgpa,
  tenth: user.tenth,
  twelfth: user.twelfth,
  city: user.city,
  linkedin: user.linkedin,
  about: user.about,
  skills: user.skills,
  resumeUrl: user.resumeUrl,
  createdAt: user.createdAt,
});

// @route GET /api/students/profile
export const getProfile = async (req, res) => {
  try {
    return sendSuccess(res, "Profile fetched", { profile: publicProfile(req.user) });
  } catch (error) {
    console.error("getProfile error:", error);
    return sendError(res, "Server error fetching profile");
  }
};

// @route PUT /api/students/profile
export const updateProfile = async (req, res) => {
  try {
    const editableFields = [
      "name",
      "phone",
      "college",
      "branch",
      "year",
      "cgpa",
      "tenth",
      "twelfth",
      "city",
      "linkedin",
      "about",
    ];

    const updates = {};
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (req.body.skills !== undefined) {
      updates.skills = Array.isArray(req.body.skills)
        ? req.body.skills
        : String(req.body.skills)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return sendSuccess(res, "Profile updated successfully", { profile: publicProfile(user) });
  } catch (error) {
    console.error("updateProfile error:", error);
    return sendError(res, "Server error updating profile");
  }
};

const uploadResumeBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "campus-placement-resumes", resource_type: "raw", format: "pdf" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });

// @route POST /api/students/resume
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, "No resume file uploaded", 400);
    }
    if (!isCloudinaryConfigured) {
      return sendError(res, "File storage is not configured on the server", 500);
    }

    const resumeUrl = await uploadResumeBuffer(req.file.buffer);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { resumeUrl },
      { new: true }
    );

    return sendSuccess(res, "Resume uploaded successfully", { resumeUrl: user.resumeUrl });
  } catch (error) {
    console.error("uploadResume error:", error);
    return sendError(res, error.message || "Server error uploading resume");
  }
};
