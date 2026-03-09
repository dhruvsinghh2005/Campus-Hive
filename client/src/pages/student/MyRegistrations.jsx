import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiMapPin, FiClock, FiX, FiExternalLink } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { QRCode } from "react-qr-code";
import API from "../../api/axios";
import Navbar from "../../components/common/Navbar";

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const { data } = await API.get("/registrations/my-registrations");
      if (data.success) setRegistrations(data.data);
    } catch (error) {
      toast.error("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (regId) => {
    if (!confirm("Are you sure you want to cancel this registration?")) return;
    try {
      const { data } = await API.patch(`/registrations/${regId}/cancel`);
      if (data.success) {
        toast.success("Registration cancelled");
        fetchRegistrations();
      }
    } catch (error) {
      toast.error("Failed to cancel");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      registered: "bg-blue-100 text-blue-700",
      attended: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      no_show: "bg-yellow-100 text-yellow-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "short", month: "short", day: "numeric", year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📋 My Registrations</h1>

        {registrations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <p className="text-6xl mb-4">📭</p>
            <h3 className="text-xl font-semibold text-gray-700">No registrations yet</h3>
            <p className="text-gray-500 mt-2 mb-6">Browse events and register for something exciting!</p>
            <Link to="/events" className="bg-campus-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((reg, index) => (
              <motion.div
                key={reg._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{reg.event?.title || "Event Removed"}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(reg.status)}`}>
                      {reg.status.replace("_", " ")}
                    </span>
                  </div>

                  {reg.event && (
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <FiCalendar className="text-primary-500" /> {formatDate(reg.event.date)}
                      </p>
                      <p className="flex items-center gap-2">
                        <FiClock className="text-primary-500" /> {reg.event.startTime} - {reg.event.endTime}
                      </p>
                      <p className="flex items-center gap-2">
                        <FiMapPin className="text-primary-500" /> {reg.event.venue?.name || "TBA"}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    {reg.event && (
                      <Link
                        to={`/events/${reg.event._id}`}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <FiExternalLink /> View Event
                      </Link>
                    )}
                    {reg.status === "registered" && (
                      <>
                        <button
                          onClick={() => setSelectedQR(reg)}
                          className="text-sm bg-campus-dark text-white px-3 py-1.5 rounded-lg hover:bg-opacity-90 transition"
                        >
                          Show QR
                        </button>
                        <button
                          onClick={() => handleCancel(reg._id)}
                          className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <FiX /> Cancel
                        </button>
                      </>
                    )}
                    {reg.status === "attended" && (
                      <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                        ✅ Checked In
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* QR Modal */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedQR(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-2">{selectedQR.event?.title}</h3>
            <p className="text-sm text-gray-500 mb-6">Show this QR at the event entrance</p>
            <div className="flex justify-center mb-6">
              <QRCode
                value={JSON.stringify({
                  studentId: selectedQR.student,
                  eventId: selectedQR.event?._id,
                  registrationId: selectedQR._id,
                })}
                size={200}
              />
            </div>
            <button
              onClick={() => setSelectedQR(null)}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyRegistrations;