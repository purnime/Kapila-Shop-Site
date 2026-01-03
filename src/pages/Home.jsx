import React from 'react';
import { ArrowRight, ShoppingBag, BookOpen, Coffee, Package, Home as HomeIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const categories = [
        { title: 'Biscuits & Snacks', icon: <ShoppingBag size={32} />, color: 'var(--color-accent)', link: '/shop?cat=snacks' },
        { title: 'Beverages', icon: <Coffee size={32} />, color: '#0ea5e9', link: '/shop?cat=beverages' },
        { title: 'Groceries', icon: <Package size={32} />, color: '#10b981', link: '/shop?cat=groceries' },
        { title: 'Books', icon: <BookOpen size={32} />, color: '#8b5cf6', link: '/shop?cat=books' },
        { title: 'Household', icon: <HomeIcon size={32} />, color: '#f43f5e', link: '/shop?cat=household' },
    ];

    return (
        <div className="home-page">
            <section className="hero-section">
                <div className="container hero-content">
                    <div className="hero-text animate-fade-in">
                        <span className="hero-badge">Your Neighborhood Store</span>
                        <h1 className="hero-title">
                            Your Daily Essentials <br />
                            <span className="text-gradient">Under One Roof</span>
                        </h1>
                        <p className="hero-description">
                            Experience the convenience of a mini Food City.
                            Quality products, affordable prices, and friendly service for your community.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/shop" className="btn btn-primary">
                                Shop Now <ArrowRight size={20} />
                            </Link>
                            <Link to="/about" className="btn btn-secondary">
                                Learn More
                            </Link>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="blob blob-1"></div>
                        <div className="blob blob-2"></div>
                        <div className="hero-card glass-panel">
                            <div className="hero-icon-wrapper">
                                <ShoppingBag size={40} color="white" />
                            </div>
                            <div>
                                <h3>Fresh Stock</h3>
                                <p>Updated Daily</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section categories-section">
                <div className="container">
                    <h2 className="section-title">Shop by Category</h2>
                    <div className="grid-responsive category-grid">
                        {categories.map((cat, index) => (
                            <Link key={index} to={cat.link} className="category-card">
                                <div className="category-icon" style={{ backgroundColor: cat.color }}>
                                    {cat.icon}
                                </div>
                                <h3 className="category-title">{cat.title}</h3>
                                <div className="category-link">
                                    Explore <ArrowRight size={16} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section features-section">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-item">
                            <h3>Quality First</h3>
                            <p>Hand-picked products ensuring the best for your family.</p>
                        </div>
                        <div className="feature-item">
                            <h3>Affordable</h3>
                            <p>Competitive prices that fit your daily budget.</p>
                        </div>
                        <div className="feature-item">
                            <h3>Community Focused</h3>
                            <p>Friendly service tailored to local needs.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
