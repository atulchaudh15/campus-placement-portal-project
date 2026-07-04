import express from "express";
import {
  getJobs,
  getMyJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from "../controllers/job.controller.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", getJobs);

// Recruiter — must come before "/:id" to avoid route collision
router.get("/my", protect, authorize("recruiter"), getMyJobs);
router.post("/", protect, authorize("recruiter"), createJob);
router.put("/:id", protect, authorize("recruiter", "admin"), updateJob);
router.delete("/:id", protect, authorize("recruiter", "admin"), deleteJob);

// Public
router.get("/:id", getJobById);

export default router;
