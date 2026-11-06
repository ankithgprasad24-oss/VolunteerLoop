const Shift = require("../models/Shift");
const Application = require("../models/Application");

exports.createShift = async (req, res, next) => {
  try {
    const { opportunity, title, startTime, endTime } = req.body;

    if (!opportunity || !title || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: "Complete all shift fields." });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({ success: false, message: "Enter valid shift times. End must be after start." });
    }

    const application = await Application.findOne({
      student: req.user._id,
      opportunity,
      status: "approved",
    });

    const Opportunity = require("../models/Opportunity");
    const opportunityDoc = await Opportunity.findById(opportunity);

    if (!opportunityDoc) {
      return res.status(404).json({ success: false, message: "Opportunity not found." });
    }

    if (String(opportunityDoc.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Only the opportunity coordinator can create shifts." });
    }

    const shift = await Shift.create({
      opportunity, title, startTime: start, endTime: end,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, shift });
  } catch (error) {
    next(error);
  }
};

exports.getShifts = async (req, res, next) => {
  try {
    const shifts = await Shift.find()
      .populate("opportunity", "title location createdBy")
      .populate("assignedStudents", "name email")
      .sort({ startTime: 1 });

    const visible = req.user.role === "coordinator"
      ? shifts.filter((s) => s.opportunity && String(s.opportunity.createdBy) === String(req.user._id))
      : shifts.filter((s) => s.assignedStudents.some((u) => String(u._id) === String(req.user._id)));

    res.json({ success: true, shifts: visible });
  } catch (error) {
    next(error);
  }
};

exports.assignStudent = async (req, res, next) => {
  try {
    const shift = await Shift.findById(req.params.id).populate("opportunity");

    if (!shift) {
      return res.status(404).json({ success: false, message: "Shift not found." });
    }

    if (String(shift.opportunity.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Only the coordinator can assign students." });
    }

    const { studentId } = req.body;
    const application = await Application.findOne({
      student: studentId,
      opportunity: shift.opportunity._id,
      status: "approved",
    });

    if (!application) {
      return res.status(400).json({ success: false, message: "Student must have an approved application first." });
    }

    const conflict = await Shift.findOne({
      _id: { $ne: shift._id },
      assignedStudents: studentId,
      startTime: { $lt: shift.endTime },
      endTime: { $gt: shift.startTime },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        conflict: true,
        message: "Shift clash detected. This student already has an overlapping shift.",
        conflictingShift: conflict,
      });
    }

    if (!shift.assignedStudents.some((id) => String(id) === String(studentId))) {
      shift.assignedStudents.push(studentId);
      await shift.save();
    }

    res.json({ success: true, message: "Student assigned successfully.", shift });
  } catch (error) {
    next(error);
  }
};

