import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiPlusCircle, FiList, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const OrganizerNavbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { path: "/organizer/dashboard", label: "Dashboard", icon: <FiHome /> },
    { path: "/organizer/create-event", label: "Create Event", icon: <FiPlusCircle /> },
    { path: "/organizer/my-events", label: "My Events", icon: <FiList /> },
  ];

  const isActive = (path) => location.pathname === path;

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6 px-4 gap-3">
      {/* Brand */}
      <div className="nm-flat px-4 py-4 mb-2 text-center">
        <Link to="/organizer/dashboard" className="text-xl font-bold" style={{ fontFamily: "'General Sans', sans-serif", color: "var(--nm-text)" }}>
          🎓 CampusHive
        </Link>
        <p className="text-xs mt-1" style={{ color: "#a78bfa" }}>Organizer Portal</p>
      </div>

      {/* User card */}
      <div className="nm-inset px-4 py-3 flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #a78bfa)" }}
        >
          {user?.firstName?.[0] || "O"}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: "var(--nm-text)" }}>{user?.organizationName || user?.firstName || "Organizer"}</p>
          <p className="text-xs truncate" style={{ color: "var(--nm-text-secondary)" }}>Organizer</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-2 flex-1">
        {navLinks.map((link, i) => (
          <motion.div
            key={link.path}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive(link.path) ? "nm-inset" : "nm-button"
              }`}
              style={{ color: isActive(link.path) ? "#8b5cf6" : "var(--nm-text)" }}
            >
              <span className={`text-base ${isActive(link.path) ? "text-violet-500" : ""}`}>
                {link.icon}
              </span>
              {link.label}
            </Link>
          </motion.div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="flex flex-col gap-2 mt-2">
        <button
          onClick={toggleTheme}
          className="nm-button flex items-center gap-3 px-4 py-3 text-sm font-medium w-full"
          style={{ color: "var(--nm-text)" }}
        >
          {theme === "dark" ? "☀️" : "🌙"} {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
        <button
          onClick={handleLogout}
          className="nm-button flex items-center gap-3 px-4 py-3 text-sm font-medium w-full text-rose-500"
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col w-72 flex-shrink-0 sticky top-0 h-screen overflow-y-auto"
        style={{ background: "var(--nm-bg)" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 nm-button w-10 h-10 flex items-center justify-center"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <FiX style={{ color: "var(--nm-text)" }} /> : <FiMenu style={{ color: "var(--nm-text)" }} />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-72 overflow-y-auto"
              style={{ background: "var(--nm-bg)" }}
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default OrganizerNavbar;