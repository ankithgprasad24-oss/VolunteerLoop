const Opportunity = require("../models/Opportunity");

exports.getOpportunities = async (req, res, next) => {
  try {
    const { category, status, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const opportunities = await Opportunity.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: opportunities.length, opportunities });
  } catch (error) {
    next(error);
  }
};

exports.getOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate("createdBy", "name email");

    if (!opportunity) {
      return res.status(404).json({ success: false, message: "Opportunity not found." });
    }

    res.json({ success: true, opportunity });
  } catch (error) {
    next(error);
  }
};

exports.createOpportunity = async (req, res, next) => {
  try {
    const { title, description, category, location, startDate, endDate, requiredVolunteers } = req.body;

    if (!title || !description || !category || !location || !startDate || !endDate || !requiredVolunteers) {
      return res.status(400).json({ success: false, message: "Please complete all required fields." });
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ success: false, message: "End date must be after start date." });
    }

    const opportunity = await Opportunity.create({
      title, description, category, location, startDate, endDate,
      requiredVolunteers: Number(requiredVolunteers),
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, opportunity });
  } catch (error) {
    next(error);
  }
};

exports.updateOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ success: false, message: "Opportunity not found." });
    }

    if (String(opportunity.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Only the creator can update this opportunity." });
    }

    const allowed = ["title", "description", "category", "location", "startDate", "endDate", "requiredVolunteers", "status"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) opportunity[field] = req.body[field];
    });

    await opportunity.save();
    res.json({ success: true, opportunity });
  } catch (error) {
    next(error);
  }
};

exports.deleteOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ success: false, message: "Opportunity not found." });
    }

    if (String(opportunity.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Only the creator can delete this opportunity." });
    }

    await opportunity.deleteOne();
    res.json({ success: true, message: "Opportunity deleted." });
  } catch (error) {
    next(error);
  }
};
