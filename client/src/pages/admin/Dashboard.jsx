import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiUsers, FiClipboard, FiClock, FiCheckCircle, FiUserPlus, FiArrowRight, FiVolume2 } from "react-icons/fi";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import AdminNavbar from "../../components/common/AdminNavbar";
import StickyHeader from "../../components/common/StickyHeader";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#06b6d4", "#6b7280"];

const useCountUp = (target, duration = 1000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    const step = (timestamp) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
};

const StatCard = ({ label, value, icon, accentColor, bgColor, delay }) => {
  const count = useCountUp(value, 800);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="nm-flat-hover p-4"
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2 text-lg"
        style={{ background: bgColor, color: accentColor }}>
        {icon}
      </div>
      <p className="text-2xl font-bold" style={{ color: "var(--nm-text)" }}>{count}</p>
      <p className="text-xs" style={{ color: "var(--nm-text-secondary)" }}>{label}</p>
    </motion.div>
  );
};

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
      <div className="sidebar-layout">
        <AdminNavbar />
        <div className="main-content">
          <StickyHeader breadcrumbs={["Admin", "Dashboard"]} />
          <div className="flex justify-center items-center py-32">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
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

  const statCards = [
    { label: "Total Events", value: analytics?.totalEvents || 0, icon: <FiCalendar />, accentColor: "#6366f1", bgColor: "#eef2ff", delay: 0.05 },
    { label: "Approved", value: analytics?.approvedEvents || 0, icon: <FiCheckCircle />, accentColor: "#10b981", bgColor: "#d1fae5", delay: 0.1 },
    { label: "Pending", value: analytics?.pendingEvents || 0, icon: <FiClock />, accentColor: "#f59e0b", bgColor: "#fef3c7", delay: 0.15 },
    { label: "Students", value: analytics?.totalStudents || 0, icon: <FiUsers />, accentColor: "#3b82f6", bgColor: "#dbeafe", delay: 0.2 },
    { label: "Organizers", value: analytics?.totalOrganizers || 0, icon: <FiUserPlus />, accentColor: "#8b5cf6", bgColor: "#ede9fe", delay: 0.25 },
    { label: "Registrations", value: analytics?.totalRegistrations || 0, icon: <FiClipboard />, accentColor: "#ef4444", bgColor: "#fee2e2", delay: 0.3 },
  ];

  return (
    <div className="sidebar-layout">
      <AdminNavbar />
      <div className="main-content">
        <StickyHeader breadcrumbs={["Admin", "Dashboard"]} />
        <div className="px-6 pb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h2 className="text-2xl font-bold" style={{ color: "var(--nm-text)" }}>Admin Dashboard 🛡️</h2>
            <p style={{ color: "var(--nm-text-secondary)" }}>Welcome back, {user?.firstName}. Here's your campus overview.</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {statCards.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="nm-flat p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--nm-text)" }}>📊 Events by Category</h3>
              {categoryData.length === 0 ? (
                <p className="text-center py-10" style={{ color: "var(--nm-text-secondary)" }}>No data yet</p>
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

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="nm-flat p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--nm-text)" }}>🏛️ Top Departments</h3>
              {deptData.length === 0 ? (
                <p className="text-center py-10" style={{ color: "var(--nm-text-secondary)" }}>No data yet</p>
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
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl p-5 flex items-center gap-3 hover:shadow-lg transition group">
              <FiClock className="text-2xl" />
              <div className="flex-1">
                <h3 className="font-bold">Pending Approvals</h3>
                <p className="text-sm text-white/80">{analytics?.pendingEvents || 0} events waiting</p>
              </div>
              <FiArrowRight className="group-hover:translate-x-1 transition" />
            </Link>

            <Link to="/admin/users"
              className="bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-2xl p-5 flex items-center gap-3 hover:shadow-lg transition group">
              <FiUsers className="text-2xl" />
              <div className="flex-1">
                <h3 className="font-bold">Manage Users</h3>
                <p className="text-sm text-white/80">{(analytics?.totalStudents || 0) + (analytics?.totalOrganizers || 0)} total users</p>
              </div>
              <FiArrowRight className="group-hover:translate-x-1 transition" />
            </Link>

            <Link to="/admin/announcements"
              className="bg-gradient-to-r from-campus-dark to-campus-light text-white rounded-2xl p-5 flex items-center gap-3 hover:shadow-lg transition group">
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
    </div>
  );
};

export default AdminDashboard;
