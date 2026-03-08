import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiUsers, FiCheckCircle, FiXCircle, FiDownload, FiArrowLeft, FiCamera, FiAward } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../api/axios";
import OrganizerNavbar from "../../components/common/OrganizerNavbar";
import StickyHeader from "../../components/common/StickyHeader";
import NmRippleButton from "../../components/common/NmRippleButton";

const EventAttendees = () => {
  const { eventId } = useParams();
  const [attendees, setAttendees] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [generatingCert, setGeneratingCert] = useState(null);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      const [attendeesRes, eventRes] = await Promise.all([
        API.get(`/registrations/event/${eventId}`),
        API.get(`/events/${eventId}`),
      ]);
      if (attendeesRes.data.success) setAttendees(attendeesRes.data.data);
      if (eventRes.data.success) setEvent(eventRes.data.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async (studentId) => {
    setGeneratingCert(studentId);
    try {
      const { data } = await API.post("/certificates/generate", { eventId, studentId });
      if (data.success) {
        toast.success("Certificate generated! 📜");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate certificate");
    } finally {
      setGeneratingCert(null);
    }
  };

  const generateAllCertificates = async () => {
    const attended = attendees.filter((a) => a.status === "attended");
    if (attended.length === 0) {
      toast.error("No attended students found");
      return;
    }
    toast.loading(`Generating ${attended.length} certificates...`, { id: "gen-all" });
    let success = 0;
    for (const a of attended) {
      try {
        await API.post("/certificates/generate", { eventId, studentId: a.student._id });
        success++;
      } catch (error) {
        // Skip duplicates silently
      }
    }
    toast.dismiss("gen-all");
    toast.success(`${success} certificates generated!`);
  };

  const exportCSV = () => {
    const headers = "Name,Email,Enrollment,Department,Year,Status,Checked In\n";
    const rows = attendees.map((a) => 
      `${a.student?.firstName} ${a.student?.lastName},${a.student?.email},${a.student?.enrollmentNo},${a.student?.department},${a.student?.year},${a.status},${a.checkedInAt ? new Date(a.checkedInAt).toLocaleString("en-IN") : "N/A"}`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendees_${event?.title || "event"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
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

  const filtered = filter === "all" ? attendees : attendees.filter((a) => a.status === filter);
  const attendedCount = attendees.filter((a) => a.status === "attended").length;
  const registeredCount = attendees.filter((a) => a.status === "registered").length;

  return (
    <div className="sidebar-layout">
      <OrganizerNavbar />
      <div className="main-content">
        <StickyHeader breadcrumbs={["Organizer", "Event Attendees"]} />
        <div className="px-6 pb-8">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <Link to="/organizer/my-events" className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1 mb-2">
                <FiArrowLeft /> Back to My Events
              </Link>
              <h1 className="text-2xl font-bold" style={{ color: "var(--nm-text)" }}>👥 {event?.title || "Event"} — Attendees</h1>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link to={`/organizer/scan/${eventId}`}>
                <NmRippleButton className="text-sm py-2.5 flex items-center gap-2">
                  <FiCamera /> Scan QR
                </NmRippleButton>
              </Link>
              <NmRippleButton onClick={generateAllCertificates} className="text-sm py-2.5 flex items-center gap-2">
                <FiAward /> Generate All Certificates
              </NmRippleButton>
              <NmRippleButton onClick={exportCSV} variant="flat" className="text-sm py-2.5 flex items-center gap-2">
                <FiDownload /> Export CSV
              </NmRippleButton>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total Registered", value: attendees.length, color: "#3b82f6" },
                  { label: "Checked In", value: attendedCount, color: "#10b981" },
                  { label: "Pending", value: registeredCount, color: "#f59e0b" },
                  { label: "Attendance %", value: attendees.length > 0 ? `${Math.round((attendedCount / attendees.length) * 100)}%` : "0%", color: "#8b5cf6" },
                ].map((stat) => (
                  <div key={stat.label} className="nm-flat-hover p-4">
                    <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs" style={{ color: "var(--nm-text-secondary)" }}>{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div className="flex gap-2 mb-4">
                {["all", "registered", "attended", "cancelled"].map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                      filter === f ? "nm-inset font-semibold" : "nm-button"
                    }`}
                    style={{ color: "var(--nm-text)" }}>
                    {f} {f !== "all" && `(${attendees.filter((a) => a.status === f).length})`}
                  </button>
                ))}
              </div>

              {/* Table */}
              {filtered.length === 0 ? (
                <div className="nm-flat text-center py-16">
                  <p className="text-4xl mb-3">📋</p>
                  <p style={{ color: "var(--nm-text-secondary)" }}>No attendees found</p>
                </div>
              ) : (
                <div className="nm-flat overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="nm-inset text-left" style={{ color: "var(--nm-text-secondary)" }}>
                          <th className="px-6 py-4 font-medium">#</th>
                          <th className="px-6 py-4 font-medium">Student</th>
                          <th className="px-6 py-4 font-medium">Email</th>
                          <th className="px-6 py-4 font-medium">Department</th>
                          <th className="px-6 py-4 font-medium">Status</th>
                          <th className="px-6 py-4 font-medium">Checked In</th>
                          <th className="px-6 py-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((reg, index) => (
                          <motion.tr key={reg._id}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }}
                            className="border-b last:border-0 hover:opacity-90 transition"
                            style={{ borderColor: "var(--nm-shadow)" }}>
                            <td className="px-6 py-4" style={{ color: "var(--nm-text-secondary)" }}>{index + 1}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xs">
                                  {reg.student?.firstName?.[0]}{reg.student?.lastName?.[0]}
                                </div>
                                <div>
                                  <p className="font-medium" style={{ color: "var(--nm-text)" }}>{reg.student?.firstName} {reg.student?.lastName}</p>
                                  <p className="text-xs" style={{ color: "var(--nm-text-secondary)" }}>{reg.student?.enrollmentNo}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4" style={{ color: "var(--nm-text-secondary)" }}>{reg.student?.email}</td>
                            <td className="px-6 py-4" style={{ color: "var(--nm-text-secondary)" }}>{reg.student?.department} — Y{reg.student?.year}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(reg.status)}`}>
                                {reg.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs" style={{ color: "var(--nm-text-secondary)" }}>
                              {reg.checkedInAt ? new Date(reg.checkedInAt).toLocaleString("en-IN") : "—"}
                            </td>
                            <td className="px-6 py-4">
                              {reg.status === "attended" && (
                                <button
                                  onClick={() => generateCertificate(reg.student._id)}
                                  disabled={generatingCert === reg.student._id}
                                  className="text-primary-600 hover:text-primary-700 text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                                >
                                  {generatingCert === reg.student._id ? (
                                    <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <FiAward />
                                  )}
                                  Certificate
                                </button>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventAttendees;
