import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { Bell, Check, Clock, Trash2 } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modal, setModal] = useState({ isOpen: false, id: null });

    useEffect(() => {
        if (user) {
            fetchNotifications();
            markAsRead();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/notifications/${user.id}`);
            const data = await res.json();
            setNotifications(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async () => {
        try {
            await fetch(`${API_BASE_URL}/api/notifications/read/${user.id}`, { method: 'PUT' });
        } catch (err) {
            console.error(err);
        }
    };

    const deleteNotification = (id, e) => {
        e.stopPropagation();
        setModal({ isOpen: true, id });
    };

    const confirmDelete = async () => {
        if (!modal.id) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/notifications/${modal.id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(prev => prev.filter(n => n.id !== modal.id));
            }
        } catch (err) {
            console.error('Error deleting notification:', err);
        } finally {
            setModal({ isOpen: false, id: null });
        }
    };

    if (!user) return <div className="container section">Please login to view notifications.</div>;

    return (
        <div className="container section">
            <h1 className="section-title">Your Notifications</h1>

            {isLoading ? (
                <p>Loading...</p>
            ) : notifications.length === 0 ? (
                <div className="empty-state">
                    <p>No notifications yet.</p>
                </div>
            ) : (
                <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {notifications.map(n => (
                        <div key={n.id} className={`card ${n.is_read ? 'read' : 'unread'}`} style={{
                            padding: '1.5rem',
                            borderLeft: n.is_read ? '4px solid var(--color-text-muted)' : '4px solid var(--color-primary)',
                            background: 'var(--glass-bg)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div className="notification-icon" style={{
                                color: n.is_read ? 'var(--color-text-muted)' : 'var(--color-primary)'
                            }}>
                                {n.is_read ? <Check size={20} /> : <Bell size={20} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: n.is_read ? 400 : 600 }}>{n.message}</p>
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock size={12} /> {new Date(n.created_at.endsWith('Z') ? n.created_at : n.created_at + 'Z').toLocaleString('en-US', { timeZone: 'Asia/Colombo' })}
                                </span>
                            </div>
                            <button
                                onClick={(e) => deleteNotification(n.id, e)}
                                className="btn-icon"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--color-text-muted)',
                                    padding: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'color 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                                onMouseLeave={(e) => e.target.style.color = 'var(--color-text-muted)'}
                                title="Delete notification"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmationModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                onConfirm={confirmDelete}
                title="Delete Notification"
                message="Are you sure you want to delete this notification? This action cannot be undone."
                type="danger"
                confirmText="Delete"
            />
        </div>
    );
};

export default Notifications;
