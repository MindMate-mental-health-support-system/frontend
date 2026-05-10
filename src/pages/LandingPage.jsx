import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Sparkles, User, ArrowRight, Lock, MessageSquare, Activity, Heart } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    const handleGetStarted = (e) => {
        e.preventDefault();
        navigate('/signup');
    };

    const handleGuestLogin = (e) => {
        e.preventDefault();
        const guestAlias = `Guest_${Math.floor(Math.random() * 1000000)}`;
        localStorage.setItem('mindmate_alias', guestAlias);
        localStorage.removeItem('mindmate_token');
        localStorage.setItem('mindmate_user', JSON.stringify({ username: 'Guest' }));
        navigate('/chat');
    };

    // Animated Mock Messages for visual appeal
    const FloatingMessage = ({ text, delay, yOffset, xOffset, sender, icon: Icon, color }) => (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: [0, 1, 1, 0], y: [50, yOffset, yOffset - 20, yOffset - 40], scale: [0.9, 1, 1, 0.95] }}
            transition={{ duration: 8, delay: delay, repeat: Infinity, ease: "easeInOut" }}
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(${xOffset}px, ${yOffset}px)`,
                padding: '12px 20px',
                background: sender === 'bot' ? 'rgba(255, 255, 255, 0.03)' : 'var(--card-gradient)',
                backdropFilter: 'blur(10px)',
                border: sender === 'bot' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                borderRadius: sender === 'bot' ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
                color: '#fff',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                zIndex: 0,
                pointerEvents: 'none',
                minWidth: 'max-content'
            }}
        >
            {Icon && <Icon size={16} color={color} />}
            {text}
        </motion.div>
    );

    return (
        <div className="app-container" style={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            {/* Dynamic Animated Background Blobs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, -50, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                style={{
                    position: 'absolute', top: '10%', left: '10%', width: '40vw', height: '40vw',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 60%)',
                    borderRadius: '50%', filter: 'blur(60px)', zIndex: 0
                }}
            />
            <motion.div
                animate={{
                    scale: [1, 1.5, 1],
                    x: [0, -50, 0],
                    y: [0, 50, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }}
                style={{
                    position: 'absolute', bottom: '10%', right: '10%', width: '45vw', height: '45vw',
                    background: 'radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 60%)',
                    borderRadius: '50%', filter: 'blur(60px)', zIndex: 0
                }}
            />

            {/* Floating Mock UI Elements to make it feel like a chat product */}
            <div style={{ display: window.innerWidth > 768 ? 'block' : 'none' }}>
                <FloatingMessage text="I feel so overwhelmed today." delay={0} yOffset={-180} xOffset={-350} sender="user" />
                <FloatingMessage text="I hear you. Let's take it one step at a time." delay={2} yOffset={-100} xOffset={100} sender="bot" icon={Heart} color="#f472b6" />
                <FloatingMessage text="Detecting high stress..." delay={4} yOffset={100} xOffset={-400} sender="bot" icon={Activity} color="#f59e0b" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ maxWidth: '440px', width: '100%', zIndex: 10, position: 'relative' }}
            >
                {/* Header / Brand */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <motion.div
                        initial={{ scale: 0.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.1, type: 'spring', bounce: 0.5 }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '90px',
                            height: '90px',
                            borderRadius: '24px',
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)',
                            border: '2px solid rgba(255,255,255,0.1)',
                            marginBottom: '1.5rem',
                            boxShadow: '0 0 60px rgba(99, 102, 241, 0.3), 0 0 100px rgba(20, 184, 166, 0.2)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            style={{
                                position: 'absolute', width: '150px', height: '150px', borderRadius: '50%',
                                background: 'conic-gradient(from 0deg, rgba(99, 102, 241, 0.4), transparent)', filter: 'blur(30px)'
                            }}
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                            style={{
                                position: 'absolute', width: '120px', height: '120px', borderRadius: '50%',
                                background: 'conic-gradient(from 0deg, rgba(20, 184, 166, 0.3), transparent)', filter: 'blur(20px)'
                            }}
                        />
                        <motion.div
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ position: 'relative', zIndex: 1 }}
                        >
                            <Sparkles size={44} className="text-gradient" />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
                            <motion.span
                                animate={{ color: ['#f8fafc', '#818cf8', '#14b8a6', '#f8fafc'] }}
                                transition={{ duration: 6, repeat: Infinity }}
                                style={{ display: 'inline-block' }}
                            >
                                Mind
                            </motion.span>
                            <motion.span
                                animate={{ color: ['#818cf8', '#14b8a6', '#f8fafc', '#818cf8'] }}
                                transition={{ duration: 6, repeat: Infinity, delay: 0.5 }}
                                className="text-gradient"
                                style={{ display: 'inline-block' }}
                            >
                                Mate
                            </motion.span>
                        </h1>
                    </motion.div>

                    <motion.p
                        style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '380px', margin: '0 auto' }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                    >
                        Your hyper-intelligent sanctuary. Connect with a deeply empathetic AI therapist anywhere, anytime.
                    </motion.p>
                </div>

                {/* Glassmorph Login Form Panel */}
                <motion.div
                    style={{
                        padding: '2.5rem',
                        borderRadius: '30px',
                        textAlign: 'center',
                        background: 'rgba(255, 255, 255, 0.02)',
                        backdropFilter: 'blur(30px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                    }}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button
                            onClick={handleGetStarted}
                            className="btn-premium bg-gradient-primary"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            style={{ padding: '1.1rem', borderRadius: '18px', width: '100%', fontSize: '1.05rem', color: 'white', border: 'none', cursor: 'pointer' }}
                        >
                            Create Free Account
                            <motion.div
                                animate={{ x: isHovered ? 5 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ArrowRight size={20} />
                            </motion.div>
                        </button>

                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                padding: '1rem',
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '18px',
                                color: 'var(--text-main)',
                                fontWeight: '600',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255,255,255,0.08)';
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <User size={18} />
                            Log In to Account
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0', opacity: 0.5 }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                            <span style={{ margin: '0 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }}></div>
                        </div>

                        <button
                            onClick={handleGuestLogin}
                            style={{
                                padding: '1rem',
                                background: 'transparent',
                                border: '1px dashed rgba(255,255,255,0.2)',
                                borderRadius: '18px',
                                color: 'var(--text-muted)',
                                fontWeight: '500',
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255,255,255,0.05)';
                                e.target.style.color = 'var(--text-main)';
                                e.target.style.borderStyle = 'solid';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                                e.target.style.color = 'var(--text-muted)';
                                e.target.style.borderStyle = 'dashed';
                            }}
                        >
                            Continue as Guest
                        </button>
                    </div>

                    {/* Features Note */}
                    <div style={{ marginTop: '2.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Shield size={14} color="var(--success)" /> Private
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <MessageSquare size={14} color="#38bdf8" /> AI Therapist
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Lock size={14} color="#f472b6" /> Secure
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LandingPage;
