import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiUser, FiTag, FiArrowLeft, FiDollarSign } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

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
        const found = data.data.find(
          (r) => r.event?._id === id && r.status !== "cancelled"
        );
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
        setEvent((prev) => ({
          ...prev,
          currentParticipants: prev.currentParticipants + 1,
        }));
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
      technical: "bg-blue-100 text-blue-700",
      cultural: "bg-purple-100 text-purple-700",
      sports: "bg-green-100 text-green-700",
      workshop: "bg-orange-100 text-orange-700",
      seminar: "bg-teal-100 text-teal-700",
      other: "bg-gray-100 text-gray-700",
    };
    return colors[cat] || colors.other;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) return null;

  const isFull = event.currentParticipants >= event.maxParticipants;
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="h-64 md:h-80 bg-gradient-to-br from-campus-dark to-campus-light relative">
        {event.banner ? (
          <img
            src={`http://localhost:4000/media/${event.banner}`}
            alt={event.title}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-8xl">🎪</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/30 transition"
        >
          <FiArrowLeft /> Back
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Title & Category */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize mb-3 ${getCategoryColor(event.category)}`}>
                {event.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-800">{event.title}</h1>
            </div>
            {event.isPaid ? (
              <div className="text-right">
                <p className="text-sm text-gray-500">Entry Fee</p>
                <p className="text-3xl font-bold text-campus-accent">₹{event.price}</p>
              </div>
            ) : (
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm">Free Entry</span>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <FiCalendar className="text-xl text-primary-500" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-semibold text-gray-800">{formatDate(event.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <FiClock className="text-xl text-primary-500" />
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="font-semibold text-gray-800">{event.startTime} - {event.endTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <FiMapPin className="text-xl text-primary-500" />
              <div>
                <p className="text-xs text-gray-500">Venue</p>
                <p className="font-semibold text-gray-800">{event.venue?.name || "TBA"}</p>
                <p className="text-xs text-gray-500">{event.venue?.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <FiUsers className="text-xl text-primary-500" />
              <div>
                <p className="text-xs text-gray-500">Participants</p>
                <p className="font-semibold text-gray-800">{event.currentParticipants} / {event.maxParticipants}</p>
                {/* Progress bar */}
                <div className="w-32 h-1.5 bg-gray-200 rounded-full mt-1">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${Math.min(100, (event.currentParticipants / event.maxParticipants) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Organizer */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl mb-8">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white">
              <FiUser />
            </div>
            <div>
              <p className="text-xs text-gray-500">Organized by</p>
              <p className="font-semibold text-gray-800">
                {event.organizer?.organizationName || `${event.organizer?.firstName} ${event.organizer?.lastName}`}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-3">About this Event</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-1">
                <FiTag /> Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, i) => (
                  <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {event.requirements && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Requirements</h2>
              <p className="text-gray-600 leading-relaxed">{event.requirements}</p>
            </div>
          )}

          {/* Register Button */}
          <div className="border-t pt-6">
            {isPast ? (
              <button disabled className="w-full py-4 bg-gray-300 text-gray-500 rounded-xl font-semibold text-lg cursor-not-allowed">
                Event has ended
              </button>
            ) : isRegistered ? (
              <button disabled className="w-full py-4 bg-green-100 text-green-700 rounded-xl font-semibold text-lg cursor-not-allowed">
                ✅ You're Registered!
              </button>
            ) : isFull ? (
              <button disabled className="w-full py-4 bg-red-100 text-red-500 rounded-xl font-semibold text-lg cursor-not-allowed">
                Event is Full
              </button>
            ) : user?.role !== "student" ? (
              <p className="text-center text-gray-500">Only students can register for events</p>
            ) : (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="w-full py-4 bg-campus-accent hover:bg-red-600 text-white rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {registering ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Register Now 🚀"
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>

      <div className="h-12" />
    </div>
  );
};

export default EventDetails;