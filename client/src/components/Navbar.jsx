import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const dashboardForRole = (role) => {
  if (role === "recruiter") return "/recruiter/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/student/dashboard";
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showToast("Logged out successfully");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <span className="dot">●</span>CampusHire
      </Link>
      <div className="menu flex items-center max-sm:flex-col max-sm:items-start">
        <Link to="/">Home</Link>
        <Link to="/jobs">Jobs</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>

        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="register">
              Register
            </Link>
          </>
        )}

        {user && (
          <>
            <Link to={dashboardForRole(user.role)}>Dashboard</Link>
            <button
              onClick={handleLogout}
              className="text-white ml-6 text-[15px] bg-transparent border-none cursor-pointer hover:text-[#ff6a00] transition-colors max-sm:ml-0 max-sm:my-2"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
