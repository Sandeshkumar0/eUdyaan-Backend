const express = require("express");
const {
  addDoctor,
  getDoctors,
  getDoctorById,
  addSlot,
  removeSlot,
} = require("../controllers/doctorController");
const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const asyncHandler = require("../utils/asyncHandler");
const { doctor } = require("../validation/schemas");

const router = express.Router();

router.get("/", validate(doctor.list), asyncHandler(getDoctors));
router.get("/:id", validate(doctor.id), asyncHandler(getDoctorById));
router.post("/", protect, authorizeRoles("admin"), validate(doctor.create), asyncHandler(addDoctor));
router.post("/:id/slots", protect, authorizeRoles("doctor", "admin"), validate(doctor.slot), asyncHandler(addSlot));
router.delete(
  "/:id/slots/:slotId",
  protect,
  authorizeRoles("doctor", "admin"),
  validate(doctor.slotItem),
  asyncHandler(removeSlot)
);

module.exports = router;
