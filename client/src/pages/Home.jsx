import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const dashboardForRole = (role) => {
  if (role === "recruiter") return "/recruiter/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/student/dashboard";
};

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      <section className="px-6 py-20 max-w-4xl mx-auto text-center">
        <h1 className="font-display font-bold text-4xl md:text-5xl text-ink leading-tight">
          Your campus placement journey, <span className="text-orange">simplified</span>.
        </h1>
        <p className="text-muted mt-5 text-lg max-w-2xl mx-auto">
          Browse verified job openings, track every application, and manage your placement
          journey end-to-end — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
          <Link to="/jobs" className="btn btn-primary btn-lg">
            Browse Jobs
          </Link>
          {!user && (
            <Link to="/register" className="btn btn-outline btn-lg">
              Get Started
            </Link>
          )}
          {user && (
            <Link to={dashboardForRole(user.role)} className="btn btn-outline btn-lg">
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>

      <section className="px-6 pb-20 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="font-display font-semibold text-lg mb-2">For Students</h3>
          <p className="text-muted text-sm">
            Build your profile, upload your resume, and apply to jobs that match your skills.
          </p>
        </div>
        <div className="card p-6">
          <h3 className="font-display font-semibold text-lg mb-2">For Recruiters</h3>
          <p className="text-muted text-sm">
            Post openings, review applicants, and manage your hiring pipeline effortlessly.
          </p>
        </div>
        <div className="card p-6">
          <h3 className="font-display font-semibold text-lg mb-2">For Admins</h3>
          <p className="text-muted text-sm">
            Oversee the whole platform — users, jobs, and companies — from a single dashboard.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
