import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiUsers, FiClipboard, FiClock, FiCheckCircle, FiUserPlus, FiArrowRight, FiVolume2 } from "react-icons/fi";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import AdminNavbar from "../../components/common/AdminNavbar";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#06b6d4", "#6b7280"];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await API.get("/analytics/dashboard");
      if (data.success) setAnalytics(data.data);
    } catch (error) {
      console.error("Analytics error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="flex justify-center items-center py-32">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const categoryData = analytics?.eventsByCategory?.map((item) => ({
    name: item._id?.charAt(0).toUpperCase() + item._id?.slice(1),
    value: item.count,
  })) || [];

  const deptData = analytics?.topDepartments?.map((item) => ({
    name: item._id || "N/A",
    events: item.count,
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="max-w-6xl mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard 🛡️</h2>
          <p className="text-gray-500">Welcome back, {user?.firstName}. Here's your campus overview.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Total Events", value: analytics?.totalEvents || 0, icon: <FiCalendar />, color: "border-primary-500", bg: "bg-primary-100", text: "text-primary-500" },
            { label: "Approved", value: analytics?.approvedEvents || 0, icon: <FiCheckCircle />, color: "border-green-500", bg: "bg-green-100", text: "text-green-500" },
            { label: "Pending", value: analytics?.pendingEvents || 0, icon: <FiClock />, color: "border-yellow-500", bg: "bg-yellow-100", text: "text-yellow-500" },
            { label: "Students", value: analytics?.totalStudents || 0, icon: <FiUsers />, color: "border-blue-500", bg: "bg-blue-100", text: "text-blue-500" },
            { label: "Organizers", value: analytics?.totalOrganizers || 0, icon: <FiUserPlus />, color: "border-purple-500", bg: "bg-purple-100", text: "text-purple-500" },
            { label: "Registrations", value: analytics?.totalRegistrations || 0, icon: <FiClipboard />, color: "border-campus-accent", bg: "bg-red-100", text: "text-campus-accent" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-xl shadow-md p-4 border-l-4 ${stat.color}`}>
              <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center ${stat.text} mb-2 text-lg`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Events by Category</h3>
            {categoryData.length === 0 ? (
              <p className="text-gray-500 text-center py-10">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Bar Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🏛️ Top Departments</h3>
            {deptData.length === 0 ? (
              <p className="text-gray-500 text-center py-10">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="events" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/pending-events"
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl p-5 flex items-center gap-3 hover:shadow-lg transition group">
            <FiClock className="text-2xl" />
            <div className="flex-1">
              <h3 className="font-bold">Pending Approvals</h3>
              <p className="text-sm text-white/80">{analytics?.pendingEvents || 0} events waiting</p>
            </div>
            <FiArrowRight className="group-hover:translate-x-1 transition" />
          </Link>

          <Link to="/admin/users"
            className="bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-xl p-5 flex items-center gap-3 hover:shadow-lg transition group">
            <FiUsers className="text-2xl" />
            <div className="flex-1">
              <h3 className="font-bold">Manage Users</h3>
              <p className="text-sm text-white/80">{(analytics?.totalStudents || 0) + (analytics?.totalOrganizers || 0)} total users</p>
            </div>
            <FiArrowRight className="group-hover:translate-x-1 transition" />
          </Link>

          <Link to="/admin/announcements"
            className="bg-gradient-to-r from-campus-dark to-campus-light text-white rounded-xl p-5 flex items-center gap-3 hover:shadow-lg transition group">
            <FiVolume2 className="text-2xl" />
            <div className="flex-1">
              <h3 className="font-bold">Announcements</h3>
              <p className="text-sm text-white/80">Broadcast to campus</p>
            </div>
            <FiArrowRight className="group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;