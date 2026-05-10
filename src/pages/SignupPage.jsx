import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, User, Lock, Mail, ArrowRight } from 'lucide-react';
import axios from 'axios';
import CustomSelect from '../components/CustomSelect';

const SignupPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        gender: '',
        age: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isHovered, setIsHovered] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.username || !formData.email || !formData.password) {
            setError('Username, Email, and Password are required.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/users/signup', formData);
            if (response.data.user) {
                // Redirect to login after successful signup
                navigate('/login');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            >
                {/* Header / Brand */}
                <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '60px',
                            height: '60px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            marginBottom: '1rem',
                            boxShadow: '0 0 40px rgba(99, 102, 241, 0.2)'
                        }}
                    >
                        <Sparkles size={30} className="text-gradient" />
                    </motion.div>

                    <h1 style={{ fontSize: '2rem', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                        Join MindMate
                    </h1>
                </div>



                {/* Signup Form Panel */}
                <motion.div
                    className="glass-panel"
                    style={{ padding: '2.5rem', borderRadius: '24px', marginBottom: '2rem' }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    {error && (
                        <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '12px', color: 'var(--danger)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Username *</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1.2rem', color: 'var(--primary-light)' }}><User size={18} /></div>
                                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Alias e.g SkyWatcher" className="input-premium" style={{ paddingLeft: '3rem' }} required />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email *</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1.2rem', color: 'var(--primary-light)' }}><Mail size={18} /></div>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="input-premium" style={{ paddingLeft: '3rem' }} required />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Password *</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1.2rem', color: 'var(--primary-light)' }}><Lock size={18} /></div>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="input-premium" style={{ paddingLeft: '3rem' }} required />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <CustomSelect
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                label="Gender (Optional)"
                                placeholder="Select..."
                                options={[
                                    { value: 'male', label: 'Male' },
                                    { value: 'female', label: 'Female' },
                                    { value: 'other', label: 'Other' },
                                    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                                ]}
                            />
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Age (Optional)</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    placeholder="e.g 25"
                                    className="input-premium"
                                    style={{ padding: '1rem' }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-premium bg-gradient-primary"
                            disabled={isLoading}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            style={{ marginTop: '1rem' }}
                        >
                            {isLoading ? 'Creating Sanctuary...' : 'Create Account'}
                            {!isLoading && (
                                <motion.div animate={{ x: isHovered ? 5 : 0 }} transition={{ duration: 0.2 }}>
                                    <ArrowRight size={20} />
                                </motion.div>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Login here</Link>
                    </div>

                </motion.div>
            </motion.div>
        </div>
    );
};

export default SignupPage;
