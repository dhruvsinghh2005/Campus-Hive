import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSend, FiImage, FiX } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../api/axios";
import OrganizerNavbar from "../../components/common/OrganizerNavbar";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    department: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    maxParticipants: "",
    isPaid: false,
    price: 0,
    tags: "",
    requirements: "",
    estimatedBudget: "",
  });

  const categories = ["technical", "cultural", "sports", "workshop", "seminar", "other"];
  const departments = ["CSE", "ECE", "EE", "ME", "CE", "IT", "BioTech", "Law", "MBA", "All Departments"];

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const { data } = await API.get("/venues");
      if (data.success) setVenues(data.data);
    } catch (error) {
      console.error("Failed to load venues:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBanner = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "tags") {
          const tagsArr = formData.tags.split(",").map((t) => t.trim()).filter(Boolean);
          tagsArr.forEach((tag) => payload.append("tags[]", tag));
        } else if (key === "isPaid") {
          payload.append(key, formData[key]);
        } else if (formData[key]) {
          payload.append(key, formData[key]);
        }
      });

      if (bannerFile) payload.append("banner", bannerFile);

      const { data } = await API.post("/events", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.success) {
        toast.success("Event submitted for approval! 🎉");
        navigate("/organizer/my-events");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <OrganizerNavbar />

      <div className="max-w-3xl mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">🎪 Create New Event</h1>
          <p className="text-gray-500 mb-8">Fill in the details. Your event will be reviewed by an admin.</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Banner Upload */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Event Banner</h3>
            {bannerPreview ? (
              <div className="relative">
                <img src={bannerPreview} alt="Banner" className="w-full h-48 object-cover rounded-lg" />
                <button type="button" onClick={removeBanner}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600">
                  <FiX />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition">
                <FiImage className="text-3xl text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to upload banner image</p>
                <input type="file" accept="image/*" onChange={handleBanner} className="hidden" />
              </label>
            )}
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h3 className="font-semibold text-gray-800 mb-1">Basic Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required
                placeholder="e.g. HackKIIT 2026" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-gray-800" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows={4}
                placeholder="Describe your event in detail..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none text-gray-800" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-800 bg-white">
                  <option value="">Select</option>
                  {categories.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select name="department" value={formData.department} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-800 bg-white">
                  <option value="">Select</option>
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange}
                placeholder="e.g. coding, hackathon, AI" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-gray-800" />
            </div>
          </div>

          {/* Schedule & Venue */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h3 className="font-semibold text-gray-800 mb-1">Schedule & Venue</h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-800" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
              <select name="venue" value={formData.venue} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-800 bg-white">
                <option value="">Select Venue</option>
                {venues.map((v) => (
                  <option key={v._id} value={v._id}>{v.name} — {v.location} (Cap: {v.capacity})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Participants & Pricing */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h3 className="font-semibold text-gray-800 mb-1">Participants & Pricing</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants *</label>
                <input type="number" name="maxParticipants" value={formData.maxParticipants} onChange={handleChange} required min={1}
                  placeholder="e.g. 200" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Budget (₹)</label>
                <input type="number" name="estimatedBudget" value={formData.estimatedBudget} onChange={handleChange}
                  placeholder="e.g. 5000" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-800" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" name="isPaid" checked={formData.isPaid} onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded" id="isPaid" />
              <label htmlFor="isPaid" className="text-sm font-medium text-gray-700">This is a paid event</label>
            </div>

            {formData.isPaid && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entry Fee (₹) *</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} min={1}
                  placeholder="e.g. 100" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-gray-800" />
              </div>
            )}
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Additional Requirements</h3>
            <textarea name="requirements" value={formData.requirements} onChange={handleChange} rows={3}
              placeholder="Any special requirements for the event..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none text-gray-800" />
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full bg-campus-accent hover:bg-red-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 text-lg">
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><FiSend /> Submit for Approval</>
            )}
          </button>
        </form>

        <div className="h-10" />
      </div>
    </div>
  );
};

export default CreateEvent;