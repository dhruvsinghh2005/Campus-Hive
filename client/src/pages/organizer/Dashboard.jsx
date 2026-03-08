import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiPlusCircle, FiArrowRight, FiList } from "react-icons/fi";
import { motion } from "framer-motion";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import OrganizerNavbar from "../../components/common/OrganizerNavbar";
import StickyHeader from "../../components/common/StickyHeader";
import useCountUp from "../../hooks/useCountUp";

const StatCard = ({ icon, label, value, accentColor, delay }) => {
  const count = useCountUp(value, 800);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="nm-flat-hover p-5"
    >
      <div className="mb-2" style={{ color: accentColor, fontSize: "1.25rem" }}>{icon}</div>
      <p className="text-2xl font-bold" style={{ color: "var(--nm-text)" }}>{count}</p>
      <p className="text-sm" style={{ color: "var(--nm-text-secondary)" }}>{label}</p>
    </motion.div>
  );
};

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const { data } = await API.get("/events/my-events");
      if (data.success) setEvents(data.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: events.length,
    pending: events.filter((e) => e.status === "pending").length,
    approved: events.filter((e) => e.status === "approved").length,
    rejected: events.filter((e) => e.status === "rejected").length,
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      completed: "bg-blue-100 text-blue-700",
      cancelled: "bg-gray-100 text-gray-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="sidebar-layout">
      <OrganizerNavbar />
      <div className="main-content">
        <StickyHeader breadcrumbs={["Organizer", "Dashboard"]} />
        <div className="px-6 pb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h2 className="text-2xl font-bold" style={{ color: "var(--nm-text)" }}>
              Welcome, {user?.organizationName || user?.firstName || "Organizer"}! ��
            </h2>
            <p style={{ color: "var(--nm-text-secondary)" }}>Manage your events and track registrations</p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<FiCalendar />} label="Total Events" value={stats.total} accentColor="#6366f1" delay={0.1} />
            <StatCard icon={<FiClock />} label="Pending" value={stats.pending} accentColor="#f59e0b" delay={0.2} />
            <StatCard icon={<FiCheckCircle />} label="Approved" value={stats.approved} accentColor="#10b981" delay={0.3} />
            <StatCard icon={<FiXCircle />} label="Rejected" value={stats.rejected} accentColor="#ef4444" delay={0.4} />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link to="/organizer/create-event"
              className="bg-gradient-to-r from-campus-accent to-red-600 text-white rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg transition group">
              <FiPlusCircle className="text-3xl" />
              <div>
                <h3 className="text-lg font-bold">Create New Event</h3>
                <p className="text-sm text-white/80">Submit an event for admin approval</p>
              </div>
              <FiArrowRight className="ml-auto text-xl group-hover:translate-x-1 transition" />
            </Link>

            <Link to="/organizer/my-events"
              className="bg-gradient-to-r from-campus-dark to-campus-light text-white rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg transition group">
              <FiList className="text-3xl" />
              <div>
                <h3 className="text-lg font-bold">View All Events</h3>
                <p className="text-sm text-white/80">Manage and track your events</p>
              </div>
              <FiArrowRight className="ml-auto text-xl group-hover:translate-x-1 transition" />
            </Link>
          </div>

          {/* Recent Events Table */}
          <div className="nm-flat p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--nm-text)" }}>📋 Recent Events</h3>
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-4xl mb-3">📭</p>
                <p style={{ color: "var(--nm-text-secondary)" }}>No events yet. Create your first event!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left" style={{ color: "var(--nm-text-secondary)", borderColor: "var(--nm-shadow)" }}>
                      <th className="pb-3 font-medium">Event</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Category</th>
                      <th className="pb-3 font-medium">Registrations</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.slice(0, 5).map((event) => (
                      <tr key={event._id} className="border-b last:border-0" style={{ borderColor: "var(--nm-shadow)" }}>
                        <td className="py-3 font-medium" style={{ color: "var(--nm-text)" }}>{event.title}</td>
                        <td className="py-3" style={{ color: "var(--nm-text-secondary)" }}>{formatDate(event.date)}</td>
                        <td className="py-3 capitalize" style={{ color: "var(--nm-text-secondary)" }}>{event.category}</td>
                        <td className="py-3" style={{ color: "var(--nm-text-secondary)" }}>{event.currentParticipants}/{event.maxParticipants}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(event.status)}`}>
                            {event.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
