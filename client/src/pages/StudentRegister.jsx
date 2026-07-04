import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getErrorMessage } from "../api/getErrorMessage.js";

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  college: "",
  branch: "",
  year: "",
};

const StudentRegister = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("Name, email and password are required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const newUser = await register(form);
      showToast(`Welcome to CampusHire, ${newUser.name.split(" ")[0]}!`);
      navigate("/student/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-lg p-8">
        <h1 className="font-display font-bold text-2xl text-ink text-center">
          Create your student account
        </h1>
        <p className="text-muted text-sm text-center mt-1">
          Start applying to placement opportunities in minutes
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-ink2 block mb-1.5">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="input-field" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-ink2 block mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-ink2 block mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink2 block mb-1.5">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink2 block mb-1.5">College</label>
            <input name="college" value={form.college} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink2 block mb-1.5">Branch</label>
            <input name="branch" value={form.branch} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink2 block mb-1.5">Year</label>
            <input name="year" value={form.year} onChange={handleChange} className="input-field" />
          </div>

          {error && <p className="text-coral text-sm md:col-span-2">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg justify-center mt-2 md:col-span-2"
          >
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-orange font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default StudentRegister;
