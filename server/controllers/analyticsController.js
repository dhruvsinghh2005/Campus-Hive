const Event = require("../models/Event");
const Registration = require("../models/Registration");
const User = require("../models/User");
const ApiResponse = require("../utils/ApiResponse");

const getDashboardAnalytics = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const approvedEvents = await Event.countDocuments({ status: "approved" });
    const pendingEvents = await Event.countDocuments({ status: "pending" });
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalOrganizers = await User.countDocuments({ role: "organizer" });
    const totalRegistrations = await Registration.countDocuments();

    const eventsByCategory = await Event.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const topDepartments = await Event.aggregate([
      { $match: { status: "approved", department: { $ne: null } } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    return ApiResponse.success({
      totalEvents, approvedEvents, pendingEvents,
      totalStudents, totalOrganizers, totalRegistrations,
      eventsByCategory, topDepartments,
    }, "Analytics loaded").send(res);
  } catch (error) {
    return ApiResponse.internalServerError().send(res);
  }
};

module.exports = { getDashboardAnalytics };