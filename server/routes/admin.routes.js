import express from "express";
import {
  getStats,
  getUsers,
  createUser,
  setUserStatus,
  deleteUser,
  getAllJobs,
  deleteJobAsAdmin,
} from "../controllers/admin.controller.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/stats", getStats);

router.get("/users", getUsers);
router.post("/users", createUser);
router.patch("/users/:id/status", setUserStatus);
router.delete("/users/:id", deleteUser);

router.get("/jobs", getAllJobs);
router.delete("/jobs/:id", deleteJobAsAdmin);

export default router;
