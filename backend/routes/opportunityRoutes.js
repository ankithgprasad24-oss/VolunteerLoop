const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} = require("../controllers/opportunityController");

router.get("/", getOpportunities);
router.get("/:id", getOpportunity);
router.post("/", protect, authorize("coordinator"), createOpportunity);
router.put("/:id", protect, authorize("coordinator"), updateOpportunity);
router.delete("/:id", protect, authorize("coordinator"), deleteOpportunity);

module.exports = router;
