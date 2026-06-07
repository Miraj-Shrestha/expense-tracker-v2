import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Sun, Moon, LogOut, Wallet, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        closeMenu();
        navigate('/login');
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <Link to="/" className="nav-logo" onClick={closeMenu}>
                    <Wallet size={24} className="text-primary" />
                    <span className="logo-text">ExpenseTracker</span>
                </Link>

                <div className="mobile-actions">
                    <button onClick={toggleTheme} className="theme-toggle btn-icon mobile-only" aria-label="Toggle Theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle Menu">
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                    <button onClick={toggleTheme} className="theme-toggle btn-icon desktop-only" aria-label="Toggle Theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    
                    {user ? (
                        <>
                            <Link to="/" className="nav-link" onClick={closeMenu}>Dashboard</Link>
                            <Link to="/expenses" className="nav-link" onClick={closeMenu}>Expenses</Link>
                            <div className="user-menu">
                                <span className="user-name">Hi, {user.name.split(' ')[0]}</span>
                                <button onClick={handleLogout} className="btn btn-outline btn-sm logout-btn">
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link" onClick={closeMenu}>Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
