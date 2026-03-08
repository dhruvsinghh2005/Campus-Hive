import { useState, useEffect } from "react";
import { FiSearch, FiUser, FiMail, FiPhone, FiShield } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../api/axios";
import AdminNavbar from "../../components/common/AdminNavbar";
import StickyHeader from "../../components/common/StickyHeader";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/admin/users");
      if (data.success) setUsers(data.data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      student: "bg-blue-100 text-blue-700",
      organizer: "bg-purple-100 text-purple-700",
      admin: "bg-red-100 text-red-700",
    };
    return styles[role] || "bg-gray-100 text-gray-700";
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-700",
      inactive: "bg-gray-100 text-gray-700",
      suspended: "bg-red-100 text-red-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesSearch = !search || 
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="sidebar-layout">
      <AdminNavbar />
      <div className="main-content">
        <StickyHeader breadcrumbs={["Admin", "Users"]} />
        <div className="px-6 pb-8">
          <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--nm-text)" }}>👥 User Management</h1>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px] relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--nm-text-secondary)" }} />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="nm-input w-full pl-10 pr-4 py-2.5"
                style={{ color: "var(--nm-text)" }} />
            </div>
            <div className="flex gap-2">
              {["all", "student", "organizer", "admin"].map((role) => (
                <button key={role} onClick={() => setRoleFilter(role)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium capitalize transition ${
                    roleFilter === role ? "nm-inset font-semibold" : "nm-button"
                  }`}
                  style={{ color: "var(--nm-text)" }}>
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* User Count */}
          <p className="text-sm mb-4" style={{ color: "var(--nm-text-secondary)" }}>{filtered.length} users found</p>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="nm-flat text-center py-20">
              <p className="text-4xl mb-3">🔍</p>
              <p style={{ color: "var(--nm-text-secondary)" }}>No users found</p>
            </div>
          ) : (
            <div className="nm-flat overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="nm-inset text-left" style={{ color: "var(--nm-text-secondary)" }}>
                      <th className="px-6 py-4 font-medium">User</th>
                      <th className="px-6 py-4 font-medium">Email</th>
                      <th className="px-6 py-4 font-medium">Phone</th>
                      <th className="px-6 py-4 font-medium">Role</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u, index) => (
                      <motion.tr key={u._id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }}
                        className="border-b last:border-0 hover:opacity-90 transition"
                        style={{ borderColor: "var(--nm-shadow)" }}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm">
                              {u.firstName?.[0]}{u.lastName?.[0]}
                            </div>
                            <div>
                              <p className="font-medium" style={{ color: "var(--nm-text)" }}>{u.firstName} {u.lastName}</p>
                              {u.organizationName && <p className="text-xs" style={{ color: "var(--nm-text-secondary)" }}>{u.organizationName}</p>}
                              {u.department && <p className="text-xs" style={{ color: "var(--nm-text-secondary)" }}>{u.department} — Year {u.year}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4" style={{ color: "var(--nm-text-secondary)" }}>{u.email}</td>
                        <td className="px-6 py-4" style={{ color: "var(--nm-text-secondary)" }}>{u.phone}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getRoleBadge(u.role)}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(u.status)}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4" style={{ color: "var(--nm-text-secondary)" }}>
                          {new Date(u.createdAt).toLocaleDateString("en-IN")}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
