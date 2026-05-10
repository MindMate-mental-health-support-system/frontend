import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, User, Lock, ArrowRight } from 'lucide-react';
import axios from 'axios';

const LoginPage = () => {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isHovered, setIsHovered] = useState(false);

    // Clear any autofilled data or cached tokens on mount
    useEffect(() => {
        setIdentifier('');
        setPassword('');
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!identifier.trim() || !password.trim()) {
            setError('Please enter both username/email and password.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/users/login', {
                identifier: identifier.trim(),
                password: password.trim()
            });

            if (response.data.user) {
                // Store auth details
                localStorage.setItem('mindmate_token', response.data.session.access_token);
                localStorage.setItem('mindmate_user', JSON.stringify(response.data.user));
                localStorage.setItem('mindmate_alias', response.data.user.username); // Fallback for existing logic
                navigate('/chat');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ maxWidth: '440px', width: '100%' }}
            >
                {/* Header / Brand */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '70px',
                            height: '70px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            marginBottom: '1rem',
                            boxShadow: '0 0 30px rgba(99, 102, 241, 0.2)'
                        }}
                    >
                        <Sparkles size={35} className="text-gradient" />
                    </motion.div>

                    <h1 style={{ fontSize: '2.5rem', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
                        Welcome Back
                    </h1>
                    <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
                        Enter your sanctuary to continue speaking.
                    </p>
                </div>

                {/* Login Form Panel */}
                <motion.div
                    className="glass-panel"
                    style={{ padding: '2.5rem', borderRadius: '24px' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    {error && (
                        <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '12px', color: 'var(--danger)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-muted)' }}>
                                Username or Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1.2rem', color: 'var(--primary-light)' }}>
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder="e.g. SkyWatcher"
                                    className="input-premium"
                                    style={{ paddingLeft: '3.2rem' }}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-muted)' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1.2rem', color: 'var(--primary-light)' }}>
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-premium"
                                    style={{ paddingLeft: '3.2rem' }}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-premium bg-gradient-primary"
                            disabled={isLoading}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            style={{ position: 'relative', overflow: 'hidden', width: '100%', marginTop: '0.5rem' }}
                        >
                            {isLoading ? 'Authenticating...' : 'Enter Sanctuary'}
                            {!isLoading && (
                                <motion.div
                                    animate={{ x: isHovered ? 5 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ArrowRight size={20} />
                                </motion.div>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                        Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Sign up here</Link>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
