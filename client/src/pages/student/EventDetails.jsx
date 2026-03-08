import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiUser, FiTag, FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";
import StickyHeader from "../../components/common/StickyHeader";
import NmProgressBar from "../../components/common/NmProgressBar";
import NmRippleButton from "../../components/common/NmRippleButton";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    fetchEvent();
    if (token) checkRegistration();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data } = await API.get(`/events/${id}`);
      if (data.success) setEvent(data.data);
    } catch (error) {
      toast.error("Failed to load event");
      navigate("/events");
    } finally {
      setLoading(false);
    }
  };

  const checkRegistration = async () => {
    try {
      const { data } = await API.get("/registrations/my-registrations");
      if (data.success) {
        const found = data.data.find((r) => r.event?._id === id && r.status !== "cancelled");
        setIsRegistered(!!found);
      }
    } catch (error) {
      console.error("Check registration error:", error);
    }
  };

  const handleRegister = async () => {
    if (!token) {
      toast.error("Please login to register");
      return navigate("/login");
    }
    setRegistering(true);
    try {
      const { data } = await API.post("/registrations", { eventId: id });
      if (data.success) {
        toast.success("Registered successfully! 🎉");
        setIsRegistered(true);
        setEvent((prev) => ({ ...prev, currentParticipants: prev.currentParticipants + 1 }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  };

  const getCategoryColor = (cat) => {
    const colors = {
      technical: "#3b82f6", cultural: "#8b5cf6", sports: "#10b981",
      workshop: "#f59e0b", seminar: "#06b6d4", other: "#6b7280",
    };
    return colors[cat] || colors.other;
  };

  if (loading) {
    return (
      <div className="sidebar-layout">
        <Navbar />
        <div className="main-content flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!event) return null;

  const isFull = event.currentParticipants >= event.maxParticipants;
  const isPast = new Date(event.date) < new Date();
  const fillPct = Math.min(100, (event.currentParticipants / event.maxParticipants) * 100);

  return (
    <div className="sidebar-layout">
      <Navbar />
      <div className="main-content">
        <StickyHeader breadcrumbs={["Events", event.title?.slice(0, 30)]} />

        <div className="px-6 pb-8">
          <button
            onClick={() => navigate(-1)}
            className="nm-button flex items-center gap-2 px-4 py-2 text-sm mb-6"
            style={{ color: "var(--nm-text)" }}
          >
            <FiArrowLeft /> Back to Events
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="nm-flat p-8"
          >
            {/* Banner */}
            <div className="h-56 rounded-nm overflow-hidden mb-8">
              {event.banner ? (
                <img
                  src={`http://localhost:4000/media/${event.banner}`}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #a78bfa)" }}>
                  <span className="text-7xl">🎪</span>
                </div>
              )}
            </div>

            {/* Title & Category */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize mb-3 text-white"
                  style={{ background: getCategoryColor(event.category) }}
                >
                  {event.category}
                </span>
                <h1 className="text-3xl font-bold" style={{ color: "var(--nm-text)" }}>{event.title}</h1>
              </div>
              {event.isPaid ? (
                <div className="text-right">
                  <p className="text-sm" style={{ color: "var(--nm-text-secondary)" }}>Entry Fee</p>
                  <p className="text-3xl font-bold text-indigo-500">₹{event.price}</p>
                </div>
              ) : (
                <span className="nm-inset px-4 py-2 font-bold text-sm text-emerald-500">Free Entry</span>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                { icon: <FiCalendar />, label: "Date", value: formatDate(event.date) },
                { icon: <FiClock />, label: "Time", value: `${event.startTime} - ${event.endTime}` },
                { icon: <FiMapPin />, label: "Venue", value: event.venue?.name || "TBA", sub: event.venue?.location },
              ].map((item, i) => (
                <div key={i} className="nm-inset flex items-center gap-3 p-4">
                  <span className="text-xl text-indigo-500">{item.icon}</span>
                  <div>
                    <p className="text-xs" style={{ color: "var(--nm-text-secondary)" }}>{item.label}</p>
                    <p className="font-semibold" style={{ color: "var(--nm-text)" }}>{item.value}</p>
                    {item.sub && <p className="text-xs" style={{ color: "var(--nm-text-secondary)" }}>{item.sub}</p>}
                  </div>
                </div>
              ))}

              {/* Participants with progress bar */}
              <div className="nm-inset p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl text-indigo-500"><FiUsers /></span>
                  <div>
                    <p className="text-xs" style={{ color: "var(--nm-text-secondary)" }}>Participants</p>
                    <p className="font-semibold" style={{ color: "var(--nm-text)" }}>{event.currentParticipants} / {event.maxParticipants}</p>
                  </div>
                </div>
                <NmProgressBar value={event.currentParticipants} max={event.maxParticipants} showPercent height={8} />
              </div>
            </div>

            {/* Organizer */}
            <div className="nm-inset flex items-center gap-3 p-4 mb-8">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #6366f1, #a78bfa)" }}>
                <FiUser />
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--nm-text-secondary)" }}>Organized by</p>
                <p className="font-semibold" style={{ color: "var(--nm-text)" }}>
                  {event.organizer?.organizationName || `${event.organizer?.firstName} ${event.organizer?.lastName}`}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3" style={{ color: "var(--nm-text)" }}>About this Event</h2>
              <p className="leading-relaxed whitespace-pre-line" style={{ color: "var(--nm-text-secondary)" }}>{event.description}</p>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-1" style={{ color: "var(--nm-text-secondary)" }}>
                  <FiTag /> Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, i) => (
                    <span key={i} className="nm-inset px-3 py-1 text-sm" style={{ color: "var(--nm-text-secondary)" }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {event.requirements && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3" style={{ color: "var(--nm-text)" }}>Requirements</h2>
                <p className="leading-relaxed" style={{ color: "var(--nm-text-secondary)" }}>{event.requirements}</p>
              </div>
            )}

            {/* Register Button */}
            <div className="pt-6" style={{ borderTop: "1px solid var(--nm-shadow)" }}>
              {isPast ? (
                <div className="nm-inset w-full py-4 text-center font-semibold text-lg" style={{ color: "var(--nm-text-secondary)" }}>
                  Event has ended
                </div>
              ) : isRegistered ? (
                <div className="nm-inset w-full py-4 text-center font-semibold text-lg text-emerald-500">
                  ✅ You&apos;re Registered!
                </div>
              ) : isFull ? (
                <div className="nm-inset w-full py-4 text-center font-semibold text-lg text-rose-500">
                  Event is Full
                </div>
              ) : user?.role !== "student" ? (
                <p className="text-center" style={{ color: "var(--nm-text-secondary)" }}>Only students can register for events</p>
              ) : (
                <NmRippleButton
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full py-4 text-lg flex items-center justify-center gap-2"
                >
                  {registering ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Register Now 🚀"
                  )}
                </NmRippleButton>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
