const Application = require("../models/Application");
const Opportunity = require("../models/Opportunity");

exports.applyToOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.opportunityId);

    if (!opportunity || opportunity.status !== "open") {
      return res.status(404).json({ success: false, message: "This opportunity is not available." });
    }

    if (String(opportunity.createdBy) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: "You cannot apply to your own opportunity." });
    }

    const existing = await Application.findOne({
      student: req.user._id,
      opportunity: opportunity._id,
    });

    if (existing) {
      return res.status(409).json({ success: false, message: "You have already applied." });
    }

    const application = await Application.create({
      student: req.user._id,
      opportunity: opportunity._id,
    });

    res.status(201).json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

exports.getApplications = async (req, res, next) => {
  try {
    const filter = req.user.role === "coordinator"
      ? {}
      : { student: req.user._id };

    const applications = await Application.find(filter)
      .populate("student", "name email")
      .populate("opportunity", "title category startDate endDate location createdBy")
      .sort({ createdAt: -1 });

    const visible = req.user.role === "coordinator"
      ? applications.filter((a) => a.opportunity && String(a.opportunity.createdBy) === String(req.user._id))
      : applications;

    res.json({ success: true, applications: visible });
  } catch (error) {
    next(error);
  }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be approved or rejected." });
    }

    const application = await Application.findById(req.params.id)
      .populate("opportunity");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    if (String(application.opportunity.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Only the opportunity creator can review applications." });
    }

    application.status = status;
    await application.save();

    res.json({ success: true, application });
  } catch (error) {
    next(error);
  }
};
