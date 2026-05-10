import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Activity, BarChart2, Filter } from 'lucide-react';
import {
    AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts';
import { API_BASE_URL } from '../config';

// Mapping emotions from the AI model to numeric values and colors
const moodConfig = {
    surprise: { value: 6, color: '#fbbf24', label: 'Surprise' },
    joy: { value: 5, color: '#10b981', label: 'Joy' },
    love: { value: 4, color: '#f472b6', label: 'Love' },
    default: { value: 3.5, color: '#94a3b8', label: 'Neutral' },
    sadness: { value: 2, color: '#38bdf8', label: 'Sadness' },
    fear: { value: 1.5, color: '#f59e0b', label: 'Fear' },
    anger: { value: 1, color: '#f43f5e', label: 'Anger' }
};

const DashboardPage = () => {
    const navigate = useNavigate();
    const [allSessions, setAllSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('1W'); // '1D', '1W', '1M', '1Y', 'ALL'

    const token = localStorage.getItem('mindmate_token');

    useEffect(() => {
        const fetchMoodData = async () => {
            try {
                if (!token) {
                    // Guest user or no token
                    setLoading(false);
                    setError('Dashboard analytics are only available for saved accounts. Create a free account to track your emotional journey securely!');
                    return;
                }

                // Fetch a large number of sessions to support up to 1Y graph
                const apiBase = API_BASE_URL || 'http://localhost:5000';

                const res = await axios.get(`${apiBase}/api/sessions?limit=1000`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setAllSessions(res.data.sessions || []);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
                setError(err.response?.data?.error || 'Failed to load analytics data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchMoodData();
    }, [token]);

    const chartData = useMemo(() => {
        const now = new Date();
        let filtered = allSessions;

        if (timeRange === '1D') {
            filtered = allSessions.filter(s => (now - new Date(s.created_at)) <= 24 * 60 * 60 * 1000);
        } else if (timeRange === '1W') {
            filtered = allSessions.filter(s => (now - new Date(s.created_at)) <= 7 * 24 * 60 * 60 * 1000);
        } else if (timeRange === '1M') {
            filtered = allSessions.filter(s => (now - new Date(s.created_at)) <= 30 * 24 * 60 * 60 * 1000);
        } else if (timeRange === '1Y') {
            filtered = allSessions.filter(s => (now - new Date(s.created_at)) <= 365 * 24 * 60 * 60 * 1000);
        }

        // Reverse to chronological order for the the graph (oldest to newest left to right)
        const sorted = [...filtered].reverse();

        return sorted.map(session => {
            const date = new Date(session.created_at);
            const moodKey = session.mood || 'default';
            const config = moodConfig[moodKey] || moodConfig['default'];

            return {
                name: timeRange === '1D' ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `${date.getMonth() + 1}/${date.getDate()}`,
                fullDate: date.toLocaleString(),
                title: session.title || 'Chat',
                mood: config.value,
                moodLabel: config.label,
                color: config.color
            };
        });
    }, [allSessions, timeRange]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{ background: 'var(--bg-panel)', padding: '12px', border: '1px solid var(--border-light)', borderRadius: '12px', boxShadow: '0 8px 32px var(--glass-shadow)' }}>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{data.fullDate}</p>
                    <p style={{ margin: '4px 0', fontWeight: 'bold', color: 'var(--text-main)' }}>{data.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: data.color }}></div>
                        <span style={{ color: data.color, fontWeight: '600' }}>{data.moodLabel}</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Calculate a dynamic gradient for the area graph based on the latest mood or just a stylish default
    const latestMoodColor = chartData.length > 0 ? chartData[chartData.length - 1].color : 'var(--primary)';

    return (
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '2rem' }}>

            <header className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderRadius: '20px', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/chat')} style={{ background: 'var(--btn-icon-bg)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--btn-icon-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--btn-icon-bg)'}>
                        <ArrowLeft size={18} /> <span style={{ fontSize: '0.9rem' }}>Back to Chat</span>
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
                    <Activity size={24} />
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0, color: 'var(--text-main)' }}>Emotion Analytics</h1>
                </div>

                <div style={{ width: '100px' }}></div> {/* Spacer for centering */}
            </header>

            <main className="glass-panel" style={{ flex: 1, borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
                        <BarChart2 size={24} color="var(--primary)" />
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Emotional Rollercoaster</h2>
                    </div>

                    {!error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--input-bg)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                            <Filter size={16} color="var(--text-muted)" style={{ marginLeft: '8px' }} />
                            {['1D', '1W', '1M', '1Y', 'ALL'].map(range => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    style={{
                                        border: 'none',
                                        background: timeRange === range ? 'var(--primary)' : 'transparent',
                                        color: timeRange === range ? '#fff' : 'var(--text-muted)',
                                        padding: '4px 12px',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ flex: 1, width: '100%', minHeight: '300px' }}>
                    {error && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--danger)', textAlign: 'center' }}>
                            <div style={{ padding: '2rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '12px' }}>
                                <p style={{ margin: 0, fontSize: '1rem' }}>⚠️ {error}</p>
                                <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Retry</button>
                            </div>
                        </div>
                    )}
                    {loading && !error && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>Loading analytics...</div>
                    )}
                    {!loading && !error && chartData.length === 0 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>Not enough data to graph in this timeframe. Try having some chats!</div>
                    )}
                    {!loading && !error && chartData.length > 0 && (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={latestMoodColor} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={latestMoodColor} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} minTickGap={20} />
                                <YAxis domain={[0, 7]} hide />
                                <Tooltip content={<CustomTooltip />} />

                                {/* Base reference line for neutral mood */}
                                <ReferenceLine y={3.5} stroke="var(--border-light)" strokeDasharray="3 3" />

                                <Area
                                    type="monotone"
                                    dataKey="mood"
                                    stroke={latestMoodColor}
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorMood)"
                                    activeDot={{ r: 8, strokeWidth: 0, fill: latestMoodColor }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </main>

        </div>
    );
};

export default DashboardPage;
