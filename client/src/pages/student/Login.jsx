import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import NmRippleButton from "../../components/common/NmRippleButton";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
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
      const { data } = await API.post("/auth/login", formData);
      if (data.success) {
        login(data.data.token, data.data);
        toast.success("Login successful!");
        const role = data.data.role;
        if (role === "admin") navigate("/admin/dashboard");
        else if (role === "organizer") navigate("/organizer/dashboard");
        else navigate("/student/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--nm-bg)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="nm-flat p-8 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="nm-inset w-20 h-20 mx-auto flex items-center justify-center text-4xl mb-4 rounded-2xl">
            🎓
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--nm-text)" }}>
            CampusHive
          </h1>
          <p className="mt-2" style={{ color: "var(--nm-text-secondary)" }}>Welcome back! Sign in to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--nm-text)" }}>Email</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--nm-text-secondary)" }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@kiit.ac.in"
                required
                className="nm-input w-full pl-10 pr-4 py-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--nm-text)" }}>Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--nm-text-secondary)" }} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="nm-input w-full pl-10 pr-4 py-3 text-sm"
              />
            </div>
          </div>

          <NmRippleButton
            type="submit"
            disabled={loading}
            className="w-full py-3 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><FiLogIn /> Sign In</>
            )}
          </NmRippleButton>
        </form>

        {/* Register link */}
        <p className="text-center mt-6 text-sm" style={{ color: "var(--nm-text-secondary)" }}>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-indigo-500 font-semibold hover:text-indigo-600">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;