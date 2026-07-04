import express from "express";
import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../controllers/company.controller.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCompanies);
router.get("/:id", getCompanyById);

router.post("/", protect, authorize("admin"), createCompany);
router.put("/:id", protect, authorize("admin"), updateCompany);
router.delete("/:id", protect, authorize("admin"), deleteCompany);

export default router;
