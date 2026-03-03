import { useState, useEffect } from "react";
import { FiSearch, FiUser, FiMail, FiPhone, FiShield } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../api/axios";
import AdminNavbar from "../../components/common/AdminNavbar";

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
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">👥 User Management</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px] relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-800" />
          </div>
          <div className="flex gap-2">
            {["all", "student", "organizer", "admin"].map((role) => (
              <button key={role} onClick={() => setRoleFilter(role)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium capitalize transition ${
                  roleFilter === role ? "bg-campus-dark text-white" : "bg-white text-gray-600 hover:bg-gray-100 border"
                }`}>
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* User Count */}
        <p className="text-sm text-gray-500 mb-4">{filtered.length} users found</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b text-left text-gray-500">
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
                      className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm">
                            {u.firstName?.[0]}{u.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{u.firstName} {u.lastName}</p>
                            {u.organizationName && <p className="text-xs text-gray-500">{u.organizationName}</p>}
                            {u.department && <p className="text-xs text-gray-500">{u.department} — Year {u.year}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{u.email}</td>
                      <td className="px-6 py-4 text-gray-600">{u.phone}</td>
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
                      <td className="px-6 py-4 text-gray-500">
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
  );
};

export default Users;