
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getSharedExpenses,
  addSharedExpense,
  updateSharedExpense,
  deleteSharedExpense,
} = require("../controllers/sharedController");

router.get("/", protect, getSharedExpenses);
router.post("/", protect, addSharedExpense);
router.put("/:id", protect, updateSharedExpense);
router.delete("/:id", protect, deleteSharedExpense);

module.exports = router;
