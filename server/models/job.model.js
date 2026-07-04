import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    ctc: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["it", "core", "finance", "internship", "other"],
      default: "other",
    },
    skillsRequired: [{ type: String }],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

// Matches the actual query patterns used in job.controller.js
jobSchema.index({ status: 1, type: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ company: 1 });

const Job = mongoose.model("Job", jobSchema);

export default Job;
