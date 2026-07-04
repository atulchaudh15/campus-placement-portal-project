import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "recruiter", "admin"],
      default: "student",
    },

    // ── Student-only fields ──
    phone: { type: String, default: "" },
    college: { type: String, default: "" },
    branch: { type: String, default: "" },
    year: { type: String, default: "" },
    cgpa: { type: String, default: "" },
    tenth: { type: String, default: "" },
    twelfth: { type: String, default: "" },
    city: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    about: { type: String, default: "" },
    skills: [{ type: String }],
    resumeUrl: { type: String, default: "" },

    // ── Recruiter-only field ──
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
