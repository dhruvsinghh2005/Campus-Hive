import { useState, useEffect } from "react";
import { FiCalendar, FiMapPin, FiUsers, FiCheck, FiX, FiUser, FiClock } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../api/axios";
import AdminNavbar from "../../components/common/AdminNavbar";

const PendingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState({});
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const { data } = await API.get("/events/pending");
      if (data.success) setEvents(data.data);
    } catch (error) {
      toast.error("Failed to load pending events");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (eventId, status) => {
    setProcessing(eventId);
    try {
      const { data } = await API.patch(`/events/${eventId}/review`, {
        status,
        remarks: remarks[eventId] || "",
      });
      if (data.success) {
        toast.success(`Event ${status}!`);
        setEvents((prev) => prev.filter((e) => e._id !== eventId));
      }
    } catch (error) {
      toast.error("Failed to review event");
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "short", month: "short", day: "numeric", year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">⏳ Pending Event Approvals</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <p className="text-6xl mb-4">✅</p>
            <h3 className="text-xl font-semibold text-gray-700">All caught up!</h3>
            <p className="text-gray-500 mt-2">No pending events to review.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event, index) => (
              <motion.div key={event._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-yellow-700 flex items-center gap-1">
                    <FiClock /> Pending Review
                  </span>
                  <span className="text-xs text-gray-500">
                    Submitted {new Date(event.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{event.title}</h3>
                  <span className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs capitalize mb-3">
                    {event.category}
                  </span>
                  <p className="text-gray-500 text-sm mb-4">{event.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiCalendar className="text-primary-500" /> {formatDate(event.date)}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiClock className="text-primary-500" /> {event.startTime} - {event.endTime}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiMapPin className="text-primary-500" /> {event.venue?.name || "TBA"}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiUsers className="text-primary-500" /> Max: {event.maxParticipants}
                    </div>
                  </div>

                  {/* Organizer Info */}
                  <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-4 py-2 mb-4">
                    <FiUser className="text-primary-500" />
                    <span className="text-sm text-gray-700">
                      <strong>Organizer:</strong> {event.organizer?.firstName} {event.organizer?.lastName}
                      {event.organizer?.organizationName && ` (${event.organizer.organizationName})`}
                      {" — "}{event.organizer?.email}
                    </span>
                  </div>

                  {/* Remarks Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Remarks (optional)</label>
                    <input
                      type="text"
                      value={remarks[event._id] || ""}
                      onChange={(e) => setRemarks((prev) => ({ ...prev, [event._id]: e.target.value }))}
                      placeholder="Add a note for the organizer..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-800 text-sm"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReview(event._id, "approved")}
                      disabled={processing === event._id}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      <FiCheck /> Approve
                    </button>
                    <button
                      onClick={() => handleReview(event._id, "rejected")}
                      disabled={processing === event._id}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      <FiX /> Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingEvents;