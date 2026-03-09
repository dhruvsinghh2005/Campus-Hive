import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiPlusCircle, FiArrowRight, FiList } from "react-icons/fi";
import { motion } from "framer-motion";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import OrganizerNavbar from "../../components/common/OrganizerNavbar";

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
    <div className="min-h-screen bg-gray-50">
      <OrganizerNavbar />

      <div className="max-w-6xl mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome, {user?.organizationName || user?.firstName || "Organizer"}! 🎤
          </h2>
          <p className="text-gray-500">Manage your events and track registrations</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-5 border-l-4 border-primary-500">
            <FiCalendar className="text-xl text-primary-500 mb-2" />
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Events</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-5 border-l-4 border-yellow-500">
            <FiClock className="text-xl text-yellow-500 mb-2" />
            <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
            <FiCheckCircle className="text-xl text-green-500 mb-2" />
            <p className="text-2xl font-bold text-gray-800">{stats.approved}</p>
            <p className="text-sm text-gray-500">Approved</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
            <FiXCircle className="text-xl text-red-500 mb-2" />
            <p className="text-2xl font-bold text-gray-800">{stats.rejected}</p>
            <p className="text-sm text-gray-500">Rejected</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/organizer/create-event"
            className="bg-gradient-to-r from-campus-accent to-red-600 text-white rounded-xl p-6 flex items-center gap-4 hover:shadow-lg transition group">
            <FiPlusCircle className="text-3xl" />
            <div>
              <h3 className="text-lg font-bold">Create New Event</h3>
              <p className="text-sm text-white/80">Submit an event for admin approval</p>
            </div>
            <FiArrowRight className="ml-auto text-xl group-hover:translate-x-1 transition" />
          </Link>

          <Link to="/organizer/my-events"
            className="bg-gradient-to-r from-campus-dark to-campus-light text-white rounded-xl p-6 flex items-center gap-4 hover:shadow-lg transition group">
            <FiList className="text-3xl" />
            <div>
              <h3 className="text-lg font-bold">View All Events</h3>
              <p className="text-sm text-white/80">Manage and track your events</p>
            </div>
            <FiArrowRight className="ml-auto text-xl group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {/* Recent Events Table */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Recent Events</h3>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-500">No events yet. Create your first event!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">Event</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Registrations</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 5).map((event) => (
                    <tr key={event._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-800">{event.title}</td>
                      <td className="py-3 text-gray-600">{formatDate(event.date)}</td>
                      <td className="py-3 capitalize text-gray-600">{event.category}</td>
                      <td className="py-3 text-gray-600">{event.currentParticipants}/{event.maxParticipants}</td>
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
  );
};

export default OrganizerDashboard;