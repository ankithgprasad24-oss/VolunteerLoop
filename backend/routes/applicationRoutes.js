const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  applyToOpportunity,
  getApplications,
  updateApplicationStatus,
} = require("../controllers/applicationController");

router.use(protect);
router.get("/", getApplications);
router.post("/:opportunityId", applyToOpportunity);
router.patch("/:id/status", authorize("coordinator"), updateApplicationStatus);

module.exports = router;
