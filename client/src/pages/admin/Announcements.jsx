import { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiEdit, FiBookmark, FiAlertTriangle, FiInfo, FiAlertCircle, FiX } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../api/axios";
import AdminNavbar from "../../components/common/AdminNavbar";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", type: "info", isPinned: false });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await API.get("/announcements");
      if (data.success) setAnnouncements(data.data);
    } catch (error) {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await API.post("/announcements", formData);
      if (data.success) {
        toast.success("Announcement created! 📢");
        setFormData({ title: "", content: "", type: "info", isPinned: false });
        setShowForm(false);
        fetchAnnouncements();
      }
    } catch (error) {
      toast.error("Failed to create announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      const { data } = await API.delete(`/announcements/${id}`);
      if (data.success) {
        toast.success("Deleted");
        setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      }
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const getTypeStyle = (type) => {
    const styles = {
      info: { bg: "bg-blue-50 border-blue-200", icon: <FiInfo className="text-blue-500" />, badge: "bg-blue-100 text-blue-700" },
      warning: { bg: "bg-yellow-50 border-yellow-200", icon: <FiAlertTriangle className="text-yellow-500" />, badge: "bg-yellow-100 text-yellow-700" },
      urgent: { bg: "bg-red-50 border-red-200", icon: <FiAlertCircle className="text-red-500" />, badge: "bg-red-100 text-red-700" },
    };
    return styles[type] || styles.info;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📢 Announcements</h1>
          <button onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition ${
              showForm ? "bg-gray-200 text-gray-700" : "bg-campus-accent text-white hover:bg-red-600"
            }`}>
            {showForm ? <><FiX /> Cancel</> : <><FiPlus /> New Announcement</>}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <motion.form onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="bg-white rounded-xl shadow-md p-6 mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required
                placeholder="Announcement title..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
              <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required rows={3}
                placeholder="Announcement details..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none text-gray-800" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-800 bg-white">
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 px-4 py-2.5 cursor-pointer">
                  <input type="checkbox" checked={formData.isPinned} onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })} className="w-4 h-4" />
                  <span className="text-sm font-medium text-gray-700">📌 Pin</span>
                </label>
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="bg-campus-accent hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50">
              {submitting ? "Publishing..." : "Publish Announcement"}
            </button>
          </motion.form>
        )}

        {/* Announcements List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <p className="text-6xl mb-4">📭</p>
            <h3 className="text-xl font-semibold text-gray-700">No announcements yet</h3>
            <p className="text-gray-500 mt-2">Create your first announcement!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((a, index) => {
              const style = getTypeStyle(a.type);
              return (
                <motion.div key={a._id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  className={`rounded-xl border p-5 ${style.bg}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-xl mt-0.5">{style.icon}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-800">{a.title}</h3>
                          {a.isPinned && <span className="text-xs">📌</span>}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${style.badge}`}>{a.type}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{a.content}</p>
                        <p className="text-xs text-gray-400">
                          By {a.createdBy?.firstName} {a.createdBy?.lastName} • {new Date(a.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(a._id)}
                      className="text-red-400 hover:text-red-600 p-1 transition">
                      <FiTrash2 />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;