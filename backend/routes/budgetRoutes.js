
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getBudgets,
  addBudget,
  deleteBudget,
} = require("../controllers/budgetController");

router.get("/", protect, getBudgets);
router.post("/", protect, addBudget);
router.delete("/:id", protect, deleteBudget);

module.exports = router;
