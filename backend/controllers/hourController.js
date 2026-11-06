const VolunteerHour = require("../models/VolunteerHour");
const Shift = require("../models/Shift");

exports.recordHours = async (req, res, next) => {
  try {
    const { student, opportunity, shift, hours, date, notes } = req.body;

    if (!student || !opportunity || !shift || hours === undefined || !date) {
      return res.status(400).json({ success: false, message: "Complete all required hour-record fields." });
    }

    const numericHours = Number(hours);
    if (!Number.isFinite(numericHours) || numericHours <= 0 || numericHours > 24) {
      return res.status(400).json({ success: false, message: "Hours must be greater than 0 and no more than 24." });
    }

    const shiftDoc = await Shift.findById(shift).populate("opportunity");

    if (!shiftDoc || String(shiftDoc.opportunity._id) !== String(opportunity)) {
      return res.status(404).json({ success: false, message: "Matching shift not found." });
    }

    if (String(shiftDoc.opportunity.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Only the opportunity coordinator can verify hours." });
    }

    if (!shiftDoc.assignedStudents.some((id) => String(id) === String(student))) {
      return res.status(400).json({ success: false, message: "Student is not assigned to this shift." });
    }

    const record = await VolunteerHour.create({
      student, opportunity, shift, hours: numericHours, date, notes,
      verifiedBy: req.user._id,
    });

    res.status(201).json({ success: true, message: "Volunteer hours recorded.", record });
  } catch (error) {
    next(error);
  }
};

exports.getHours = async (req, res, next) => {
  try {
    const filter = req.user.role === "coordinator"
      ? { verifiedBy: req.user._id }
      : { student: req.user._id };

    const records = await VolunteerHour.find(filter)
      .populate("student", "name email")
      .populate("opportunity", "title")
      .populate("shift", "title startTime endTime")
      .sort({ date: -1 });

    const totalHours = records.reduce((sum, record) => sum + record.hours, 0);

    res.json({ success: true, totalHours, records });
  } catch (error) {
    next(error);
  }
};
