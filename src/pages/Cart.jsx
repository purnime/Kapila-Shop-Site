import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, ArrowRight } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import './Cart.css';

const Cart = () => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null, confirmText: 'Confirm' });

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setIsLoading(false);
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/cart/${user.id}`);
            const data = await res.json();
            setCartItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const removeItem = async (id) => {
        await fetch(`${API_BASE_URL}/api/cart/${id}`, { method: 'DELETE' });
        fetchCart();
    };

    const handleCheckout = () => {
        setModal({
            isOpen: true,
            title: 'Confirm Checkout',
            message: `Your total is LKR ${total}. Do you want to place this order?`,
            type: 'default',
            confirmText: 'Place Order',
            onConfirm: performCheckout
        });
    };

    const performCheckout = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            const data = await res.json();
            if (data.success) {
                // Success - just clear cart and close modal as requested
                fetchCart();
                setModal(prev => ({ ...prev, isOpen: false }));
            } else {
                setModal({
                    isOpen: true,
                    title: 'Checkout Failed',
                    message: data.message || 'Something went wrong.',
                    type: 'danger',
                    confirmText: 'Close',
                    onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
                });
            }
        } catch (err) {
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'Connection failed. Please try again.',
                type: 'danger',
                confirmText: 'Close',
                onConfirm: () => setModal(prev => ({ ...prev, isOpen: false }))
            });
        }
    };

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (!user) {
        return (
            <div className="container section text-center">
                <h2>Please Sign In</h2>
                <p className="text-muted" style={{ marginBottom: '2rem' }}>You need to be logged in to view your cart.</p>
                <Link to="/login" className="btn btn-primary">Sign In</Link>
            </div>
        );
    }

    return (
        <div className="container section cart-page">
            <h1 className="section-title" style={{ textAlign: 'left' }}>Your Shopping Cart</h1>

            {isLoading ? (
                <p>Loading cart...</p>
            ) : cartItems.length === 0 ? (
                <div className="empty-cart">
                    <p>Your cart is empty.</p>
                    <Link to="/shop" className="btn btn-secondary">Start Shopping</Link>
                </div>
            ) : (
                <div className="cart-layout">
                    <div className="cart-items">
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                <img src={item.image} alt={item.name} className="cart-item-img" />
                                <div className="cart-item-info">
                                    <h3>{item.name}</h3>
                                    <p className="text-muted">LKR {item.price} x {item.quantity}</p>
                                </div>
                                <div className="cart-item-price">
                                    LKR {item.price * item.quantity}
                                </div>
                                <button onClick={() => removeItem(item.id)} className="btn-icon delete">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h3>Order Summary</h3>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>LKR {total}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>LKR {total}</span>
                        </div>
                        <button onClick={handleCheckout} className="btn btn-primary btn-block">
                            Checkout <ArrowRight size={18} />
                        </button>
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

export default Cart;
