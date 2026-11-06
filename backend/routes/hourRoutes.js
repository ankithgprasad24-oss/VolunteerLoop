const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  recordHours,
  getHours,
} = require("../controllers/hourController");

router.use(protect);
router.get("/", getHours);
router.post("/", authorize("coordinator"), recordHours);

module.exports = router;
