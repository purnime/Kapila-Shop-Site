import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { Lock, User, AlertCircle, Mail, Phone, Smile } from 'lucide-react';
import './Login.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone
                }),
            });

            const data = await response.json();

            if (data.success) {
                login(data.user);
                navigate('/');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Connection error. Is the server running?');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card animate-fade-in" style={{ maxWidth: '500px' }}>
                <h2 className="login-title">Join Kapila Stores</h2>
                <p className="login-subtitle">Create an account to start shopping</p>

                {error && (
                    <div className="error-alert">
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <div className="input-wrapper">
                            <Smile size={18} className="input-icon" />
                            <input name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
                        </div>
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Email</label>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <div className="input-wrapper">
                                <Phone size={18} className="input-icon" />
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="0771234567" required />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Username</label>
                        <div className="input-wrapper">
                            <User size={18} className="input-icon" />
                            <input name="username" value={formData.username} onChange={handleChange} placeholder="Choose a username" required />
                        </div>
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" autoComplete="new-password" required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Confirm</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm" autoComplete="new-password" required />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">
                        Create Account
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-text-muted)' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)' }}>Sign In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
