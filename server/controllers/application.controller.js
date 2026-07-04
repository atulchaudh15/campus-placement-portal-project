import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import { sendSuccess, sendError } from "../utils/response.js";

// @route POST /api/applications (student)
export const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return sendError(res, "jobId is required", 400);

    const job = await Job.findById(jobId);
    if (!job) return sendError(res, "Job not found", 404);
    if (job.status !== "open") return sendError(res, "This job is no longer accepting applications", 400);

    const existing = await Application.findOne({ student: req.user._id, job: jobId });
    if (existing) return sendError(res, "You have already applied to this job", 400);

    const application = await Application.create({
      student: req.user._id,
      job: jobId,
      status: "Applied",
    });

    const populated = await application.populate({
      path: "job",
      select: "title company ctc location",
      populate: { path: "company", select: "name logoUrl" },
    });

    return sendSuccess(res, "Application submitted successfully", { application: populated }, 201);
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, "You have already applied to this job", 400);
    }
    console.error("applyToJob error:", error);
    return sendError(res, "Server error submitting application");
  }
};

// @route GET /api/applications/my (student — their own applications)
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate({
        path: "job",
        select: "title company ctc location type status",
        populate: { path: "company", select: "name logoUrl" },
      })
      .sort({ createdAt: -1 });

    return sendSuccess(res, "Your applications fetched", { applications });
  } catch (error) {
    console.error("getMyApplications error:", error);
    return sendError(res, "Server error fetching applications");
  }
};

// @route GET /api/applications/job/:jobId (recruiter — applicants for a job they posted)
export const getApplicantsForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return sendError(res, "Job not found", 404);

    if (String(job.postedBy) !== String(req.user._id) && req.user.role !== "admin") {
      return sendError(res, "You can only view applicants for jobs you posted", 403);
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate("student", "name email phone college branch year skills resumeUrl")
      .sort({ createdAt: -1 });

    return sendSuccess(res, "Applicants fetched", { job: { id: job._id, title: job.title }, applications });
  } catch (error) {
    console.error("getApplicantsForJob error:", error);
    return sendError(res, "Server error fetching applicants");
  }
};

// @route PATCH /api/applications/:id/status (recruiter — accept/reject/update)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Applied", "In Review", "Interview", "Offered", "Rejected"];
    if (!validStatuses.includes(status)) {
      return sendError(res, `Status must be one of: ${validStatuses.join(", ")}`, 400);
    }

    const application = await Application.findById(req.params.id).populate("job");
    if (!application) return sendError(res, "Application not found", 404);

    if (String(application.job.postedBy) !== String(req.user._id) && req.user.role !== "admin") {
      return sendError(res, "You can only update applicants for jobs you posted", 403);
    }

    application.status = status;
    await application.save();

    return sendSuccess(res, "Application status updated", { application });
  } catch (error) {
    console.error("updateApplicationStatus error:", error);
    return sendError(res, "Server error updating application status");
  }
};
