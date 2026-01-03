import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { Bell, Check, Clock } from 'lucide-react';

const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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
                                    <Clock size={12} /> {new Date(n.created_at).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
