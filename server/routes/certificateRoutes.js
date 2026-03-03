const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { generateCertificate, getMyCertificates } = require("../controllers/certificateController");

router.post("/generate", auth, authorize("organizer", "admin"), generateCertificate);
router.get("/my-certificates", auth, getMyCertificates);

module.exports = router;