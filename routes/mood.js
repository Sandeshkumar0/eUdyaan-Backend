const express = require("express");
const { saveMood, getMoods, deleteMood } = require("../controllers/moodController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { mood } = require("../validation/schemas");

const router = express.Router();
router.use(protect);
router.get("/", validate(mood.list), asyncHandler(getMoods));
router.post("/", validate(mood.save), asyncHandler(saveMood));
router.delete("/:id", validate(mood.id), asyncHandler(deleteMood));

module.exports = router;
