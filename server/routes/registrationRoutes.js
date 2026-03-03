const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const {
  registerForEvent, getMyRegistrations, cancelRegistration, verifyQR, getEventAttendees,
} = require("../controllers/registrationController");

router.post("/", auth, authorize("student"), registerForEvent);
router.get("/my-registrations", auth, getMyRegistrations);
router.patch("/:id/cancel", auth, cancelRegistration);
router.post("/verify-qr", auth, authorize("organizer"), verifyQR);
router.get("/event/:eventId", auth, authorize("organizer", "admin"), getEventAttendees);

module.exports = router;