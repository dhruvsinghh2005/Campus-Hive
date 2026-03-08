import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiClipboard, FiAward, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";
import StickyHeader from "../../components/common/StickyHeader";
import useCountUp from "../../hooks/useCountUp";

const StatCard = ({ icon, label, value, color, delay }) => {
  const count = useCountUp(value, 800);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="nm-flat-hover p-6"
    >
      <div className="flex items-start justify-between">
        <div
          className="nm-inset w-12 h-12 flex items-center justify-center text-xl animate-float-bob"
          style={{ color }}
        >
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold" style={{ color: "var(--nm-text)" }}>{count}</p>
        <p className="text-sm mt-1" style={{ color: "var(--nm-text-secondary)" }}>{label}</p>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ registrations: 0, upcoming: 0 });
  const [recentEvents, setRecentEvents] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [regRes, eventRes] = await Promise.all([
        API.get("/registrations/my-registrations"),
        API.get("/events", { params: { limit: 6 } }),
      ]);
      if (regRes.data.success) {
        const regs = regRes.data.data;
        setStats({
          registrations: regs.filter((r) => r.status !== "cancelled").length,
          upcoming: regs.filter((r) => r.status === "registered" && new Date(r.event?.date) >= new Date()).length,
        });
      }
      if (eventRes.data.success) {
        setRecentEvents(eventRes.data.data.events || []);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short", day: "numeric",
    });
  };

  const getCategoryColor = (cat) => {
    const colors = {
      technical: "#3b82f6",
      cultural: "#8b5cf6",
      sports: "#10b981",
      workshop: "#f59e0b",
      seminar: "#06b6d4",
      other: "#6b7280",
    };
    return colors[cat] || colors.other;
  };

  return (
    <div className="sidebar-layout">
      <Navbar />

      <div className="main-content">
        <StickyHeader breadcrumbs={["Home", "Dashboard"]} />

        <div className="px-6 pb-8">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold" style={{ color: "var(--nm-text)" }}>
              Welcome back, {user?.firstName || "Student"}! 👋
            </h2>
            <p style={{ color: "var(--nm-text-secondary)" }}>Here&apos;s what&apos;s happening on campus</p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <StatCard icon={<FiCalendar />} label="Upcoming Events" value={stats.upcoming} color="#6366f1" delay={0.1} />
            <StatCard icon={<FiClipboard />} label="Registered Events" value={stats.registrations} color="#10b981" delay={0.2} />
            <StatCard icon={<FiAward />} label="Certificates" value={0} color="#f59e0b" delay={0.3} />
          </div>

          {/* Recent Events */}
          <div className="nm-flat p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold" style={{ color: "var(--nm-text)" }}>🎪 Recent Events</h3>
              <Link to="/events" className="text-indigo-500 text-sm font-medium flex items-center gap-1 hover:text-indigo-600">
                View All <FiArrowRight />
              </Link>
            </div>

            {recentEvents.length === 0 ? (
              <p className="text-center py-8" style={{ color: "var(--nm-text-secondary)" }}>No events available yet. Check back soon!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentEvents.map((event, i) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link to={`/events/${event._id}`} className="block nm-flat-hover p-4">
                      <h4 className="font-semibold line-clamp-1 mb-1" style={{ color: "var(--nm-text)" }}>
                        {event.title}
                      </h4>
                      <p className="text-sm mb-1" style={{ color: "var(--nm-text-secondary)" }}>{formatDate(event.date)} • {event.startTime}</p>
                      <p className="text-sm mb-2" style={{ color: "var(--nm-text-secondary)" }}>{event.venue?.name || "TBA"}</p>
                      <span
                        className="inline-block text-xs px-2 py-1 rounded-full font-medium capitalize text-white"
                        style={{ background: getCategoryColor(event.category) }}
                      >
                        {event.category}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;