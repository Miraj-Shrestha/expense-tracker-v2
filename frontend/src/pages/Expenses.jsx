import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, Filter } from 'lucide-react';
import ExpenseForm from '../components/ExpenseForm';
import './Expenses.css';

const CATEGORIES = ['All', 'Food', 'Transport', 'Entertainment', 'Housing', 'Utilities', 'Health', 'Other'];

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    
    // Form Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentExpense, setCurrentExpense] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    const fetchExpenses = async () => {
        try {
            const query = new URLSearchParams();
            if (searchTerm) query.append('search', searchTerm);
            if (categoryFilter !== 'All') query.append('category', categoryFilter);
            
            const res = await axios.get(`/api/expenses?${query.toString()}`);
            setExpenses(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchExpenses();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, categoryFilter]);

    const handleAddClick = () => {
        setCurrentExpense(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (expense) => {
        setCurrentExpense(expense);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await axios.delete(`/api/expenses/${id}`);
                setExpenses(expenses.filter(e => e._id !== id));
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleFormSubmit = async (formData) => {
        setFormLoading(true);
        try {
            if (currentExpense) {
                const res = await axios.put(`/api/expenses/${currentExpense._id}`, formData);
                setExpenses(expenses.map(e => e._id === currentExpense._id ? res.data : e));
            } else {
                const res = await axios.post('/api/expenses', formData);
                setExpenses([res.data, ...expenses]);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
        }
        setFormLoading(false);
    };

    return (
        <div className="expenses-page animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Expenses</h1>
                <button className="btn btn-primary" onClick={handleAddClick}>
                    <Plus size={20} /> Add Expense
                </button>
            </div>

            <div className="filters-container card">
                <div className="search-box">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        className="input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="filter-box">
                    <Filter className="filter-icon" size={20} />
                    <select
                        className="select"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="expenses-list">
                {loading ? (
                    <div className="loading">Loading expenses...</div>
                ) : expenses.length === 0 ? (
                    <div className="card no-data">No expenses found.</div>
                ) : (
                    expenses.map(expense => (
                        <div key={expense._id} className="expense-item card">
                            <div className="expense-main">
                                <h3 className="expense-title">{expense.title}</h3>
                                <div className="expense-meta">
                                    <span className="expense-category">{expense.category}</span>
                                    <span className="expense-date">{new Date(expense.date).toLocaleDateString()}</span>
                                </div>
                                {expense.description && (
                                    <p className="expense-desc">{expense.description}</p>
                                )}
                            </div>
                            
                            <div className="expense-actions-col">
                                <div className="expense-amount">${expense.amount.toFixed(2)}</div>
                                <div className="expense-actions">
                                    <button 
                                        className="btn-icon text-primary" 
                                        onClick={() => handleEditClick(expense)}
                                        aria-label="Edit"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        className="btn-icon text-danger" 
                                        onClick={() => handleDelete(expense._id)}
                                        aria-label="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <ExpenseForm
                    expense={currentExpense}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    loading={formLoading}
                />
            )}
        </div>
    );
};

export default Expenses;
