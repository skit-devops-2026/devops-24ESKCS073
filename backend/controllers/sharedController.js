
const SharedExpense = require("../models/SharedExpense");

// Get shared expenses
const getSharedExpenses = async (req, res) => {
  try {
    const expenses = await SharedExpense.find({ user: req.user.id });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add shared expense
const addSharedExpense = async (req, res) => {
  try {
    const expense = await SharedExpense.create({
      ...req.body,
      user: req.user.id,
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update shared expense
const updateSharedExpense = async (req, res) => {
  try {
    const expense = await SharedExpense.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete shared expense
const deleteSharedExpense = async (req, res) => {
  try {
    const expense = await SharedExpense.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Shared expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSharedExpenses,
  addSharedExpense,
  updateSharedExpense,
  deleteSharedExpense,
};
