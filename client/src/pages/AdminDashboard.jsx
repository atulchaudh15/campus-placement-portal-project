import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { getErrorMessage } from "../api/getErrorMessage.js";
import { useToast } from "../context/ToastContext.jsx";

const TABS = ["Overview", "Users", "Jobs", "Companies"];

const AdminDashboard = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("Overview");

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [companyForm, setCompanyForm] = useState({ name: "", industry: "", website: "", description: "" });
  const [creatingCompany, setCreatingCompany] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, jobsRes, companiesRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/jobs"),
        api.get("/companies"),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data.users);
      setJobs(jobsRes.data.data.jobs);
      setCompanies(companiesRes.data.data.companies);
    } catch (err) {
      showToast(getErrorMessage(err, "Could not load admin data."), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleUserStatus = async (user) => {
    try {
      await api.patch(`/admin/users/${user._id}/status`, { isActive: !user.isActive });
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isActive: !u.isActive } : u))
      );
      showToast(`${user.name} ${!user.isActive ? "activated" : "deactivated"}.`);
    } catch (err) {
      showToast(getErrorMessage(err, "Could not update user status."), "error");
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${user._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
      showToast("User deleted.");
    } catch (err) {
      showToast(getErrorMessage(err, "Could not delete user."), "error");
    }
  };

  const handleDeleteJob = async (job) => {
    if (!window.confirm(`Delete "${job.title}"? This also removes its applications.`)) return;
    try {
      await api.delete(`/admin/jobs/${job._id}`);
      setJobs((prev) => prev.filter((j) => j._id !== job._id));
      showToast("Job deleted.");
    } catch (err) {
      showToast(getErrorMessage(err, "Could not delete job."), "error");
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!companyForm.name) {
      showToast("Company name is required.", "error");
      return;
    }
    setCreatingCompany(true);
    try {
      const res = await api.post("/companies", companyForm);
      setCompanies((prev) => [...prev, res.data.data.company]);
      setCompanyForm({ name: "", industry: "", website: "", description: "" });
      showToast("Company added.");
    } catch (err) {
      showToast(getErrorMessage(err, "Could not create company."), "error");
    } finally {
      setCreatingCompany(false);
    }
  };

  const handleDeleteCompany = async (company) => {
    if (!window.confirm(`Delete ${company.name}?`)) return;
    try {
      await api.delete(`/companies/${company._id}`);
      setCompanies((prev) => prev.filter((c) => c._id !== company._id));
      showToast("Company deleted.");
    } catch (err) {
      showToast(getErrorMessage(err, "Could not delete company. It may have jobs linked to it."), "error");
    }
  };

  if (loading) return <p className="text-muted text-center py-16">Loading admin dashboard...</p>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="font-display font-bold text-3xl text-ink">Admin Dashboard</h1>
      <p className="text-muted mt-1">Manage users, jobs, and companies across the platform.</p>

      <div className="flex gap-2 mt-6 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn btn-sm ${activeTab === tab ? "btn-primary" : "btn-outline"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
          {[
            { label: "Students", value: stats.studentCount },
            { label: "Recruiters", value: stats.recruiterCount },
            { label: "Jobs", value: stats.jobCount },
            { label: "Companies", value: stats.companyCount },
            { label: "Applications", value: stats.applicationCount },
          ].map((s) => (
            <div key={s.label} className="card p-5 text-center">
              <p className="font-display font-bold text-2xl text-orange">{s.value}</p>
              <p className="text-muted text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Users" && (
        <div className="flex flex-col gap-3 mt-8">
          {users.map((u) => (
            <div key={u._id} className="card p-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink">{u.name}</p>
                  <span className="badge badge-orange capitalize">{u.role}</span>
                  {!u.isActive && <span className="badge badge-coral">Inactive</span>}
                </div>
                <p className="text-muted text-sm">{u.email}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleToggleUserStatus(u)} className="btn btn-outline btn-sm">
                  {u.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleDeleteUser(u)}
                  className="btn btn-outline btn-sm !text-coral !border-coral hover:!bg-coral-s"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Jobs" && (
        <div className="flex flex-col gap-3 mt-8">
          {jobs.map((job) => (
            <div key={job._id} className="card p-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink">{job.title}</p>
                  <span className={`badge ${job.status === "open" ? "badge-green" : "badge-coral"}`}>
                    {job.status}
                  </span>
                </div>
                <p className="text-muted text-sm">
                  {job.company?.name} · Posted by {job.postedBy?.name}
                </p>
              </div>
              <button
                onClick={() => handleDeleteJob(job)}
                className="btn btn-outline btn-sm !text-coral !border-coral hover:!bg-coral-s"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Companies" && (
        <div className="mt-8">
          <form onSubmit={handleCreateCompany} className="card p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="input-field"
              placeholder="Company name"
              value={companyForm.name}
              onChange={(e) => setCompanyForm((p) => ({ ...p, name: e.target.value }))}
            />
            <input
              className="input-field"
              placeholder="Industry"
              value={companyForm.industry}
              onChange={(e) => setCompanyForm((p) => ({ ...p, industry: e.target.value }))}
            />
            <input
              className="input-field md:col-span-2"
              placeholder="Website"
              value={companyForm.website}
              onChange={(e) => setCompanyForm((p) => ({ ...p, website: e.target.value }))}
            />
            <textarea
              className="input-field md:col-span-2"
              placeholder="Description"
              rows={2}
              value={companyForm.description}
              onChange={(e) => setCompanyForm((p) => ({ ...p, description: e.target.value }))}
            />
            <button type="submit" disabled={creatingCompany} className="btn btn-primary md:col-span-2">
              {creatingCompany ? "Adding..." : "Add Company"}
            </button>
          </form>

          <div className="flex flex-col gap-3 mt-6">
            {companies.map((c) => (
              <div key={c._id} className="card p-4 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold text-ink">{c.name}</p>
                  <p className="text-muted text-sm">{c.industry}</p>
                </div>
                <button
                  onClick={() => handleDeleteCompany(c)}
                  className="btn btn-outline btn-sm !text-coral !border-coral hover:!bg-coral-s"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
