import { useState, useEffect } from "react";
import { FiStar, FiSend, FiMessageSquare } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../api/axios";
import Navbar from "../../components/common/Navbar";
import StickyHeader from "../../components/common/StickyHeader";
import NmRippleButton from "../../components/common/NmRippleButton";

const Feedback = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
        const { data } = await API.get("/registrations/my-registrations");
      if (data.success) {
        const attended = data.data.filter((r) => r.status === "attended");
        setRegistrations(attended);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventChange = async (eventId) => {
    setSelectedEvent(eventId);
    if (!eventId) {
      setFeedbacks([]);
      return;
    }
    setFeedbackLoading(true);
    try {
      const { data } = await API.get(`/feedback/event/${eventId}`);
      if (data.success) setFeedbacks(data.data.feedbacks || []);
    } catch (error) {
      console.error("Feedback fetch error:", error);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !rating) {
      toast.error("Select an event and rating");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await API.post("/feedback", {
        eventId: selectedEvent,
        rating,
        comment,
      });
      if (data.success) {
        toast.success("Feedback submitted! 🎉");
        setRating(0);
        setComment("");
        handleEventChange(selectedEvent);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count, size = "text-lg") => {
    return [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        className={`${size} ${i < count ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <div className="sidebar-layout">
      <Navbar />
      <div className="main-content">
        <StickyHeader breadcrumbs={["Home", "Feedback"]} />
        <div className="px-6 pb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-2xl font-bold" style={{ color: "var(--nm-text)" }}>💬 Event Feedback</h1>
            <p style={{ color: "var(--nm-text-secondary)" }}>Share your experience from attended events</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : registrations.length === 0 ? (
            <div className="nm-flat text-center py-20">
              <p className="text-6xl mb-4">📝</p>
              <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--nm-text)" }}>No attended events</h3>
              <p style={{ color: "var(--nm-text-secondary)" }}>Attend events first to leave feedback!</p>
            </div>
          ) : (
            <>
              {/* Feedback Form */}
              <form onSubmit={handleSubmit} className="nm-flat p-6 mb-8 space-y-5">
                <h3 className="font-semibold text-lg flex items-center gap-2" style={{ color: "var(--nm-text)" }}>
                  <FiMessageSquare className="text-primary-500" /> Submit Feedback
                </h3>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--nm-text)" }}>Select Event *</label>
                  <select
                    value={selectedEvent}
                    onChange={(e) => handleEventChange(e.target.value)}
                    required
                    className="nm-input w-full px-4 py-2.5"
                    style={{ color: "var(--nm-text)" }}
                  >
                    <option value="">Choose an attended event</option>
                    {registrations.map((r) => (
                      <option key={r._id} value={r.event?._id}>
                        {r.event?.title || "Unknown Event"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--nm-text)" }}>Rating *</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition transform hover:scale-110"
                      >
                        <FiStar
                          className={`text-3xl ${
                            star <= (hoverRating || rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                    {rating > 0 && <span className="text-sm self-center ml-2" style={{ color: "var(--nm-text-secondary)" }}>{rating}/5</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--nm-text)" }}>Comment</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Share your experience..."
                    className="nm-input w-full px-4 py-2.5 resize-none"
                    style={{ color: "var(--nm-text)" }}
                  />
                </div>

                <NmRippleButton
                  type="submit"
                  disabled={submitting || !selectedEvent || !rating}
                  className="flex items-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><FiSend /> Submit Feedback</>
                  )}
                </NmRippleButton>
              </form>

              {/* Existing Feedbacks */}
              {selectedEvent && (
                <div className="nm-flat p-6">
                  <h3 className="font-semibold text-lg mb-4" style={{ color: "var(--nm-text)" }}>📋 Event Feedback</h3>
                  {feedbackLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : feedbacks.length === 0 ? (
                    <p className="text-center py-6" style={{ color: "var(--nm-text-secondary)" }}>No feedback yet. Be the first!</p>
                  ) : (
                    <div className="space-y-4">
                      {feedbacks.map((fb, index) => (
                        <motion.div
                          key={fb._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="nm-inset p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xs">
                                {fb.student?.firstName?.[0]}{fb.student?.lastName?.[0]}
                              </div>
                              <span className="font-medium text-sm" style={{ color: "var(--nm-text)" }}>
                                {fb.student?.firstName} {fb.student?.lastName}
                              </span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {renderStars(fb.rating, "text-sm")}
                            </div>
                          </div>
                          {fb.comment && <p className="text-sm" style={{ color: "var(--nm-text-secondary)" }}>{fb.comment}</p>}
                          <p className="text-xs mt-2" style={{ color: "var(--nm-text-secondary)" }}>
                            {new Date(fb.createdAt).toLocaleDateString("en-IN")}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
