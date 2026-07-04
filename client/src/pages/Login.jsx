import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getErrorMessage } from "../api/getErrorMessage.js";

const ROLES = [
  { value: "student", label: "Student" },
  { value: "recruiter", label: "Recruiter" },
  { value: "admin", label: "Admin" },
];

const dashboardForRole = (role) => {
  if (role === "recruiter") return "/recruiter/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/student/dashboard";
};

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const loggedInUser = await login({ ...form, role });
      showToast(`Welcome back, ${loggedInUser.name.split(" ")[0]}!`);
      const redirectTo = location.state?.from?.pathname || dashboardForRole(loggedInUser.role);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Login failed. Please check your credentials."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md p-8">
        <h1 className="font-display font-bold text-2xl text-ink text-center">Welcome back</h1>
        <p className="text-muted text-sm text-center mt-1">Log in to continue to CampusHire</p>

        <div className="flex gap-2 mt-6">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                role === r.value
                  ? "bg-orange text-white border-orange"
                  : "bg-transparent text-ink2 border-border2 hover:border-orange hover:text-orange"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-ink2 block mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input-field"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink2 block mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="input-field"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-coral text-sm">{error}</p>}

          <button type="submit" disabled={submitting} className="btn btn-primary btn-lg justify-center mt-2">
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        {role === "student" && (
          <p className="text-center text-sm text-muted mt-5">
            New here?{" "}
            <Link to="/register" className="text-orange font-semibold">
              Create an account
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
