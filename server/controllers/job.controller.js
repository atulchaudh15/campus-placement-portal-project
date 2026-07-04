import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { escapeRegex } from "../utils/escapeRegex.js";

const JOB_TYPES = ["it", "core", "finance", "internship", "other"];
const JOB_STATUSES = ["open", "closed"];

// @route GET /api/jobs (public)
// @desc  List jobs with optional search (?q=) and type filter (?type=it)
export const getJobs = async (req, res) => {
  try {
    const { q, type, status } = req.query;
    const filter = {};

    // Whitelist enum-like query params instead of trusting raw input —
    // req.query can contain nested objects (e.g. ?status[$ne]=x), so only
    // plain strings that match a known value are accepted.
    if (typeof type === "string" && JOB_TYPES.includes(type)) filter.type = type;
    filter.status = typeof status === "string" && JOB_STATUSES.includes(status) ? status : "open";

    if (q && typeof q === "string") {
      const safe = escapeRegex(q.trim()).slice(0, 100);
      if (safe) {
        filter.$or = [
          { title: { $regex: safe, $options: "i" } },
          { description: { $regex: safe, $options: "i" } },
          { skillsRequired: { $regex: safe, $options: "i" } },
        ];
      }
    }

    const jobs = await Job.find(filter)
      .populate("company", "name logoUrl industry")
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    return sendSuccess(res, "Jobs fetched", { jobs });
  } catch (error) {
    console.error("getJobs error:", error);
    return sendError(res, "Server error fetching jobs");
  }
};

// @route GET /api/jobs/my (recruiter — jobs they posted)
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .populate("company", "name logoUrl")
      .sort({ createdAt: -1 });

    const jobIds = jobs.map((j) => j._id);
    const counts = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: "$job", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));

    const jobsWithCounts = jobs.map((j) => ({
      ...j.toObject(),
      applicantCount: countMap[String(j._id)] || 0,
    }));

    return sendSuccess(res, "Your jobs fetched", { jobs: jobsWithCounts });
  } catch (error) {
    console.error("getMyJobs error:", error);
    return sendError(res, "Server error fetching your jobs");
  }
};

// @route GET /api/jobs/:id (public)
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("company", "name logoUrl industry website description")
      .populate("postedBy", "name email");
    if (!job) return sendError(res, "Job not found", 404);
    return sendSuccess(res, "Job fetched", { job });
  } catch (error) {
    console.error("getJobById error:", error);
    return sendError(res, "Server error fetching job");
  }
};

// @route POST /api/jobs (recruiter only)
export const createJob = async (req, res) => {
  try {
    const { title, company, description, ctc, location, type, skillsRequired } = req.body;

    if (!title || !company) {
      return sendError(res, "Title and company are required", 400);
    }

    const job = await Job.create({
      title,
      company,
      description,
      ctc,
      location,
      type,
      skillsRequired: Array.isArray(skillsRequired)
        ? skillsRequired
        : String(skillsRequired || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
      postedBy: req.user._id,
    });

    const populated = await job.populate("company", "name logoUrl");
    return sendSuccess(res, "Job created successfully", { job: populated }, 201);
  } catch (error) {
    console.error("createJob error:", error);
    return sendError(res, "Server error creating job");
  }
};

// @route PUT /api/jobs/:id (recruiter — owner only)
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return sendError(res, "Job not found", 404);

    if (String(job.postedBy) !== String(req.user._id) && req.user.role !== "admin") {
      return sendError(res, "You can only edit jobs you posted", 403);
    }

    const editableFields = [
      "title",
      "company",
      "description",
      "ctc",
      "location",
      "type",
      "status",
    ];
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    });

    if (req.body.skillsRequired !== undefined) {
      job.skillsRequired = Array.isArray(req.body.skillsRequired)
        ? req.body.skillsRequired
        : String(req.body.skillsRequired)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }

    await job.save();
    const populated = await job.populate("company", "name logoUrl");
    return sendSuccess(res, "Job updated successfully", { job: populated });
  } catch (error) {
    console.error("updateJob error:", error);
    return sendError(res, "Server error updating job");
  }
};

// @route DELETE /api/jobs/:id (recruiter — owner only)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return sendError(res, "Job not found", 404);

    if (String(job.postedBy) !== String(req.user._id) && req.user.role !== "admin") {
      return sendError(res, "You can only delete jobs you posted", 403);
    }

    await Application.deleteMany({ job: job._id });
    await job.deleteOne();

    return sendSuccess(res, "Job deleted successfully");
  } catch (error) {
    console.error("deleteJob error:", error);
    return sendError(res, "Server error deleting job");
  }
};
