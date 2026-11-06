const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createShift,
  getShifts,
  assignStudent,
} = require("../controllers/shiftController");

router.use(protect);
router.get("/", getShifts);
router.post("/", authorize("coordinator"), createShift);
router.patch("/:id/assign", authorize("coordinator"), assignStudent);

module.exports = router;
