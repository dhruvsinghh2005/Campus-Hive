import { useState, useEffect } from "react";
import { FiCalendar, FiMapPin, FiUsers, FiCheck, FiX, FiUser, FiClock } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../api/axios";
import AdminNavbar from "../../components/common/AdminNavbar";
import StickyHeader from "../../components/common/StickyHeader";
import NmRippleButton from "../../components/common/NmRippleButton";

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
    <div className="sidebar-layout">
      <AdminNavbar />
      <div className="main-content">
        <StickyHeader breadcrumbs={["Admin", "Pending Approvals"]} />
        <div className="px-6 pb-8">
          <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--nm-text)" }}>⏳ Pending Event Approvals</h1>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="nm-flat text-center py-20">
              <p className="text-6xl mb-4">✅</p>
              <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--nm-text)" }}>All caught up!</h3>
              <p style={{ color: "var(--nm-text-secondary)" }}>No pending events to review.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event, index) => (
                <motion.div key={event._id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  className="nm-flat-hover overflow-hidden">
                  <div className="nm-inset px-6 py-3 flex justify-between items-center rounded-t-2xl">
                    <span className="text-sm font-semibold text-yellow-700 flex items-center gap-1">
                      <FiClock /> Pending Review
                    </span>
                    <span className="text-xs" style={{ color: "var(--nm-text-secondary)" }}>
                      Submitted {new Date(event.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-1" style={{ color: "var(--nm-text)" }}>{event.title}</h3>
                    <span className="inline-block nm-inset px-2 py-0.5 text-xs capitalize mb-3" style={{ color: "var(--nm-text-secondary)" }}>
                      {event.category}
                    </span>
                    <p className="text-sm mb-4" style={{ color: "var(--nm-text-secondary)" }}>{event.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-2" style={{ color: "var(--nm-text-secondary)" }}>
                        <FiCalendar className="text-primary-500" /> {formatDate(event.date)}
                      </div>
                      <div className="flex items-center gap-2" style={{ color: "var(--nm-text-secondary)" }}>
                        <FiClock className="text-primary-500" /> {event.startTime} - {event.endTime}
                      </div>
                      <div className="flex items-center gap-2" style={{ color: "var(--nm-text-secondary)" }}>
                        <FiMapPin className="text-primary-500" /> {event.venue?.name || "TBA"}
                      </div>
                      <div className="flex items-center gap-2" style={{ color: "var(--nm-text-secondary)" }}>
                        <FiUsers className="text-primary-500" /> Max: {event.maxParticipants}
                      </div>
                    </div>

                    {/* Organizer Info */}
                    <div className="nm-inset flex items-center gap-2 px-4 py-2 mb-4">
                      <FiUser className="text-primary-500" />
                      <span className="text-sm" style={{ color: "var(--nm-text)" }}>
                        <strong>Organizer:</strong> {event.organizer?.firstName} {event.organizer?.lastName}
                        {event.organizer?.organizationName && ` (${event.organizer.organizationName})`}
                        {" — "}{event.organizer?.email}
                      </span>
                    </div>

                    {/* Remarks Input */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--nm-text)" }}>Admin Remarks (optional)</label>
                      <input
                        type="text"
                        value={remarks[event._id] || ""}
                        onChange={(e) => setRemarks((prev) => ({ ...prev, [event._id]: e.target.value }))}
                        placeholder="Add a note for the organizer..."
                        className="nm-input w-full px-4 py-2 text-sm"
                        style={{ color: "var(--nm-text)" }}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <NmRippleButton
                        onClick={() => handleReview(event._id, "approved")}
                        disabled={processing === event._id}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600"
                        style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                      >
                        <FiCheck /> Approve
                      </NmRippleButton>
                      <NmRippleButton
                        onClick={() => handleReview(event._id, "rejected")}
                        disabled={processing === event._id}
                        className="flex-1 flex items-center justify-center gap-2 py-3"
                        style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
                      >
                        <FiX /> Reject
                      </NmRippleButton>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingEvents;
