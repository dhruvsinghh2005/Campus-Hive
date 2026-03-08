import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiCalendar, FiMapPin, FiUsers, FiFilter, FiClock } from "react-icons/fi";
import { motion } from "framer-motion";
import API from "../../api/axios";
import Navbar from "../../components/common/Navbar";
import StickyHeader from "../../components/common/StickyHeader";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = ["technical", "cultural", "sports", "workshop", "seminar", "other"];

  useEffect(() => {
    fetchEvents();
  }, [page, category]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (category) params.category = category;
      if (search) params.search = search;
      const { data } = await API.get("/events", { params });
      if (data.success) {
        setEvents(data.data.events);
        setTotalPages(data.data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "short", year: "numeric", month: "short", day: "numeric",
    });
  };

  const getCategoryColor = (cat) => {
    const colors = {
      technical: "#3b82f6",
      cultural: "#8b5cf6",
      sports: "#10b981",
      workshop: "#f59e0b",
      seminar: "#06b6d4",
      other: "#6b7280",
    };
    return colors[cat] || colors.other;
  };

  return (
    <div className="sidebar-layout">
      <Navbar />

      <div className="main-content">
        <StickyHeader breadcrumbs={["Home", "Events"]} />

        <div className="px-6 pb-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--nm-text)" }}>🎪 Explore Events</h1>
            <p style={{ color: "var(--nm-text-secondary)" }}>Discover and register for exciting campus events</p>
          </div>

          {/* Search + Filters */}
          <div className="nm-flat p-5 mb-8">
            <form onSubmit={handleSearch} className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--nm-text-secondary)" }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events..."
                  className="nm-input w-full pl-10 pr-4 py-3 text-sm"
                />
              </div>
              <button type="submit" className="nm-accent-btn px-6 py-3 text-sm font-semibold">
                Search
              </button>
            </form>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setCategory(""); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${!category ? "nm-inset" : "nm-button"}`}
                style={{ color: !category ? "#6366f1" : "var(--nm-text)" }}
              >
                <FiFilter className="inline mr-1.5" />All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setPage(1); }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${category === cat ? "nm-inset" : "nm-button"}`}
                  style={{ color: category === cat ? getCategoryColor(cat) : "var(--nm-text)" }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">📭</p>
              <h3 className="text-xl font-semibold" style={{ color: "var(--nm-text)" }}>No events found</h3>
              <p className="mt-2" style={{ color: "var(--nm-text-secondary)" }}>Check back later for upcoming events!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/events/${event._id}`} className="block nm-flat-hover overflow-hidden">
                    {/* Banner */}
                    <div className="h-44 relative overflow-hidden rounded-t-nm" style={{ borderRadius: "16px 16px 0 0" }}>
                      {event.banner ? (
                        <img
                          src={`http://localhost:4000/media/${event.banner}`}
                          alt={event.title}
                          className="w-full h-full object-cover hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #a78bfa)" }}>
                          <span className="text-5xl">🎪</span>
                        </div>
                      )}
                      <span
                        className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold capitalize text-white"
                        style={{ background: getCategoryColor(event.category) }}
                      >
                        {event.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-base font-bold mb-2 line-clamp-1" style={{ color: "var(--nm-text)" }}>
                        {event.title}
                      </h3>
                      <p className="text-sm mb-3 line-clamp-2" style={{ color: "var(--nm-text-secondary)" }}>{event.description}</p>

                      <div className="space-y-1.5 text-xs" style={{ color: "var(--nm-text-secondary)" }}>
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-indigo-500 flex-shrink-0" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiClock className="text-indigo-500 flex-shrink-0" />
                          <span>{event.startTime} - {event.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiMapPin className="text-indigo-500 flex-shrink-0" />
                          <span>{event.venue?.name || "TBA"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiUsers className="text-indigo-500 flex-shrink-0" />
                          <span>{event.currentParticipants}/{event.maxParticipants} registered</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-3" style={{ borderTop: "1px solid var(--nm-shadow)" }}>
                        <span className="text-xs" style={{ color: "var(--nm-text-secondary)" }}>
                          {event.organizer?.organizationName || `${event.organizer?.firstName} ${event.organizer?.lastName}`}
                        </span>
                        {event.isPaid ? (
                          <span className="text-sm font-bold text-indigo-500">₹{event.price}</span>
                        ) : (
                          <span className="text-sm font-bold text-emerald-500">Free</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="nm-button px-4 py-2 text-sm disabled:opacity-50"
                style={{ color: "var(--nm-text)" }}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 text-sm rounded-xl transition ${page === i + 1 ? "nm-inset" : "nm-button"}`}
                  style={{ color: page === i + 1 ? "#6366f1" : "var(--nm-text)" }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="nm-button px-4 py-2 text-sm disabled:opacity-50"
                style={{ color: "var(--nm-text)" }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
