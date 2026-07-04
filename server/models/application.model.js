import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    status: {
      type: String,
      enum: ["Applied", "In Review", "Interview", "Offered", "Rejected"],
      default: "Applied",
    },
  },
  { timestamps: true }
);

// A student can only apply once to the same job (also covers "my applications" lookups)
applicationSchema.index({ student: 1, job: 1 }, { unique: true });
// Covers "applicants for a job" lookups (job is the second field above, so it needs its own index)
applicationSchema.index({ job: 1 });

const Application = mongoose.model("Application", applicationSchema);

export default Application;
