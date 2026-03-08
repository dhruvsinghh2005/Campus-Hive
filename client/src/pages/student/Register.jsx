import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiPhone, FiHash, FiBook, FiUserPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import NmRippleButton from "../../components/common/NmRippleButton";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    enrollmentNo: "",
    department: "",
    year: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", formData);
      if (data.success) {
        login(data.data.token, data.data);
        toast.success("Registration successful!");
        navigate("/student/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const departments = ["CSE", "ECE", "EE", "ME", "CE", "IT", "BioTech", "Law", "MBA"];

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--nm-bg)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="nm-flat p-8 w-full max-w-lg"
      >
        <div className="text-center mb-6">
          <div className="nm-inset w-16 h-16 mx-auto flex items-center justify-center text-3xl mb-3 rounded-2xl">
            🎓
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--nm-text)" }}>CampusHive</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--nm-text-secondary)" }}>Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--nm-text)" }}>First Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--nm-text-secondary)" }} />
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                  placeholder="John" required className="nm-input w-full pl-10 pr-4 py-2.5 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--nm-text)" }}>Last Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--nm-text-secondary)" }} />
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                  placeholder="Doe" required className="nm-input w-full pl-10 pr-4 py-2.5 text-sm" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--nm-text)" }}>Email</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--nm-text-secondary)" }} />
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="your.email@kiit.ac.in" required className="nm-input w-full pl-10 pr-4 py-2.5 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--nm-text)" }}>Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--nm-text-secondary)" }} />
              <input type="password" name="password" value={formData.password} onChange={handleChange}
                placeholder="Min 6 characters" required minLength={6} className="nm-input w-full pl-10 pr-4 py-2.5 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--nm-text)" }}>Phone</label>
            <div className="relative">
              <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--nm-text-secondary)" }} />
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="9876543210" required className="nm-input w-full pl-10 pr-4 py-2.5 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--nm-text)" }}>Enrollment No</label>
              <div className="relative">
                <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--nm-text-secondary)" }} />
                <input type="text" name="enrollmentNo" value={formData.enrollmentNo} onChange={handleChange}
                  placeholder="2101001" className="nm-input w-full pl-10 pr-4 py-2.5 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--nm-text)" }}>Department</label>
              <div className="relative">
                <FiBook className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--nm-text-secondary)" }} />
                <select name="department" value={formData.department} onChange={handleChange}
                  className="nm-input w-full pl-10 pr-4 py-2.5 text-sm">
                  <option value="">Select</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--nm-text)" }}>Year</label>
            <select name="year" value={formData.year} onChange={handleChange}
              className="nm-input w-full px-4 py-2.5 text-sm">
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <NmRippleButton type="submit" disabled={loading} className="w-full py-3 flex items-center justify-center gap-2 mt-2">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><FiUserPlus /> Create Account</>
            )}
          </NmRippleButton>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: "var(--nm-text-secondary)" }}>
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-500 font-semibold hover:text-indigo-600">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;