import Company from "../models/company.model.js";
import Job from "../models/job.model.js";
import { sendSuccess, sendError } from "../utils/response.js";

// @route GET /api/companies (public)
export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    return sendSuccess(res, "Companies fetched", { companies });
  } catch (error) {
    console.error("getCompanies error:", error);
    return sendError(res, "Server error fetching companies");
  }
};

// @route GET /api/companies/:id (public)
export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return sendError(res, "Company not found", 404);
    return sendSuccess(res, "Company fetched", { company });
  } catch (error) {
    console.error("getCompanyById error:", error);
    return sendError(res, "Server error fetching company");
  }
};

// @route POST /api/companies (admin only)
export const createCompany = async (req, res) => {
  try {
    const { name, description, website, logoUrl, industry } = req.body;
    if (!name) return sendError(res, "Company name is required", 400);

    const existing = await Company.findOne({ name: name.trim() });
    if (existing) return sendError(res, "A company with this name already exists", 400);

    const company = await Company.create({
      name: name.trim(),
      description,
      website,
      logoUrl,
      industry,
      createdBy: req.user._id,
    });

    return sendSuccess(res, "Company created", { company }, 201);
  } catch (error) {
    console.error("createCompany error:", error);
    return sendError(res, "Server error creating company");
  }
};

// @route PUT /api/companies/:id (admin only)
export const updateCompany = async (req, res) => {
  try {
    const editableFields = ["name", "description", "website", "logoUrl", "industry"];
    const updates = {};
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const company = await Company.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!company) return sendError(res, "Company not found", 404);

    return sendSuccess(res, "Company updated", { company });
  } catch (error) {
    console.error("updateCompany error:", error);
    return sendError(res, "Server error updating company");
  }
};

// @route DELETE /api/companies/:id (admin only)
export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return sendError(res, "Company not found", 404);

    const jobCount = await Job.countDocuments({ company: company._id });
    if (jobCount > 0) {
      return sendError(
        res,
        `Cannot delete: ${jobCount} job(s) are linked to this company`,
        400
      );
    }

    await company.deleteOne();
    return sendSuccess(res, "Company deleted");
  } catch (error) {
    console.error("deleteCompany error:", error);
    return sendError(res, "Server error deleting company");
  }
};
