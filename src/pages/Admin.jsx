import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit2, DollarSign, Package, ShoppingBag, CheckCircle, Archive, Mail, Upload, LayoutDashboard, LogOut } from 'lucide-react';
import { API_BASE_URL } from '../config';
import './Admin.css';

const Admin = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [formData, setFormData] = useState({ id: null, name: '', category: 'snacks', price: '', image: '', rating: 4.5, stock: 10, discount: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [view, setView] = useState('inventory'); // 'inventory' or 'orders'
    const [orderTab, setOrderTab] = useState('active'); // 'active' or 'old'

    useEffect(() => {
        if (!user || user.username !== 'admin123') {
            navigate('/login');
            return;
        }
        fetchProducts();
        fetchOrders();
    }, [user, navigate]);

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/products');
            setProducts(await res.json());
        } catch (err) { console.error(err); }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/orders');
            setOrders(await res.json());
        } catch (err) { console.error(err); }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalImage = formData.image || `https://placehold.co/300x300/png?text=${encodeURIComponent(formData.name)}`;
        const payload = { ...formData, image: finalImage };

        const url = isEditing
            ? `${API_BASE_URL}/api/products/${formData.id}`
            : 'http://localhost:3000/api/products';

        const method = isEditing ? 'PUT' : 'POST';

        try {
            await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            setFormData({ id: null, name: '', category: 'snacks', price: '', image: '', rating: 4.5, stock: 10, discount: 0 });
            setIsEditing(false);
            fetchProducts();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (confirm('Delete product?')) {
            await fetch(`${API_BASE_URL}/api/products/${id}`, { method: 'DELETE' });
            fetchProducts();
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchOrders();
            if (newStatus === 'Confirmed') {
                alert("Order confirmed and email notification sent to customer!");
            }
        } catch (err) { console.error(err); }
    };

    const deleteOrder = async (id) => {
        console.log('Attempting to delete order ID:', id);
        if (confirm('Delete order and all its history?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, { method: 'DELETE' });
                const data = await response.json();
                console.log('Delete response:', data);
                if (data.success) {
                    alert('Order deleted successfully');
                    fetchOrders();
                } else {
                    alert('Failed to delete order: ' + (data.error || 'Unknown error'));
                }
            } catch (err) {
                console.error('Delete error:', err);
                alert('Connection error occurred while deleting order');
            }
        }
    };

    const totalValue = products.reduce((sum, p) => sum + (Number(p.price) * (Number(p.stock) || 0)), 0);

    const activeOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed');
    const oldOrders = orders.filter(o => o.status === 'Completed');

    if (!user) return null;

    return (
        <div className="admin-page container section">
            <header className="admin-header">
                <div>
                    <h1>Kapila Stores Admin</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Overview & Management</p>
                </div>
                <div className="nav-buttons">
                    <button onClick={() => setView('inventory')} className={`nav-btn ${view === 'inventory' ? 'active' : ''}`}>
                        <LayoutDashboard size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} /> Inventory
                    </button>
                    <button onClick={() => setView('orders')} className={`nav-btn ${view === 'orders' ? 'active' : ''}`}>
                        <ShoppingBag size={18} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} /> Orders
                    </button>
                    <button onClick={logout} className="nav-btn" title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {view === 'inventory' ? (
                <div className="admin-layout">
                    {/* Left Side: Form */}
                    <div className="admin-form-section">
                        <div className="card">
                            <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Cream Crackers" required />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Category</label>
                                        <select name="category" value={formData.category} onChange={handleInputChange}>
                                            <option value="snacks">Snacks</option>
                                            <option value="beverages">Beverages</option>
                                            <option value="groceries">Groceries</option>
                                            <option value="books">Books</option>
                                            <option value="household">Household</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Price (LKR)</label>
                                        <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Stock</label><input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required /></div>
                                    <div className="form-group"><label>Discount (%)</label><input type="number" name="discount" value={formData.discount} onChange={handleInputChange} /></div>
                                </div>
                                <div className="form-group">
                                    <label>Image URL</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input name="image" value={formData.image} onChange={handleInputChange} placeholder="https://..." style={{ flex: 1 }} />
                                    </div>
                                    {/* Image Preview */}
                                    <div className="image-preview">
                                        {formData.image ? (
                                            <img src={formData.image} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                                        ) : (
                                            <div style={{ textAlign: 'center', opacity: 0.5 }}>
                                                <Upload size={32} style={{ marginBottom: '0.5rem' }} />
                                                <p>Image Preview</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="form-actions">
                                    {isEditing && <button type="button" className="btn-secondary" onClick={() => { setIsEditing(false); setFormData({ id: null, name: '', category: 'snacks', price: '', image: '', rating: 4.5, stock: 10, discount: 0 }); }}>Cancel</button>}
                                    <button type="submit" className="btn-primary">{isEditing ? 'Update Product' : 'Add Product'}</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Side: List */}
                    <div className="inventory-view">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon"><Package size={24} /></div>
                                <div className="stat-info"><h3>Total Items</h3><p>{products.length}</p></div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon"><DollarSign size={24} /></div>
                                <div className="stat-info"><h3>Stock Value</h3><p>LKR {totalValue.toLocaleString()}</p></div>
                            </div>
                        </div>

                        <div className="product-list-section">
                            <h3 style={{ marginBottom: '1.5rem' }}>Inventory by Category</h3>
                            {Object.entries(products.reduce((acc, product) => {
                                const cat = product.category || 'Other';
                                if (!acc[cat]) acc[cat] = [];
                                acc[cat].push(product);
                                return acc;
                            }, {})).map(([category, items]) => (
                                <div key={category} className="category-group" style={{ marginBottom: '2rem' }}>
                                    <h4>{category}</h4>
                                    <div className="table-container">
                                        <table className="admin-table">
                                            <thead><tr><th>Product</th><th>Details</th><th>Stock</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                                            <tbody>
                                                {items.map(p => (
                                                    <tr key={p.id}>
                                                        <td style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                            <img src={p.image} className="table-img" alt="" />
                                                            <div style={{ fontWeight: 500 }}>{p.name}</div>
                                                        </td>
                                                        <td>
                                                            <div style={{ fontWeight: 600 }}>LKR {p.price}</div>
                                                            {p.discount > 0 && <span className="discount-tag">-{p.discount}%</span>}
                                                        </td>
                                                        <td>
                                                            <span style={p.stock === 0 ? { color: '#ef4444', fontWeight: 'bold' } : {}}>{p.stock} units</span>
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                                                                <button onClick={() => { setFormData(p); setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="icon-btn edit"><Edit2 size={18} /></button>
                                                                <button onClick={() => handleDelete(p.id)} className="icon-btn delete"><Trash2 size={18} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="orders-section">
                    <div className="tabs">
                        <button className={`tab-btn ${orderTab === 'active' ? 'active' : ''}`} onClick={() => setOrderTab('active')}>Active Orders</button>
                        <button className={`tab-btn ${orderTab === 'old' ? 'active' : ''}`} onClick={() => setOrderTab('old')}>Order History</button>
                    </div>

                    <div className="product-list-section">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Customer Details</th>
                                    <th>Status</th>
                                    <th>Items Ordered</th>
                                    <th>Total Amount</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(orderTab === 'active' ? activeOrders : oldOrders).map(order => (
                                    <tr key={order.id}>
                                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{order.user_name || 'Guest'}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.user_phone}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.user_email}</div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                                        </td>
                                        <td>
                                            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1rem', margin: 0 }}>
                                                {order.items.map((item, i) => (
                                                    <li key={i}>{item.product_name} <span style={{ color: 'white' }}>x{item.quantity}</span></li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td style={{ fontWeight: 'bold', color: '#6366f1' }}>
                                            LKR {order.total}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                {order.status === 'Pending' && (
                                                    <button onClick={() => updateOrderStatus(order.id, 'Confirmed')} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--primary-gradient)' }} title="Confirm Order">
                                                        Confirm
                                                    </button>
                                                )}
                                                {order.status === 'Confirmed' && (
                                                    <button onClick={() => updateOrderStatus(order.id, 'Completed')} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--success-gradient)' }} title="Mark as Done">
                                                        Done
                                                    </button>
                                                )}
                                                <button onClick={() => deleteOrder(order.id)} className="icon-btn delete" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.4rem', borderRadius: '4px' }} title="Delete Order">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(orderTab === 'active' ? activeOrders : oldOrders).length === 0 && (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No orders found in this category.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
