import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Activity, UserCircle, Loader2, ArrowLeft, ShieldCheck, MessageSquare, Volume2, Globe, Sun, Moon, BarChart2, Zap, Trash2, EyeOff } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import AudioEmotionService from '../services/audioEmotionService';
import TextEmotionService from '../services/textEmotionService';

const ChatPage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('mindmate_token');
    const alias = localStorage.getItem('mindmate_alias');
    const userData = JSON.parse(localStorage.getItem('mindmate_user') || '{}');
    const isGuest = alias?.startsWith('Guest_');

    const [sidebarOpen, setSidebarOpen] = useState(!isGuest);
    const [sessions, setSessions] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [hasMoreHistory, setHasMoreHistory] = useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // UI States
    const [currentLanguage, setCurrentLanguage] = useState(() => {
        // Load from localStorage or default to Malayalam
        return localStorage.getItem('mindmate_language') || 'ml-IN';
    });
    const [currentMood, setCurrentMood] = useState('default');
    const [isSelectingMood, setIsSelectingMood] = useState(false);
    const [theme, setTheme] = useState(() => {
        if (typeof window === 'undefined') return 'dark';
        const stored = localStorage.getItem('mindmate_theme');
        if (stored === 'light' || stored === 'dark') return stored;
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
    });
    const [useAI, setUseAI] = useState(false);

    // Get a random greeting every time
    const getGreeting = () => {
        const greetings = [
            `Welcome to your secure sanctuary, ${userData.username || alias}. I am MindMate. Speak freely—I'm listening.`,
            `Hi ${userData.username || alias}, how is your day going? I'm here for you.`,
            `Hello ${userData.username || alias}. Take a deep breath. What's on your mind today?`,
            `Welcome back, ${userData.username || alias}. This is your safe space.`
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    };

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isNewConversation, setIsNewConversation] = useState(true);
    const [recordedAudio, setRecordedAudio] = useState(null);
    const [visibleTranscripts, setVisibleTranscripts] = useState({});

    const toggleTranscript = (id) => {
        setVisibleTranscripts(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const [isIncognito, setIsIncognito] = useState(false);

    const handleDeleteSession = async (idToDelete) => {
        const targetId = idToDelete || selectedSessionId;
        if (!targetId || isGuest) return;
        if (!window.confirm("Are you sure you want to permanently delete this chat history?")) return;
        
        try {
            await axios.delete(`${apiBase}/api/sessions/${targetId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(prev => prev.filter(s => s.id !== targetId));
            if (selectedSessionId === targetId) {
                setSelectedSessionId(null);
                setIsNewConversation(true);
                setMessages([{
                    id: Date.now(),
                    sender: 'bot',
                    text: getGreeting(),
                    emotion: 'joy'
                }]);
            }
        } catch (e) {
            console.error("Failed to delete session", e);
            alert("Failed to delete session. Please try again.");
        }
    };

    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    // Initialize
    useEffect(() => {
        if (!alias && !token) {
            navigate('/login');
            return;
        }

        // Apply stored theme to document root
        document.documentElement.setAttribute('data-theme', theme);

        // Set initial greeting
        setMessages([{
            id: Date.now(),
            sender: 'bot',
            text: getGreeting(),
            emotion: 'joy'
        }]);
        setIsNewConversation(true);
        setSelectedSessionId(null);

        if (!isGuest && userData?.id) {
            fetchSessions();
            checkAIStatus();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, token, alias]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('mindmate_theme', theme);
    }, [theme]);

    // Persist language preference
    useEffect(() => {
        localStorage.setItem('mindmate_language', currentLanguage);
        console.log('[ChatPage] Language changed to:', currentLanguage);
    }, [currentLanguage]);

    const apiBase = API_BASE_URL;

    const checkAIStatus = async () => {
        try {
            const res = await axios.get(`${apiBase}/api/data/ai-status`);
            if (res.data?.aiAvailable) {
                setUseAI(true);
            }
        } catch (e) {
            console.warn('AI status check failed, falling back to normal mode', e);
            setUseAI(false);
        }
    };

    const fetchSessions = async () => {
        try {
            const res = await axios.get(`${apiBase}/api/sessions`, {
                params: { userId: userData.id },
                headers: { Authorization: `Bearer ${token}` }
            });
            const list = res.data.sessions || [];
            setSessions(list);
            if (list.length > 0 && !selectedSessionId) {
                // Do nothing. Start a fresh conversational session by default on login.
            }
        } catch (e) {
            console.error("Failed to load sessions", e);
        }
    };

    const fetchSessionHistory = async (sessionId, offset = 0) => {
        if (offset === 0) {
            setHasMoreHistory(true);
        }
        setIsLoadingHistory(true);
        try {
            const res = await axios.get(`${apiBase}/api/sessions/${sessionId}/history`, {
                params: { offset, limit: 50 },
                headers: { Authorization: `Bearer ${token}` }
            });
            const rows = res.data.history || [];

            if (rows.length < 50) {
                setHasMoreHistory(false);
            }

            const flatMessages = rows
                .flatMap(row => row.message_data || [])
                .map((m, index) => {
                    let derivedAudioUrl = m.audioUrl;
                    if (m.audioBase64 && !derivedAudioUrl) {
                        derivedAudioUrl = m.audioBase64;
                    }
                    return {
                        ...m,
                        id: m.id || `${row.id || 'row'}-${index}`,
                        audioUrl: derivedAudioUrl
                    };
                });

            setMessages(prev => {
                const greeting = prev[0] && prev[0].sender === 'bot' ? [prev[0]] : [];
                if (offset === 0) {
                    return [...greeting, ...flatMessages];
                } else {
                    // Prepend new messages, keeping the greeting at the top
                    const existingMessages = prev.filter(m => m.id !== greeting[0]?.id);
                    return [...greeting, ...flatMessages, ...existingMessages];
                }
            });
        } catch (e) {
            console.error("Failed to load session history", e);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const ensureSession = async () => {
        if (isGuest || !userData?.id || isIncognito) {
            return null;
        }
        if (selectedSessionId && !isNewConversation) return selectedSessionId;
        try {
            const res = await axios.post(`${apiBase}/api/sessions`, {
                userId: userData.id,
                title: `Chat - ${new Date().toLocaleString()}`
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const session = res.data.session;
            setSessions(prev => [session, ...prev]);
            setSelectedSessionId(session.id);
            setIsNewConversation(false);
            return session.id;
        } catch (e) {
            console.error('Failed to create session', e);
            return null;
        }
    };

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => { scrollToBottom(); }, [messages]);



    const toggleListen = async () => {
        if (isListening) {
            return new Promise((resolve) => {
                setIsListening(false);
                recognitionRef.current?.stop();
                
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                    mediaRecorderRef.current.onstop = () => {
                        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                        setRecordedAudio(audioBlob);
                        const stream = mediaRecorderRef.current.stream;
                        if (stream) stream.getTracks().forEach(track => track.stop());
                        resolve(audioBlob);
                    };
                    mediaRecorderRef.current.stop();
                } else {
                    resolve(null);
                }
            });
        } else {
            try {
                // Initialize Speech Recognition
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SpeechRecognition) {
                    alert("Your browser does not support Speech Recognition. Please use Chrome/Edge.");
                    return;
                }
                const recognition = new SpeechRecognition();
                recognition.lang = currentLanguage || 'en-IN';
                recognition.interimResults = true;
                recognition.continuous = true;
                console.log('[Speech Recognition] Language set to:', recognition.lang);

                let finalTranscript = '';

                recognition.onresult = (event) => {
                    let interimTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }
                    setInput(finalTranscript + interimTranscript);
                };

                recognition.onerror = (event) => {
                    console.error("Speech recognition error", event.error);
                    setIsListening(false);
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current = recognition;

                // Also initialize MediaRecorder to capture the audio file for SER
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream);
                mediaRecorderRef.current = recorder;
                audioChunksRef.current = [];

                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        audioChunksRef.current.push(e.data);
                    }
                };

                recorder.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    setRecordedAudio(audioBlob);
                    stream.getTracks().forEach(track => track.stop());
                };

                // Start both
                recognition.start();
                recorder.start();
                setIsListening(true);
                setInput('');
                setRecordedAudio(null);
            } catch (err) {
                console.error("Mic error:", err);
                setIsListening(false);
            }
        }
    };

    const playAudio = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            // Set language to current selection
            utterance.lang = currentLanguage || 'en-IN';
            utterance.rate = 0.95; // Slightly slower for clarity
            utterance.pitch = 1.0;
            console.log('[Speech Synthesis] Language set to:', utterance.lang);
            window.speechSynthesis.speak(utterance);
        }
    };

    const blobToBase64 = (blob) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    };

    const handleSend = async () => {
        let currentAudio = recordedAudio;

        if (isListening) {
            // Stop listening but continue to process the manual send
            const resolvedAudio = await toggleListen();
            if (resolvedAudio) {
                currentAudio = resolvedAudio;
            }
        }
        if (!input.trim() && !currentAudio) return;
        if (isLoading) return;

        const userText = input.trim();
        let emotionData = { emotion: 'neutral', confidence: 0.5, scores: null };

        // Analyze emotion from text locally just for frontend UI
        try {
            console.log('[ChatPage] Analyzing emotion from text...');
            emotionData = await TextEmotionService.analyzeText(userText);
        } catch (error) {
            console.warn('[ChatPage] Text emotion analysis failed:', error.message);
        }

        let audioBase64 = null;
        if (currentAudio) {
            audioBase64 = await blobToBase64(currentAudio);
        }

        const newMessage = {
            id: Date.now(),
            sender: 'user',
            text: userText,
            emotion: emotionData.emotion,
            emotionConfidence: emotionData.confidence,
            emotionScores: emotionData.scores,
            audioUrl: currentAudio ? URL.createObjectURL(currentAudio) : null,
            audioBase64: audioBase64
        };
        setMessages(prev => [...prev, newMessage]);
        setInput('');
        
        // Capture audio and reset state
        setRecordedAudio(null);
        setIsLoading(true);

        try {
            const sessionId = await ensureSession();
            const endpoint = useAI ? `${apiBase}/api/data/process-with-ai?stream=true` : `${apiBase}/api/data/process`;

            // Prepare payload
            let fetchOptions = {};
            let axiosOptions = {};
            let axiosData = null;
            
            if (currentAudio) {
                const formData = new FormData();
                formData.append('type', 'voice');
                formData.append('userId', userData.id || alias);
                formData.append('voice', currentAudio, 'audio.webm');
                formData.append('language', currentLanguage || 'en-IN');
                if (userText) formData.append('text', userText);
                
                fetchOptions = { method: 'POST', body: formData };
                axiosOptions = { headers: { 'Content-Type': 'multipart/form-data' } };
                axiosData = formData;
            } else {
                const jsonBody = {
                    type: 'text',
                    text: userText,
                    userId: userData.id || alias
                };
                fetchOptions = { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(jsonBody)
                };
                axiosOptions = { headers: { 'Content-Type': 'application/json' } };
                axiosData = jsonBody;
            }

            if (useAI) {
                // Streaming Path using Fetch
                const response = await fetch(endpoint, fetchOptions);

                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let done = false;

                // Add an empty bot message immediately
                const tempBotId = Date.now() + 1;
                setMessages(prev => [...prev, { id: tempBotId, sender: 'bot', text: '', isStreaming: true }]);

                let currentText = '';
                let finalBotData = null;

                while (!done) {
                    const { value, done: readerDone } = await reader.read();
                    done = readerDone;
                    if (value) {
                        const chunkStr = decoder.decode(value, { stream: true });
                        const lines = chunkStr.split('\n\n');
                        for (const line of lines) {
                            if (line.trim().startsWith('data:')) {
                                try {
                                    const parsed = JSON.parse(line.trim().substring(5).trim());
                                    if (parsed.type === 'chunk') {
                                        currentText += parsed.text;
                                        setMessages(prev => prev.map(m => m.id === tempBotId ? { ...m, text: currentText } : m));
                                    } else if (parsed.type === 'done') {
                                        finalBotData = parsed.package;
                                        done = true;
                                    }
                                } catch (e) {
                                }
                            }
                        }
                    }
                }

                // Once stream is complete, finalize message
                if (finalBotData) {
                    if (finalBotData.detectedEmotion) setCurrentMood(finalBotData.detectedEmotion.toLowerCase());
                    const finalBotMessage = {
                        id: tempBotId,
                        sender: 'bot',
                        text: finalBotData.response || currentText || "I hear you.",
                        isCrisis: finalBotData.isCrisis,
                        suggestions: finalBotData.suggestions,
                        resources: finalBotData.resources,
                        isStreaming: false
                    };
                    setMessages(prev => prev.map(m => m.id === tempBotId ? finalBotMessage : m));

                    // Save to Supabase
                    if (!isGuest && userData?.id && sessionId && !isIncognito) {
                        await axios.post(`${apiBase}/api/sessions/${sessionId}/messages`, {
                            userId: userData.id,
                            message_data: [newMessage, finalBotMessage],
                            mood: finalBotData.detectedEmotion?.toLowerCase() || currentMood,
                            userEmotion: emotionData.emotion
                        }, { headers: { Authorization: `Bearer ${token}` } });
                        fetchSessions();
                    }
                }
            } else {
                // Standard Axios Path
                const response = await axios.post(endpoint, axiosData, axiosOptions);

                const botData = response.data.data;
                if (botData.detectedEmotion) {
                    setCurrentMood(botData.detectedEmotion.toLowerCase());
                }

                const botMessage = {
                    id: Date.now() + 1,
                    sender: 'bot',
                    text: botData.response || "I hear you.",
                    isCrisis: botData.isCrisis,
                    isGreeting: botData.isGreeting || false,
                    greetingType: botData.greetingType || null,
                    suggestions: botData.suggestions,
                    resources: botData.resources,
                    emotion: botData.emotion || currentMood
                };

                setMessages(prev => [...prev, botMessage]);

                // Save to Supabase if not guest
                if (!isGuest && userData?.id && sessionId && !isIncognito) {
                    await axios.post(`${apiBase}/api/sessions/${sessionId}/messages`, {
                        userId: userData.id,
                        message_data: [newMessage, botMessage],
                        mood: emotionData.emotion || currentMood,
                        userEmotion: emotionData.emotion
                    }, { headers: { Authorization: `Bearer ${token}` } });
                    fetchSessions();
                }
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "Connection error." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('mindmate_token');
        localStorage.removeItem('mindmate_user');
        localStorage.removeItem('mindmate_alias');
        navigate('/');
    };

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    // Helper for Mood UI
    const moods = {
        joy: { label: 'Positive Resonance', color: 'var(--success)', icon: Activity },
        surprise: { label: 'High Energy', color: '#fbbf24', icon: Activity },
        love: { label: 'Deep Connection', color: '#f472b6', icon: Activity },
        sadness: { label: 'Low Energy', color: '#38bdf8', icon: Activity },
        fear: { label: 'Elevated Tension', color: '#f59e0b', icon: Activity },
        anger: { label: 'High Tension', color: 'var(--danger)', icon: Activity },
        default: { label: 'Today Mood', color: 'var(--text-muted)', icon: Activity }
    };
    const moodUI = moods[currentMood] || moods.default;
    const MoodIcon = moodUI.icon;

    return (
        <div className="app-container" style={{ display: 'flex', flexDirection: 'row', height: '100vh', width: '100%' }}>

            {/* Sidebar for Logged-In Users */}
            <AnimatePresence>
                {sidebarOpen && !isGuest && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 300, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        style={{ width: '300px', flexShrink: 0, borderRight: '1px solid var(--border-light)', background: 'var(--bg-panel)', display: 'flex', flexDirection: 'column' }}
                    >
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-main)' }}>Chat Sessions</h2>
                            <button
                                onClick={() => {
                                    setSelectedSessionId(null);
                                    setMessages([{
                                        id: Date.now(),
                                        sender: 'bot',
                                        text: getGreeting(),
                                        emotion: 'joy'
                                    }]);
                                    setIsNewConversation(true);
                                }}
                                style={{ background: 'var(--primary-light)', border: 'none', borderRadius: '999px', padding: '6px 12px', color: 'white', fontSize: '0.8rem', cursor: 'pointer', transition: 'background 0.2s', fontWeight: '600' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                ➕ New Chat
                            </button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                            {sessions.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>No history yet.</p>
                            ) : (
                                sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        onClick={() => {
                                            setSelectedSessionId(session.id);
                                            setIsNewConversation(false);
                                            fetchSessionHistory(session.id);
                                        }}
                                        style={{
                                            padding: '1rem',
                                            background: selectedSessionId === session.id ? '#6366f1' : 'var(--input-bg)',
                                            color: selectedSessionId === session.id ? 'white' : 'var(--text-main)',
                                            borderRadius: '12px',
                                            marginBottom: '0.5rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            border: selectedSessionId === session.id ? 'none' : '1px solid var(--border-light)'
                                        }}
                                        onMouseEnter={e => {
                                            if (selectedSessionId !== session.id) {
                                                e.currentTarget.style.background = 'var(--input-focus)';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (selectedSessionId !== session.id) {
                                                e.currentTarget.style.background = 'var(--input-bg)';
                                            }
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: selectedSessionId === session.id ? 'white' : 'var(--primary-light)' }}>
                                                <MessageSquare size={14} />
                                                <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{session.title || 'Chat'}</span>
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }}
                                                style={{ background: 'transparent', border: 'none', color: selectedSessionId === session.id ? 'rgba(255,255,255,0.7)' : 'var(--danger)', cursor: 'pointer', padding: '2px' }}
                                                title="Delete Chat"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: selectedSessionId === session.id ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {session.last_message_preview || 'No messages yet'}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', maxWidth: sidebarOpen ? 'calc(100% - 300px)' : '100%', transition: 'max-width 0.3s' }}>

                <header className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderRadius: '20px', marginBottom: '1rem', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {!isGuest && (
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <MessageSquare size={20} />
                            </button>
                        )}
                        <button onClick={handleLogout} style={{ background: 'var(--btn-icon-bg)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--btn-icon-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--btn-icon-bg)'}>
                            <ArrowLeft size={18} /> <span style={{ fontSize: '0.9rem' }}>Exit</span>
                        </button>
                        <div style={{ height: '24px', width: '1px', background: 'var(--border-light)' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <UserCircle size={20} color="var(--primary-light)" />
                            <span style={{ fontWeight: '500', fontSize: '1rem' }}>{userData?.username || alias} {isGuest && "(Guest)"}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Dashboard Button */}
                        {!isGuest && (
                            <button
                                onClick={() => navigate('/dashboard')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    borderRadius: '999px',
                                    border: '1px solid var(--border-light)',
                                    background: 'var(--input-bg)',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary-light)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                                title="Mood Dashboard"
                            >
                                <BarChart2 size={16} />
                                <span style={{ fontSize: '0.85rem', fontWeight: '500', display: window.innerWidth > 768 ? 'inline' : 'none' }}>Dashboard</span>
                            </button>
                        )}




                        {/* Incognito Toggle */}
                        <button
                            onClick={() => {
                                setIsIncognito(!isIncognito);
                                if (!isIncognito) {
                                    // Turning incognito ON, clear current session context to prevent appending
                                    setSelectedSessionId(null);
                                    setIsNewConversation(true);
                                    setMessages([{ id: Date.now(), sender: 'bot', text: 'You are now in Incognito Mode. Your messages will not be saved.', emotion: 'joy' }]);
                                } else {
                                    // Turning incognito OFF
                                    setSelectedSessionId(null);
                                    setIsNewConversation(true);
                                    setMessages([{ id: Date.now(), sender: 'bot', text: 'Incognito Mode disabled. You are now in a secure session.', emotion: 'joy' }]);
                                }
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                borderRadius: '999px',
                                border: '1px solid ' + (isIncognito ? 'var(--primary)' : 'var(--border-light)'),
                                background: isIncognito ? 'rgba(99, 102, 241, 0.1)' : 'var(--input-bg)',
                                color: isIncognito ? 'var(--primary-light)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            title="Toggle Incognito Mode"
                        >
                            <EyeOff size={16} />
                            <span style={{ fontSize: '0.85rem', fontWeight: '500', display: window.innerWidth > 768 ? 'inline' : 'none' }}>Incognito</span>
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                borderRadius: '999px',
                                border: '1px solid var(--border-light)',
                                background: 'var(--input-bg)',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--input-focus)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--input-bg)'}
                        >
                            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                            <span style={{ fontSize: '0.8rem' }}>{theme === 'dark' ? 'Dark' : 'Light'} mode</span>
                        </button>

                        {/* Language Selector */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--input-bg)', border: '1px solid var(--border-light)', padding: '6px 12px', borderRadius: '12px' }}>
                            <Globe size={16} color="var(--text-muted)" />
                            <select
                                value={currentLanguage}
                                onChange={(e) => setCurrentLanguage(e.target.value)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', fontSize: '0.85rem' }}
                            >
                                <option value="en-US" style={{ color: 'var(--text-inverse)', background: 'var(--bg-panel)' }}>English (US)</option>
                                <option value="ml-IN" style={{ color: 'var(--text-inverse)', background: 'var(--bg-panel)' }}>Malayalam (IN)</option>
                                <option value="hi-IN" style={{ color: 'var(--text-inverse)', background: 'var(--bg-panel)' }}>Hindi (IN)</option>
                            </select>
                        </div>

                        {/* Clickable Mood Seeker */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setIsSelectingMood(!isSelectingMood)}
                                className={`mood-glow-${currentMood}`}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '8px 16px', borderRadius: '99px',
                                    background: 'var(--input-bg)', border: '1px solid',
                                    transition: 'all 0.5s ease', cursor: 'pointer',
                                    borderColor: currentMood === 'default' ? 'var(--border-light)' : moodUI.color
                                }}
                            >
                                <MoodIcon size={16} color={moodUI.color} className={currentMood !== 'default' && !isSelectingMood ? 'animate-pulse' : ''} />
                                <span style={{ fontSize: '0.85rem', fontWeight: '500', color: moodUI.color, letterSpacing: '0.5px' }}>
                                    {moodUI.label.toUpperCase()}
                                </span>
                            </button>

                            {isSelectingMood && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ position: 'absolute', top: '100%', right: 0, marginTop: '10px', background: 'var(--bg-panel)', padding: '10px', borderRadius: '16px', border: '1px solid var(--border-light)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', zIndex: 50, boxShadow: '0 10px 40px var(--glass-shadow)' }}
                                >
                                    {Object.entries(moods).filter(([k]) => k !== 'default').map(([key, m]) => (
                                        <button
                                            key={key}
                                            onClick={() => { setCurrentMood(key); setIsSelectingMood(false); }}
                                            style={{ padding: '8px 12px', background: 'var(--input-bg)', border: 'n', borderRadius: '8px', color: m.color, fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <m.icon size={14} /> {m.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            <ShieldCheck size={16} color="var(--success)" />
                            Encrypted
                        </div>
                    </div>
                </header>

                <main
                    className="glass-panel"
                    style={{ flex: 1, overflowY: 'auto', padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '1rem', scrollBehavior: 'smooth' }}
                    onScroll={(e) => {
                        if (e.target.scrollTop === 0 && hasMoreHistory && !isLoadingHistory && selectedSessionId) {
                            // Fetch older messages, offset by current db rows loaded (estimated by length / 2)
                            // A more robust way is tracking exactly how many history rows we fetched, but this is a lightweight frontend approximation
                            fetchSessionHistory(selectedSessionId, messages.length);
                        }
                    }}
                >
                    <AnimatePresence>
                        {isLoadingHistory && (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '10px 0' }}>
                                Loading older messages...
                            </div>
                        )}
                        {messages.map((msg) => (
                            <motion.div key={msg.id} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} style={{ display: 'flex', width: '100%', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{ maxWidth: '80%' }}>
                                    <div style={{
                                        position: 'relative',
                                        padding: '16px 20px', borderRadius: '20px', fontSize: '1.05rem', lineHeight: '1.6',
                                        color: msg.sender === 'user' ? 'var(--msg-bot-text)' : 'var(--msg-bot-text)',
                                        background: msg.sender === 'user' ? 'var(--card-gradient)' : msg.isCrisis ? 'var(--crisis-bg)' : 'var(--msg-bot-bg)',
                                        border: msg.sender === 'user' ? 'none' : `1px solid ${msg.isCrisis ? 'var(--crisis-border)' : 'var(--msg-bot-border)'}`,
                                        borderBottomRightRadius: msg.sender === 'user' ? '4px' : '20px',
                                        borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '20px',
                                        boxShadow: msg.sender === 'user' ? '0 10px 25px -5px rgba(99, 102, 241, 0.3)' : 'none'
                                    }}>
                                        {/* Set color via inline styles properly below, no global CSS injection */}

                                        {msg.sender === 'bot' && (
                                            <button
                                                onClick={() => playAudio(msg.text)}
                                                style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--primary-light)', cursor: 'pointer', padding: '4px', borderRadius: '50%' }}
                                                title="Play Audio"
                                            >
                                                <Volume2 size={16} />
                                            </button>
                                        )}

                                        <div style={{ paddingRight: msg.sender === 'bot' ? '24px' : '0', color: msg.sender === 'user' ? '#ffffff' : 'var(--text-main)', display: 'inline-block' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {msg.audioUrl && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <audio controls src={msg.audioUrl} style={{ maxWidth: '100%', height: '36px', outline: 'none', filter: 'invert(1) opacity(0.8)' }} />
                                                        <button 
                                                            onClick={() => toggleTranscript(msg.id)}
                                                            style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', transition: 'background 0.2s' }}
                                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                                                        >
                                                            {visibleTranscripts[msg.id] ? 'Hide Transcript' : 'Show Transcript'}
                                                        </button>
                                                    </div>
                                                )}
                                                {msg.emotion && (
                                                    <div style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '0.85rem',
                                                        background: 'rgba(255, 255, 255, 0.1)',
                                                        padding: '4px 8px',
                                                        borderRadius: '12px',
                                                        width: 'fit-content',
                                                        color: msg.sender === 'user' ? '#ffffff' : 'var(--primary-light)'
                                                    }}>
                                                        <Zap size={14} />
                                                        <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{msg.emotion}</span>
                                                        {msg.emotionConfidence && (
                                                            <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>
                                                                ({(msg.emotionConfidence * 100).toFixed(0)}%)
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {msg.text && (!msg.audioUrl || visibleTranscripts[msg.id]) && (
                                                    <span style={{ color: msg.sender === 'user' ? '#ffffff' : 'inherit', marginTop: msg.audioUrl ? '8px' : '0', display: 'block', padding: msg.audioUrl ? '8px' : '0', background: msg.audioUrl ? 'rgba(0,0,0,0.1)' : 'transparent', borderRadius: '8px' }}>
                                                        {msg.text}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {msg.suggestions && msg.suggestions.length > 0 && (
                                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Actionable Insights</p>
                                                <ul style={{ paddingLeft: '20px', fontSize: '0.95rem', color: 'var(--text-main)', opacity: 0.9 }}>
                                                    {msg.suggestions.map((s, i) => <li key={i} style={{ marginBottom: '4px' }}>{s}</li>)}
                                                </ul>
                                            </div>
                                        )}

                                        {msg.resources && msg.resources.length > 0 && (
                                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--crisis-border)' }}>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--danger)', marginBottom: '8px', fontWeight: 'bold' }}>CRISIS RESOURCES</p>
                                                {msg.resources.map((r, i) => (
                                                    <div key={i} style={{ background: 'var(--input-bg)', padding: '10px', borderRadius: '8px', marginBottom: '8px' }}>
                                                        <strong style={{ display: 'block', color: 'var(--text-main)' }}>{r.name}</strong>
                                                        <span style={{ color: 'var(--primary)', fontSize: '1.1rem', fontWeight: 'bold' }}>{r.contact}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', textAlign: msg.sender === 'user' ? 'right' : 'left', padding: '0 4px' }}>
                                        {msg.sender === 'user' ? (userData?.username || alias) : 'MindMate AI'} • Secure
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {isLoading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', width: '100%', justifyContent: 'flex-start' }}>
                                <div style={{ padding: '12px 20px', borderRadius: '20px', background: 'var(--msg-bot-bg)', border: '1px solid var(--msg-bot-border)', display: 'flex', alignItems: 'center', gap: '10px', borderBottomLeftRadius: '4px' }}>
                                    <Loader2 size={18} className="animate-spin" color="var(--primary-light)" />
                                    <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Processing context...</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </main>

                <footer className="glass-panel" style={{ padding: '12px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10 }}>
                    <button
                        onClick={toggleListen}
                        style={{
                            width: '48px', height: '48px', borderRadius: '50%',
                            background: isListening ? 'var(--crisis-bg)' : 'var(--btn-icon-bg)',
                            border: isListening ? '1px solid var(--crisis-border)' : '1px solid transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.3s'
                        }}
                        className={isListening ? 'animate-pulse' : ''}
                        title="Speech to Text"
                    >
                        {isListening ? <MicOff size={20} color="var(--danger)" /> : <Mic size={20} color="var(--primary-light)" />}
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isListening ? "Recording Audio..." : "Type your message..."}
                        style={{
                            flex: 1, background: 'transparent', border: 'none', color: 'var(--text-main)',
                            fontSize: '1.05rem', outline: 'none', padding: '0 8px'
                        }}
                    />

                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        style={{
                            width: '48px', height: '48px', borderRadius: '50%',
                            background: (!input.trim() || isLoading) ? 'var(--btn-icon-bg)' : 'var(--card-gradient)',
                            border: (!input.trim() || isLoading) ? '1px solid var(--border-light)' : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: (!input.trim() || isLoading) ? 'none' : '0 4px 15px rgba(99, 102, 241, 0.4)'
                        }}
                    >
                        <Send size={20} color={(!input.trim() || isLoading) ? 'var(--text-muted)' : 'white'} style={{ marginLeft: '2px' }} />
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ChatPage;
