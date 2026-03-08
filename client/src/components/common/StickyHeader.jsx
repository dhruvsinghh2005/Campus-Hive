import { FiSearch, FiSun, FiMoon, FiBell, FiChevronRight } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

const StickyHeader = ({ breadcrumbs = [] }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  return (
    <div
      className="sticky top-4 z-30 mx-4 mb-6"
    >
      <div
        className="nm-flat flex items-center justify-between gap-4 px-5 py-3"
        style={{ borderRadius: "24px" }}
      >
        {/* Breadcrumbs */}
        <div className="hidden sm:flex items-center gap-1 text-sm flex-shrink-0" style={{ color: "var(--nm-text-secondary)" }}>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <FiChevronRight className="text-xs" />}
              <span className={i === breadcrumbs.length - 1 ? "font-semibold" : ""} style={{ color: i === breadcrumbs.length - 1 ? "var(--nm-text)" : undefined }}>
                {crumb}
              </span>
            </span>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-72">
          <div className="nm-inset flex items-center gap-2 px-3 py-2">
            <FiSearch className="text-sm flex-shrink-0" style={{ color: "var(--nm-text-secondary)" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-transparent text-sm outline-none w-full"
              style={{ color: "var(--nm-text)" }}
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="nm-button w-9 h-9 flex items-center justify-center"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <FiSun className="text-amber-400 animate-glow-pulse" />
            ) : (
              <FiMoon className="text-indigo-500" />
            )}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button className="nm-button w-9 h-9 flex items-center justify-center">
              <FiBell style={{ color: "var(--nm-text-secondary)" }} />
            </button>
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 animate-pulse"
              style={{ borderColor: "var(--nm-bg)" }}
            />
          </div>

          {/* User Avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #a78bfa)" }}
          >
            {user?.firstName?.[0] || "U"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyHeader;
