const Expense = require('../models/Expense');

// @desc    Get expenses (with search and filter)
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = { user: req.user.id };

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        if (category && category !== 'All') {
            query.category = category;
        }

        const expenses = await Expense.find(query).sort({ date: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res) => {
    try {
        const { title, amount, category, date, description } = req.body;

        if (!title || !amount || !category) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        const expense = await Expense.create({
            user: req.user.id,
            title,
            amount,
            category,
            date: date ? new Date(date) : Date.now(),
            description
        });

        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Check for user
        if (expense.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedExpense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Check for user
        if (expense.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await expense.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get expenses summary
// @route   GET /api/expenses/summary
// @access  Private
const getExpenseSummary = async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id });

        const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

        // Calculate monthly expenses
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyExpenses = expenses
            .filter(exp => {
                const expDate = new Date(exp.date);
                return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
            })
            .reduce((acc, curr) => acc + curr.amount, 0);

        // Prepare chart data (expenses by category)
        const categoryData = {};
        expenses.forEach(exp => {
            if (categoryData[exp.category]) {
                categoryData[exp.category] += exp.amount;
            } else {
                categoryData[exp.category] = exp.amount;
            }
        });

        const chartData = Object.keys(categoryData).map(key => ({
            name: key,
            value: categoryData[key]
        }));

        const recentTransactions = await Expense.find({ user: req.user.id })
            .sort({ date: -1 })
            .limit(5);

        res.status(200).json({
            totalExpenses,
            monthlyExpenses,
            chartData,
            recentTransactions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpenseSummary
};
