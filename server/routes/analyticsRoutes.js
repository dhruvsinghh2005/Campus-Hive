const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { getDashboardAnalytics } = require("../controllers/analyticsController");

router.get("/dashboard", auth, authorize("admin"), getDashboardAnalytics);

module.exports = router;