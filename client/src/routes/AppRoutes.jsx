import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/student/Login";
import Register from "../pages/student/Register";
import Dashboard from "../pages/student/Dashboard";
import Events from "../pages/student/Events";
import EventDetails from "../pages/student/EventDetails";
import MyRegistrations from "../pages/student/MyRegistrations";
import Notifications from "../pages/student/Notifications";
import Certificates from "../pages/student/Certificates";
import Feedback from "../pages/student/Feedback";
import OrganizerDashboard from "../pages/organizer/Dashboard";
import CreateEvent from "../pages/organizer/CreateEvent";
import MyEvents from "../pages/organizer/MyEvents";
import ScanQR from "../pages/organizer/ScanQR";
import EventAttendees from "../pages/organizer/EventAttendees";
import AdminDashboard from "../pages/admin/Dashboard";
import PendingEvents from "../pages/admin/PendingEvents";
import Users from "../pages/admin/Users";
import Announcements from "../pages/admin/Announcements";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { token, user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (token && user) return <Navigate to={`/${user.role}/dashboard`} />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Student */}
      <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={["student"]}><Dashboard /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
      <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
      <Route path="/my-registrations" element={<ProtectedRoute allowedRoles={["student"]}><MyRegistrations /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/certificates" element={<ProtectedRoute allowedRoles={["student"]}><Certificates /></ProtectedRoute>} />
      <Route path="/feedback" element={<ProtectedRoute allowedRoles={["student"]}><Feedback /></ProtectedRoute>} />

      {/* Organizer */}
      <Route path="/organizer/dashboard" element={<ProtectedRoute allowedRoles={["organizer"]}><OrganizerDashboard /></ProtectedRoute>} />
      <Route path="/organizer/create-event" element={<ProtectedRoute allowedRoles={["organizer"]}><CreateEvent /></ProtectedRoute>} />
      <Route path="/organizer/my-events" element={<ProtectedRoute allowedRoles={["organizer"]}><MyEvents /></ProtectedRoute>} />
      <Route path="/organizer/scan/:eventId" element={<ProtectedRoute allowedRoles={["organizer"]}><ScanQR /></ProtectedRoute>} />
      <Route path="/organizer/event/:eventId/attendees" element={<ProtectedRoute allowedRoles={["organizer"]}><EventAttendees /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/pending-events" element={<ProtectedRoute allowedRoles={["admin"]}><PendingEvents /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><Users /></ProtectedRoute>} />
      <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={["admin"]}><Announcements /></ProtectedRoute>} />

      {/* Default */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;