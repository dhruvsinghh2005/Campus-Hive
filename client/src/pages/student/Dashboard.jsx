import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiClipboard, FiAward, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.firstName || "Student"}! 👋
          </h2>
          <p className="text-gray-500">Here's what's happening on campus</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <FiCalendar className="text-xl text-primary-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-800">{stats.upcoming}</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FiClipboard className="text-xl text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Registered Events</p>
                <p className="text-2xl font-bold text-gray-800">{stats.registrations}</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6 border-l-4 border-campus-accent">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FiAward className="text-xl text-campus-accent" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Certificates</p>
                <p className="text-2xl font-bold text-gray-800">0</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">🎪 Recent Events</h3>
            <Link to="/events" className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:text-primary-700">
              View All <FiArrowRight />
            </Link>
          </div>

          {recentEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No events available yet. Check back soon!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentEvents.map((event) => (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="border rounded-lg p-4 hover:shadow-md transition group"
                >
                  <h4 className="font-semibold text-gray-800 group-hover:text-primary-600 line-clamp-1">
                    {event.title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">{formatDate(event.date)} • {event.startTime}</p>
                  <p className="text-sm text-gray-500">{event.venue?.name || "TBA"}</p>
                  <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                    {event.category}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;