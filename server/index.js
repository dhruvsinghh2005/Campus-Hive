require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const connectToMongo = require("./config/db");

connectToMongo();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("dev"));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use("/media", express.static(path.join(__dirname, "media")));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "CampusHive API is running!", status: "OK" });
});

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/venues", require("./routes/venueRoutes"));
app.use("/api/registrations", require("./routes/registrationRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/certificates", require("./routes/certificateRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found", data: null });
});

// Global error handler (Express 5 compatible - 4 params)
app.use((err, req, res, next) => {
  console.error("Global Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    data: null,
  });
});

// Socket.IO
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("join", (userId) => {
    socket.join(userId);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`CampusHive Server running on http://localhost:${PORT}`);
});