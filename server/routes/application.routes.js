import express from "express";
import {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus,
} from "../controllers/application.controller.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("student"), applyToJob);
router.get("/my", protect, authorize("student"), getMyApplications);
router.get("/job/:jobId", protect, authorize("recruiter", "admin"), getApplicantsForJob);
router.patch("/:id/status", protect, authorize("recruiter", "admin"), updateApplicationStatus);

export default router;
