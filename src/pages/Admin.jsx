import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit2, DollarSign, Package, ShoppingBag, CheckCircle, Archive, Mail, Upload, LayoutDashboard, LogOut } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import { API_BASE_URL } from '../config';
import './Admin.css';
import './Admin-mobile-fix.css';
import './Admin-responsive.css';

const Admin = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [formData, setFormData] = useState({ id: null, name: '', category: 'snacks', price: '', image: '', rating: 4.5, stock: 10, discount: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [view, setView] = useState('inventory'); // 'inventory' or 'orders'
    const [orderTab, setOrderTab] = useState('active'); // 'active' or 'old'
    const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null, confirmText: 'Confirm' });

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
            const res = await fetch(`${API_BASE_URL}/api/products`);
            setProducts(await res.json());
        } catch (err) { console.error(err); }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/orders`);
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
            : `${API_BASE_URL}/api/products`;

        const method = isEditing ? 'PUT' : 'POST';

        try {
            await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            setFormData({ id: null, name: '', category: 'snacks', price: '', image: '', rating: 4.5, stock: 10, discount: 0 });
            setIsEditing(false);
            fetchProducts();
        } catch (err) { console.error(err); }
    };

    const handleDelete = (id) => {
        setModal({
            isOpen: true,
            title: 'Delete Product',
            message: 'Are you sure you want to delete this product? This action cannot be undone.',
            type: 'danger',
            confirmText: 'Delete',
            onConfirm: async () => {
                await fetch(`${API_BASE_URL}/api/products/${id}`, { method: 'DELETE' });
                fetchProducts();
                setModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const updateOrderStatus = (orderId, newStatus) => {
        if (newStatus === 'Confirmed') {
            setModal({
                isOpen: true,
                title: 'Confirm Order',
                message: 'Are you sure you want to confirm this order? The customer will be notified.',
                type: 'success',
                confirmText: 'Confirm Order',
                onConfirm: async () => {
                    await performUpdate(orderId, newStatus);
                }
            });
        } else {
            performUpdate(orderId, newStatus);
        }
    };

    const performUpdate = async (orderId, newStatus) => {
        try {
            await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchOrders();
            if (newStatus === 'Confirmed') {
                // Modal will close automatically via state update if needed, but here we just need to close it
            }
            setModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) { console.error(err); }
    };

    const deleteOrder = (id) => {
        setModal({
            isOpen: true,
            title: 'Delete Order',
            message: 'Are you sure you want to permanently delete this order and its history?',
            type: 'danger',
            confirmText: 'Delete Order',
            onConfirm: async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, { method: 'DELETE' });
                    const data = await response.json();
                    if (data.success) {
                        setModal({
                            isOpen: true,
                            title: 'Success',
                            message: 'Order deleted successfully',
                            type: 'success',
                            confirmText: 'OK',
                            onConfirm: () => {
                                fetchOrders();
                                setModal(prev => ({ ...prev, isOpen: false }));
                            }
                        });
                    } else {
                        setModal({
                            isOpen: true,
                            title: 'Error',
                            message: 'Failed to delete order: ' + (data.error || 'Unknown error'),
                            type: 'danger',
                            confirmText: 'OK',
                            onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
                        });
                    }
                } catch (err) {
                    setModal({
                        isOpen: true,
                        title: 'Error',
                        message: 'Connection error occurred while deleting order',
                        type: 'danger',
                        confirmText: 'OK',
                        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
                    });
                }
            }
        });
    };

    const totalValue = products.reduce((sum, p) => sum + (Number(p.price) * (Number(p.stock) || 0)), 0);

    const activeOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed');
    const oldOrders = orders.filter(o => o.status === 'Completed');

    if (!user) return null;

    return (
        <div className="admin-responsive" style={{ minHeight: '100vh', color: 'var(--text-primary)', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <header style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1.5rem', background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-lg)', gap: '1.5rem' }}>
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
                <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                    {/* Left Side: Form */}
                    <div style={{ width: '100%', maxWidth: '100%', minWidth: '0', flex: '1', display: 'block' }}>
                        <div style={{ width: '100%', minWidth: '0 !important', maxWidth: '100%', boxSizing: 'border-box', background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>
                            <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                            <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '100%', minWidth: '0', display: 'block' }}>
                                <div style={{ width: '100%', marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Product Name</label>
                                    <input name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Cream Crackers" required style={{ width: '100%', maxWidth: '100%', minWidth: '0 !important', boxSizing: 'border-box', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--glass-border)', padding: '0.75rem 1rem', borderRadius: '8px', color: 'white', fontSize: '0.95rem' }} />
                                </div>
                                <div style={{ display: 'block', width: '100%' }}>
                                    <div style={{ width: '100%', marginBottom: '1.25rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Category</label>
                                        <select name="category" value={formData.category} onChange={handleInputChange} style={{ width: '100%', maxWidth: '100%', minWidth: '0', boxSizing: 'border-box', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--glass-border)', padding: '0.75rem 1rem', borderRadius: '8px', color: 'white', fontSize: '0.95rem' }}>
                                            <option value="snacks">Snacks</option>
                                            <option value="beverages">Beverages</option>
                                            <option value="groceries">Groceries</option>
                                            <option value="books">Books</option>
                                            <option value="household">Household</option>
                                        </select>
                                    </div>
                                    <div style={{ width: '100%', marginBottom: '1.25rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Price (LKR)</label>
                                        <input type="number" name="price" value={formData.price} onChange={handleInputChange} required style={{ width: '100%', maxWidth: '100%', minWidth: '0', boxSizing: 'border-box', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--glass-border)', padding: '0.75rem 1rem', borderRadius: '8px', color: 'white', fontSize: '0.95rem' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
                                    <div className="form-group"><label>Stock</label><input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required /></div>
                                    <div className="form-group"><label>Discount (%)</label><input type="number" name="discount" value={formData.discount} onChange={handleInputChange} /></div>
                                </div>
                                <div className="form-group">
                                    <label>Image URL</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input name="image" value={formData.image} onChange={handleInputChange} placeholder="https://..." style={{ flex: 1, width: '100%', maxWidth: '100%', minWidth: '0', boxSizing: 'border-box' }} />
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
                                                        <td className="product-cell" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                        <table className="admin-table orders-table">
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
                                        <td data-label="Date">{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td data-label="Customer">
                                            <div style={{ fontWeight: 600 }}>{order.user_name || 'Guest'}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.user_phone}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.user_email}</div>
                                        </td>
                                        <td data-label="Status">
                                            <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                                        </td>
                                        <td data-label="Items">
                                            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1rem', margin: 0 }}>
                                                {order.items.map((item, i) => (
                                                    <li key={i}>{item.product_name} <span style={{ color: 'white' }}>x{item.quantity}</span></li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td data-label="Total" style={{ fontWeight: 'bold', color: '#6366f1' }}>
                                            LKR {order.total}
                                        </td>
                                        <td data-label="Actions" style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexDirection: window.innerWidth <= 768 ? 'column' : 'row', alignItems: window.innerWidth <= 768 ? 'center' : 'flex-end' }}>
                                                {order.status === 'Pending' && (
                                                    <button onClick={() => updateOrderStatus(order.id, 'Confirmed')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--primary-gradient)', border: 'none', borderRadius: '6px', color: 'white', whiteSpace: 'nowrap', minWidth: '80px' }} title="Confirm Order">
                                                        Confirm
                                                    </button>
                                                )}
                                                {order.status === 'Confirmed' && (
                                                    <button onClick={() => updateOrderStatus(order.id, 'Completed')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#10b981', border: 'none', borderRadius: '6px', color: 'white', whiteSpace: 'nowrap', minWidth: '80px' }} title="Mark as Done">
                                                        Done
                                                    </button>
                                                )}
                                                <button onClick={() => deleteOrder(order.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.4rem', borderRadius: '4px', border: 'none', whiteSpace: 'nowrap', minWidth: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete Order">
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

            <ConfirmationModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={modal.onConfirm}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                confirmText={modal.confirmText}
            />
        </div>
    );
};

export default Admin;
