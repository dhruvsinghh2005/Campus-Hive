import { useState, useEffect } from "react";
import { FiAward, FiDownload, FiCalendar } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../api/axios";
import Navbar from "../../components/common/Navbar";

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data } = await API.get("/certificates/my-certificates");
      if (data.success) setCertificates(data.data);
    } catch (error) {
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (certUrl) => {
    const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:4000";
    window.open(`${baseUrl}/media/${certUrl}`, "_blank");
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "long", day: "numeric", year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🏆 My Certificates</h1>
          <p className="text-gray-500">Download your event participation certificates</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <p className="text-6xl mb-4">📜</p>
            <h3 className="text-xl font-semibold text-gray-700">No certificates yet</h3>
            <p className="text-gray-500 mt-2">Attend events to earn certificates!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert, index) => (
              <motion.div
                key={cert._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden border hover:shadow-lg transition"
              >
                {/* Certificate Preview Header */}
                <div className="bg-gradient-to-r from-primary-500 to-primary-700 p-6 text-white text-center">
                  <FiAward className="text-4xl mx-auto mb-2 opacity-80" />
                  <h3 className="font-bold text-lg">Certificate of Participation</h3>
                </div>

                <div className="p-5">
                  <h4 className="font-bold text-gray-800 text-lg mb-2">{cert.event?.title || "Event"}</h4>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiCalendar className="text-primary-500" />
                      <span>Event Date: {cert.event?.date ? formatDate(cert.event.date) : "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiAward className="text-primary-500" />
                      <span>Issued: {formatDate(cert.issuedAt || cert.createdAt)}</span>
                    </div>
                    {cert.event?.category && (
                      <span className="inline-block bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full text-xs capitalize">
                        {cert.event.category}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDownload(cert.certificateUrl)}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <FiDownload /> Download PDF
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificates;