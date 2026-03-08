import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiMapPin, FiUsers, FiTrash2, FiEye, FiCamera, FiAward } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../api/axios";
import OrganizerNavbar from "../../components/common/OrganizerNavbar";
import StickyHeader from "../../components/common/StickyHeader";
import NmRippleButton from "../../components/common/NmRippleButton";

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await API.get("/events/my-events");
      if (data.success) setEvents(data.data);
    } catch (error) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const { data } = await API.delete(`/events/${eventId}`);
      if (data.success) {
        toast.success("Event deleted");
        setEvents((prev) => prev.filter((e) => e._id !== eventId));
      }
    } catch (error) {
      toast.error("Failed to delete");
    }
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
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "short", month: "short", day: "numeric", year: "numeric",
    });
  };

  const filtered = filter === "all" ? events : events.filter((e) => e.status === filter);

  return (
    <div className="sidebar-layout">
      <OrganizerNavbar />
      <div className="main-content">
        <StickyHeader breadcrumbs={["Organizer", "My Events"]} />
        <div className="px-6 pb-8">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <h1 className="text-2xl font-bold" style={{ color: "var(--nm-text)" }}>📋 My Events</h1>
            <Link to="/organizer/create-event">
              <NmRippleButton className="text-sm py-2 px-4">+ Create Event</NmRippleButton>
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["all", "pending", "approved", "rejected"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition ${
                  filter === f ? "nm-inset font-semibold" : "nm-button"
                }`}
                style={{ color: "var(--nm-text)" }}>
                {f} {f !== "all" && `(${events.filter((e) => e.status === f).length})`}
                {f === "all" && ` (${events.length})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="nm-flat text-center py-20">
              <p className="text-6xl mb-4">📭</p>
              <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--nm-text)" }}>No events found</h3>
              <p style={{ color: "var(--nm-text-secondary)" }}>
                {filter === "all" ? "Create your first event!" : `No ${filter} events.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((event, index) => (
                <motion.div key={event._id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  className="nm-flat-hover p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <h3 className="text-lg font-bold" style={{ color: "var(--nm-text)" }}>{event.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${getStatusBadge(event.status)}`}>
                          {event.status}
                        </span>
                      </div>

                      <p className="text-sm mb-3 line-clamp-2" style={{ color: "var(--nm-text-secondary)" }}>{event.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm" style={{ color: "var(--nm-text-secondary)" }}>
                        <span className="flex items-center gap-1"><FiCalendar className="text-primary-500" /> {formatDate(event.date)}</span>
                        <span className="flex items-center gap-1"><FiMapPin className="text-primary-500" /> {event.venue?.name || "TBA"}</span>
                        <span className="flex items-center gap-1"><FiUsers className="text-primary-500" /> {event.currentParticipants}/{event.maxParticipants}</span>
                        <span className="capitalize nm-inset px-2 py-0.5 text-xs">{event.category}</span>
                      </div>

                      {event.adminRemarks && (
                        <p className="mt-2 text-sm italic" style={{ color: "var(--nm-text-secondary)" }}>
                          Admin: "{event.adminRemarks}"
                        </p>
                      )}
                    </div>

                    <div className="flex md:flex-col gap-2 flex-shrink-0">
                      <Link to={`/events/${event._id}`}
                        className="flex items-center gap-1 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm hover:bg-primary-100 transition">
                        <FiEye /> View
                      </Link>

                      {event.status === "approved" && (
                        <>
                          <Link to={`/organizer/scan/${event._id}`}
                            className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 transition">
                            <FiCamera /> Scan QR
                          </Link>
                          <Link to={`/organizer/event/${event._id}/attendees`}
                            className="flex items-center gap-1 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm hover:bg-purple-100 transition">
                            <FiUsers /> Attendees
                          </Link>
                        </>
                      )}

                      {event.status === "pending" && (
                        <button onClick={() => handleDelete(event._id)}
                          className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition">
                          <FiTrash2 /> Delete
                        </button>
                      )}
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

export default MyEvents;
