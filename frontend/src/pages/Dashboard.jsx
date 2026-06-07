import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend 
} from 'recharts';
import { DollarSign, Calendar, TrendingUp } from 'lucide-react';
import './Dashboard.css';

const COLORS = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#64748b'];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                backgroundColor: 'var(--bg-card)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                padding: '12px 16px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)',
                color: 'var(--text-primary)',
                fontWeight: 600
            }}>
                <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                        width: 12, height: 12, borderRadius: '50%', backgroundColor: payload[0].payload.fill 
                    }}></span>
                    {payload[0].name} : <span style={{ color: 'var(--text-secondary)' }}>${payload[0].value.toFixed(2)}</span>
                </p>
            </div>
        );
    }
    return null;
};

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await axios.get('/api/expenses/summary');
                setSummary(res.data);
            } catch (err) {
                setError('Failed to fetch dashboard data');
            }
            setLoading(false);
        };

        fetchSummary();
    }, []);

    if (loading) return <div className="loading">Loading dashboard...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!summary) return null;

    return (
        <div className="dashboard animate-fade-in">
            <h1 className="page-title">Dashboard</h1>
            
            <div className="summary-cards">
                <div className="card summary-card">
                    <div className="summary-icon bg-primary-light">
                        <DollarSign className="text-primary" size={24} />
                    </div>
                    <div className="summary-info">
                        <h3>Total Expenses</h3>
                        <p className="summary-amount">${summary.totalExpenses.toFixed(2)}</p>
                    </div>
                </div>
                
                <div className="card summary-card">
                    <div className="summary-icon bg-success-light">
                        <Calendar className="text-success" size={24} />
                    </div>
                    <div className="summary-info">
                        <h3>This Month</h3>
                        <p className="summary-amount">${summary.monthlyExpenses.toFixed(2)}</p>
                    </div>
                </div>
                
                <div className="card summary-card">
                    <div className="summary-icon bg-warning-light">
                        <TrendingUp className="text-warning" size={24} />
                    </div>
                    <div className="summary-info">
                        <h3>Transactions</h3>
                        <p className="summary-amount">{summary.recentTransactions.length}</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="card chart-card">
                    <h2 className="card-title">Expenses by Category</h2>
                    {summary.chartData.length > 0 ? (
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={summary.chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {summary.chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="no-data">No expenses to display</p>
                    )}
                </div>

                <div className="card recent-transactions-card">
                    <h2 className="card-title">Recent Transactions</h2>
                    {summary.recentTransactions.length > 0 ? (
                        <div className="transactions-list">
                            {summary.recentTransactions.map(tx => (
                                <div key={tx._id} className="transaction-item">
                                    <div className="tx-info">
                                        <div className="tx-title">{tx.title}</div>
                                        <div className="tx-category">{tx.category} • {new Date(tx.date).toLocaleDateString()}</div>
                                    </div>
                                    <div className="tx-amount text-danger">
                                        -${tx.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-data">No recent transactions</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
