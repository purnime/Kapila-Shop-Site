import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Brand */}
                    <div className="footer-brand">
                        <Link to="/" className="logo footer-logo">
                            <div className="logo-icon-wrapper">
                                <Store size={20} />
                            </div>
                            <span>Kapila<span className="logo-highlight">Stores</span></span>
                        </Link>
                        <p className="footer-desc">
                            Your community's favorite mini Food City. Quality products, affordable prices, and friendly service every day.
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-link"><Facebook size={20} /></a>
                            <a href="#" className="social-link"><Instagram size={20} /></a>
                            <a href="#" className="social-link"><Twitter size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-links">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/shop">Shop All</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div className="footer-links">
                        <h4>Categories</h4>
                        <ul>
                            <li><Link to="/shop?cat=snacks">Biscuits & Snacks</Link></li>
                            <li><Link to="/shop?cat=beverages">Beverages</Link></li>
                            <li><Link to="/shop?cat=groceries">Groceries</Link></li>
                            <li><Link to="/shop?cat=books">Books</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer-contact">
                        <h4>Contact Us</h4>
                        <ul>
                            <li><MapPin size={18} /> 123 Main Street, City</li>
                            <li><Phone size={18} /> +94 11 234 5678</li>
                            <li><Mail size={18} /> hello@kapilastores.com</li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Kapila Stores. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
