import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, ShoppingBag, User as UserIcon, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import './Header.css';

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const location = useLocation();
    const { user, logout } = useAuth();

    const closeMobileMenu = () => setIsMobileMenuOpen(false);
    const isActive = (path) => location.pathname === path ? 'active' : '';

    React.useEffect(() => {
        if (user) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000); // Polling every 30s
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchUnreadCount = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/notifications/${user.id}`);
            const data = await res.json();
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (err) {
            console.error('Failed to fetch unread count', err);
        }
    };

    return (
        <header className="header">
            <div className="container" style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" className="logo" onClick={closeMobileMenu}>
                    <ShoppingBag size={24} color="var(--color-primary)" />
                    <span>Kapila Stores</span>
                </Link>

                <nav className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
                    <Link to="/" className={`nav-link ${isActive('/')}`} onClick={closeMobileMenu}>Home</Link>
                    <Link to="/shop" className={`nav-link ${isActive('/shop')}`} onClick={closeMobileMenu}>Shop</Link>
                    <Link to="/about" className={`nav-link ${isActive('/about')}`} onClick={closeMobileMenu}>About</Link>
                    {user && user.username === 'admin123' && (
                        <Link to="/admin" className={`nav-link ${isActive('/admin')}`} onClick={closeMobileMenu}>Admin</Link>
                    )}
                </nav>

                <div className="header-actions">
                    {!user ? (
                        <Link to="/login" className="btn-icon">
                            <UserIcon size={20} />
                            <span>Sign In</span>
                        </Link>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Link to={user.username === 'admin123' ? "/admin" : "/cart"} className="btn-icon" style={{ gap: '0.5rem' }}>
                                <div className="avatar-placeholder">{user.username[0].toUpperCase()}</div>
                                <span style={{ color: 'white' }}>{user.name && user.name.split(' ')[0]}</span>
                            </Link>
                            <button onClick={logout} title="Logout" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                Logout
                            </button>
                        </div>
                    )}

                    {user && (
                        <Link to="/notifications" className="btn-icon" title="Notifications" style={{ position: 'relative' }}>
                            <Bell size={22} />
                            {unreadCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-5px',
                                    right: '-5px',
                                    background: 'var(--color-danger)',
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    padding: '2px 5px',
                                    borderRadius: '10px',
                                    minWidth: '18px',
                                    textAlign: 'center'
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </Link>
                    )}

                    <Link to="/cart" className="cart-btn" title="Shopping Cart">
                        <ShoppingCart size={22} />
                    </Link>

                    <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
