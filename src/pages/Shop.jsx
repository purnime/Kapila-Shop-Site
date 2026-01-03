import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import './Shop.css';

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentCategory = searchParams.get('cat') || 'all';
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    const [cartQuantities, setCartQuantities] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Products
                const prodRes = await fetch(`${API_BASE_URL}/api/products`);
                const prodData = await prodRes.json();
                setProducts(prodData);

                // Fetch Cart if user exists
                if (user) {
                    const cartRes = await fetch(`${API_BASE_URL}/api/cart/${user.id}`);
                    const cartData = await cartRes.json();
                    const quantities = {};
                    cartData.forEach(item => {
                        quantities[item.product_id] = item.quantity;
                    });
                    setCartQuantities(quantities);
                }

                setIsLoading(false);
            } catch (err) {
                console.error("Failed to fetch data", err);
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleQuantityChange = async (product, change) => {
        if (!user) {
            if (confirm('You must be signed in to add items to the cart. Go to login?')) {
                navigate('/login');
            }
            return;
        }

        const currentQty = cartQuantities[product.id] || 0;
        const newQty = currentQty + change;

        // Optimistic UI Update
        setCartQuantities(prev => ({
            ...prev,
            [product.id]: newQty
        }));

        try {
            await fetch(`${API_BASE_URL}/api/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, productId: product.id, change: change })
            });
        } catch (err) {
            console.error('Failed to update cart', err);
            // Revert
            setCartQuantities(prev => ({
                ...prev,
                [product.id]: currentQty
            }));
        }
    };

    const categories = [
        { id: 'all', name: 'All Products' },
        { id: 'snacks', name: 'Biscuits & Snacks' },
        { id: 'beverages', name: 'Beverages' },
        { id: 'groceries', name: 'Groceries' },
        { id: 'books', name: 'Books' },
        { id: 'household', name: 'Household' },
    ];

    const filteredProducts = currentCategory === 'all'
        ? products
        : products.filter(p => p.category === currentCategory);

    return (
        <div className="shop-page page-wrapper">
            <div className="shop-header">
                <div className="container">
                    <h1>Our Collection</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Quality products for your daily needs.</p>
                </div>
            </div>

            <div className="container shop-layout">
                {/* Sidebar */}
                <aside className="filters-sidebar">
                    <h3>Categories</h3>
                    <div className="category-list">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`category-btn ${currentCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setSearchParams({ cat: cat.id })}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Product Grid */}
                <main className="products-grid">
                    {isLoading ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                            Loading products...
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        filteredProducts.map(product => {
                            const quantity = cartQuantities[product.id] || 0;
                            const isOutOfStock = (product.stock || 0) <= 0;

                            return (
                                <div key={product.id} className="product-card">
                                    <div className="product-image-wrapper">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            onError={(e) => e.target.src = 'https://placehold.co/300x310?text=No+Image'}
                                        />
                                        {product.discount > 0 && (
                                            <div className="discount-badge">-{product.discount}%</div>
                                        )}
                                        {isOutOfStock && (
                                            <div className="stock-badge" style={{ background: '#ef4444' }}>Out of Stock</div>
                                        )}
                                    </div>

                                    <div className="product-info">
                                        <div className="product-category">{product.category}</div>
                                        <h3 className="product-title">{product.name}</h3>

                                        <div className="product-rating">
                                            <Star size={16} fill="currentColor" stroke="none" />
                                            <span>{product.rating}</span>
                                            {!isOutOfStock && product.stock < 10 && (
                                                <span style={{ fontSize: '0.8rem', color: '#f59e0b', marginLeft: 'auto' }}>
                                                    Only {product.stock} left
                                                </span>
                                            )}
                                        </div>

                                        <div className="product-footer">
                                            <div className="price-wrapper">
                                                {product.discount > 0 && (
                                                    <span className="original-price">LKR {product.price}</span>
                                                )}
                                                <span className="final-price">
                                                    LKR {Math.round(product.price * (1 - (product.discount || 0) / 100))}
                                                </span>
                                            </div>

                                            {quantity === 0 ? (
                                                <button
                                                    className="btn-add-cart"
                                                    onClick={() => handleQuantityChange(product, 1)}
                                                    disabled={isOutOfStock}
                                                >
                                                    <ShoppingCart size={18} /> Add
                                                </button>
                                            ) : (
                                                <div className="quantity-controls">
                                                    <button
                                                        className="qty-btn"
                                                        onClick={() => handleQuantityChange(product, -1)}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="qty-value">{quantity}</span>
                                                    <button
                                                        className="qty-btn"
                                                        onClick={() => handleQuantityChange(product, 1)}
                                                        disabled={quantity >= product.stock}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--color-text-muted)', padding: '4rem' }}>
                            No products found in this category.
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Shop;
