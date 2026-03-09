import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiCalendar, FiClipboard, FiUser, FiLogOut, FiMenu, FiX, FiBell, FiAward, FiMessageSquare } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { path: "/student/dashboard", label: "Dashboard", icon: <FiHome /> },
    { path: "/events", label: "Events", icon: <FiCalendar /> },
    { path: "/my-registrations", label: "Registrations", icon: <FiClipboard /> },
    { path: "/notifications", label: "Notifications", icon: <FiBell /> },
    { path: "/certificates", label: "Certificates", icon: <FiAward /> },
    { path: "/feedback", label: "Feedback", icon: <FiMessageSquare /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-campus-dark text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/student/dashboard" className="text-xl font-bold flex items-center gap-2">
            🎓 CampusHive
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive(link.path)
                    ? "bg-white/20 text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-campus-accent rounded-full flex items-center justify-center text-sm font-bold">
                {user?.firstName?.[0] || "U"}
              </div>
              <span className="text-sm">{user?.firstName || "User"}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-campus-accent/20 hover:bg-campus-accent px-3 py-1.5 rounded-lg text-sm transition"
            >
              <FiLogOut /> Logout
            </button>
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
                  isActive(link.path) ? "bg-white/20" : "hover:bg-white/10"
                }`}
              >
                {link.icon} {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-red-300 hover:bg-white/10 w-full"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;