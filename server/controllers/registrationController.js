const Registration = require("../models/Registration");
const Event = require("../models/Event");
const ApiResponse = require("../utils/ApiResponse");
const QRCode = require("qrcode");

const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const studentId = req.userId;

    const event = await Event.findById(eventId);
    if (!event) return ApiResponse.notFound("Event not found").send(res);
    if (event.status !== "approved") return ApiResponse.badRequest("Event not open").send(res);
    if (event.currentParticipants >= event.maxParticipants) return ApiResponse.badRequest("Event is full").send(res);

    const existing = await Registration.findOne({ student: studentId, event: eventId });
    if (existing) return ApiResponse.conflict("Already registered").send(res);

    const qrData = JSON.stringify({ studentId, eventId, timestamp: Date.now() });
    const qrCode = await QRCode.toDataURL(qrData);

    const registration = await Registration.create({
      student: studentId, event: eventId, qrCode,
      paymentStatus: event.isPaid ? "pending" : "not_required",
    });

    await Event.findByIdAndUpdate(eventId, { $inc: { currentParticipants: 1 } });
    return ApiResponse.created(registration, "Registered successfully!").send(res);
  } catch (error) {
    if (error.code === 11000) return ApiResponse.conflict("Already registered").send(res);
    return ApiResponse.internalServerError().send(res);
  }
};

const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.userId })
      .populate({ path: "event", populate: [
        { path: "venue", select: "name location" },
        { path: "organizer", select: "firstName lastName organizationName" },
      ]})
      .sort({ createdAt: -1 });
    return ApiResponse.success(registrations, "Registrations loaded").send(res);
  } catch (error) {
    return ApiResponse.internalServerError().send(res);
  }
};

const cancelRegistration = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return ApiResponse.notFound("Not found").send(res);
    if (reg.student.toString() !== req.userId) return ApiResponse.forbidden("Not authorized").send(res);
    reg.status = "cancelled";
    await reg.save();
    await Event.findByIdAndUpdate(reg.event, { $inc: { currentParticipants: -1 } });
    return ApiResponse.success(null, "Registration cancelled").send(res);
  } catch (error) {
    return ApiResponse.internalServerError().send(res);
  }
};

const verifyQR = async (req, res) => {
  try {
    const { studentId, eventId } = req.body;
    const reg = await Registration.findOne({ student: studentId, event: eventId })
      .populate("student", "firstName lastName enrollmentNo email profile");
    if (!reg) return ApiResponse.notFound("No registration found").send(res);
    if (reg.status === "attended") return ApiResponse.badRequest("Already checked in").send(res);
    if (reg.status === "cancelled") return ApiResponse.badRequest("Registration cancelled").send(res);

    reg.status = "attended";
    reg.checkedInAt = new Date();
    await reg.save();
    return ApiResponse.success({ student: reg.student, checkedInAt: reg.checkedInAt }, "Check-in successful!").send(res);
  } catch (error) {
    return ApiResponse.internalServerError().send(res);
  }
};

const getEventAttendees = async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.eventId })
      .populate("student", "firstName lastName enrollmentNo email phone department year profile")
      .sort({ createdAt: -1 });
    return ApiResponse.success(registrations, "Attendees loaded").send(res);
  } catch (error) {
    return ApiResponse.internalServerError().send(res);
  }
};

module.exports = { registerForEvent, getMyRegistrations, cancelRegistration, verifyQR, getEventAttendees };