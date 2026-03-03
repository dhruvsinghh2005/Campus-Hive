import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiCalendar, FiMapPin, FiUsers, FiFilter, FiClock } from "react-icons/fi";
import { motion } from "framer-motion";
import API from "../../api/axios";

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
      technical: "bg-blue-100 text-blue-700",
      cultural: "bg-purple-100 text-purple-700",
      sports: "bg-green-100 text-green-700",
      workshop: "bg-orange-100 text-orange-700",
      seminar: "bg-teal-100 text-teal-700",
      other: "bg-gray-100 text-gray-700",
    };
    return colors[cat] || colors.other;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-campus-dark to-campus-light text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">🎪 Explore Events</h1>
          <p className="text-gray-300 mb-6">Discover and register for exciting campus events</p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events..."
                className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-800 outline-none focus:ring-2 focus:ring-campus-accent"
              />
            </div>
            <button type="submit" className="bg-campus-accent hover:bg-red-600 px-6 py-3 rounded-xl font-semibold transition">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => { setCategory(""); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              !category ? "bg-campus-dark text-white" : "bg-white text-gray-600 hover:bg-gray-100 border"
            }`}
          >
            <FiFilter className="inline mr-1" /> All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition ${
                category === cat ? "bg-campus-dark text-white" : "bg-white text-gray-600 hover:bg-gray-100 border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📭</p>
            <h3 className="text-xl font-semibold text-gray-700">No events found</h3>
            <p className="text-gray-500 mt-2">Check back later for upcoming events!</p>
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
                <Link to={`/events/${event._id}`} className="block">
                  <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden group">
                    {/* Banner */}
                    <div className="h-48 bg-gradient-to-br from-campus-dark to-campus-light relative overflow-hidden">
                      {event.banner ? (
                        <img
                          src={`http://localhost:4000/media/${event.banner}`}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl">🎪</span>
                        </div>
                      )}
                      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold capitalize ${getCategoryColor(event.category)}`}>
                        {event.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-primary-600 transition">
                        {event.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-3 line-clamp-2">{event.description}</p>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-primary-500" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiClock className="text-primary-500" />
                          <span>{event.startTime} - {event.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiMapPin className="text-primary-500" />
                          <span>{event.venue?.name || "TBA"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiUsers className="text-primary-500" />
                          <span>{event.currentParticipants}/{event.maxParticipants} registered</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center mt-4 pt-3 border-t">
                        <span className="text-sm text-gray-500">
                          By {event.organizer?.organizationName || `${event.organizer?.firstName} ${event.organizer?.lastName}`}
                        </span>
                        {event.isPaid ? (
                          <span className="text-sm font-bold text-campus-accent">₹{event.price}</span>
                        ) : (
                          <span className="text-sm font-bold text-green-600">Free</span>
                        )}
                      </div>
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
              className="px-4 py-2 rounded-lg bg-white border hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded-lg transition ${
                  page === i + 1 ? "bg-campus-dark text-white" : "bg-white border hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-white border hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;