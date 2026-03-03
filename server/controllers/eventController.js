const Event = require("../models/Event");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const ApiResponse = require("../utils/ApiResponse");

const getAllEvents = async (req, res) => {
  try {
    const { category, search, department, page = 1, limit = 12 } = req.query;
    let query = { status: "approved" };
    if (category) query.category = category;
    if (department) query.department = { $regex: department, $options: "i" };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const events = await Event.find(query)
      .populate("organizer", "firstName lastName organizationName profile")
      .populate("venue", "name location capacity")
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(query);
    return ApiResponse.success({
      events,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    }, "Events loaded").send(res);
  } catch (error) {
    console.error("Get Events Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "firstName lastName organizationName email profile")
      .populate("venue", "name location capacity type equipment");
    if (!event) return ApiResponse.notFound("Event not found").send(res);
    return ApiResponse.success(event, "Event loaded").send(res);
  } catch (error) {
    return ApiResponse.internalServerError().send(res);
  }
};

const createEvent = async (req, res) => {
  try {
    const eventData = { ...req.body, organizer: req.userId };
    if (req.file) eventData.banner = req.file.filename;

    const conflict = await Booking.findOne({
      venue: eventData.venue,
      date: new Date(eventData.date),
      $or: [{ startTime: { $lt: eventData.endTime }, endTime: { $gt: eventData.startTime } }],
      status: { $ne: "cancelled" },
    });
    if (conflict) return ApiResponse.conflict("Venue already booked for this time").send(res);

    const event = await Event.create(eventData);
    await Booking.create({
      venue: eventData.venue,
      event: event._id,
      organizer: req.userId,
      date: new Date(eventData.date),
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      status: "pending",
    });

    return ApiResponse.created(event, "Event submitted for approval").send(res);
  } catch (error) {
    console.error("Create Event Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return ApiResponse.notFound("Event not found").send(res);
    if (event.organizer.toString() !== req.userId && req.userRole !== "admin") {
      return ApiResponse.forbidden("Not authorized").send(res);
    }

    const updateData = { ...req.body };
    if (req.file) updateData.banner = req.file.filename;
    const updated = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate("venue", "name location")
      .populate("organizer", "firstName lastName");
    return ApiResponse.success(updated, "Event updated").send(res);
  } catch (error) {
    return ApiResponse.internalServerError().send(res);
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return ApiResponse.notFound("Event not found").send(res);
    if (event.organizer.toString() !== req.userId && req.userRole !== "admin") {
      return ApiResponse.forbidden("Not authorized").send(res);
    }
    await Booking.deleteMany({ event: event._id });
    await Event.findByIdAndDelete(req.params.id);
    return ApiResponse.success(null, "Event deleted").send(res);
  } catch (error) {
    return ApiResponse.internalServerError().send(res);
  }
};

const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.userId })
      .populate("venue", "name location")
      .sort({ createdAt: -1 });
    return ApiResponse.success(events, "Your events loaded").send(res);
  } catch (error) {
    return ApiResponse.internalServerError().send(res);
  }
};

const getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "pending" })
      .populate("organizer", "firstName lastName organizationName email")
      .populate("venue", "name location capacity")
      .sort({ createdAt: -1 });
    return ApiResponse.success(events, "Pending events loaded").send(res);
  } catch (error) {
    return ApiResponse.internalServerError().send(res);
  }
};

const reviewEvent = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return ApiResponse.badRequest("Invalid status").send(res);
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status, adminRemarks: remarks || "" },
      { new: true }
    ).populate("organizer", "firstName lastName email");
    if (!event) return ApiResponse.notFound("Event not found").send(res);

    if (status === "approved") {
      await Booking.updateMany({ event: event._id }, { status: "confirmed" });
    } else {
      await Booking.updateMany({ event: event._id }, { status: "cancelled" });
    }

    await Notification.create({
      user: event.organizer._id,
      title: `Event ${status}`,
      message: `Your event "${event.title}" has been ${status}. ${remarks || ""}`,
      type: "approval",
      relatedEvent: event._id,
    });

    const io = req.app.get("io");
    if (io) {
      io.to(event.organizer._id.toString()).emit("notification", {
        title: `Event ${status}`,
        message: `"${event.title}" has been ${status}.`,
      });
    }

    return ApiResponse.success(event, `Event ${status}`).send(res);
  } catch (error) {
    return ApiResponse.internalServerError().send(res);
  }
};

const getRecommendedEvents = async (req, res) => {
  try {
    const User = require("../models/User");
    const Registration = require("../models/Registration");
    const user = await User.findById(req.userId);
    if (!user) return ApiResponse.notFound("User not found").send(res);

    const pastRegs = await Registration.find({ student: req.userId }).populate("event", "category tags department");
    const categories = pastRegs.map((r) => r.event?.category).filter(Boolean);

    let query = { status: "approved", date: { $gte: new Date() } };
    if (categories.length > 0 || (user.interests && user.interests.length > 0)) {
      const interests = [...new Set([...categories, ...(user.interests || [])])];
      query.$or = [{ category: { $in: interests } }, { department: user.department }];
    }

    const events = await Event.find(query)
      .populate("organizer", "firstName lastName organizationName profile")
      .populate("venue", "name location")
      .sort({ date: 1 })
      .limit(10);
    return ApiResponse.success(events, "Recommended events").send(res);
  } catch (error) {
    return ApiResponse.internalServerError().send(res);
  }
};

module.exports = {
  getAllEvents, getEventById, createEvent, updateEvent, deleteEvent,
  getMyEvents, getPendingEvents, reviewEvent, getRecommendedEvents,
};