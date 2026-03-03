const Certificate = require("../models/Certificate");
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const User = require("../models/User");
const ApiResponse = require("../utils/ApiResponse");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateCertificate = async (req, res) => {
  try {
    const { eventId, studentId } = req.body;
    const reg = await Registration.findOne({ student: studentId, event: eventId, status: "attended" });
    if (!reg) return ApiResponse.badRequest("Student has not attended").send(res);

    const existing = await Certificate.findOne({ student: studentId, event: eventId });
    if (existing) return ApiResponse.success(existing, "Certificate exists").send(res);

    const student = await User.findById(studentId);
    const event = await Event.findById(eventId);

    const certsDir = path.join(__dirname, "..", "media", "certificates");
    if (!fs.existsSync(certsDir)) fs.mkdirSync(certsDir, { recursive: true });

    const fileName = `cert_${studentId}_${eventId}_${Date.now()}.pdf`;
    const filePath = path.join(certsDir, fileName);

    await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ layout: "landscape", size: "A4" });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke("#3B82F6");
      doc.fontSize(36).font("Helvetica-Bold").fillColor("#1E3A8A")
        .text("Certificate of Participation", 0, 100, { align: "center" });
      doc.moveDown(1);
      doc.fontSize(16).font("Helvetica").fillColor("#374151")
        .text("This is to certify that", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(28).font("Helvetica-Bold").fillColor("#1E40AF")
        .text(`${student.firstName} ${student.lastName}`, { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(16).font("Helvetica").fillColor("#374151")
        .text("has successfully participated in", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(22).font("Helvetica-Bold").fillColor("#1E40AF")
        .text(`"${event.title}"`, { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(14).font("Helvetica").fillColor("#6B7280")
        .text(`held on ${new Date(event.date).toLocaleDateString("en-IN")}`, { align: "center" });
      doc.moveDown(2);
      doc.fontSize(12).fillColor("#9CA3AF")
        .text("CampusHive - Smart Campus Management", { align: "center" });

      doc.end();
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    const certificate = await Certificate.create({
      student: studentId, event: eventId, certificateUrl: `certificates/${fileName}`,
    });
    return ApiResponse.created(certificate, "Certificate generated").send(res);
  } catch (error) {
    console.error("Certificate Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.userId })
      .populate("event", "title date category").sort({ issuedAt: -1 });
    return ApiResponse.success(certificates, "Certificates loaded").send(res);
  } catch (error) {
    return ApiResponse.internalServerError().send(res);
  }
};

module.exports = { generateCertificate, getMyCertificates };