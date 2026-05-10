import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Mic, MicOff, Send, Activity, Loader2 } from 'lucide-react';

const VoiceChat = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [emotion, setEmotion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('SpeechRecognition is not supported in this browser. Please use Chrome or Edge.');
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      // Stop listening
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      // Start listening
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      const recognition = new SpeechRecognition();
      // Required by MVP: Use Malayalam (ml-IN) for speech recognition
      recognition.lang = 'ml-IN'; 
      recognition.interimResults = true;
      recognition.continuous = true;

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
        setTranscript(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      setTranscript('');
      setAiResponse('');
      setEmotion('');
    }
  };

  const handleSend = async () => {
    if (!transcript.trim()) return;

    // If still listening, stop first
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    setIsLoading(true);
    setAiResponse('');
    setEmotion('');

    try {
      const response = await axios.post(`http://localhost:5000/api/chat`, {
        transcript: transcript.trim()
      });

      setAiResponse(response.data.response || "No response received.");
      setEmotion(response.data.emotion || "neutral");
    } catch (error) {
      console.error("Error sending transcript:", error);
      setAiResponse("I'm here with you. Tell me more.");
      setEmotion("neutral");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', background: 'var(--bg-panel, #1e1e2e)', color: 'var(--text-main, #f8f8f2)', borderRadius: '12px', marginTop: '2rem', border: '1px solid var(--border-light, #44475a)' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: 'var(--primary, #8be9fd)' }}>
        <Activity size={24} /> AI Voice Chat Tester (Malayalam)
      </h2>
      
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button 
          onClick={toggleListen}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '8px',
            background: isListening ? '#ff5555' : '#50fa7b',
            color: '#282a36', border: 'none', fontWeight: 'bold',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          {isListening ? <><MicOff size={18} /> Stop</> : <><Mic size={18} /> Start Listening</>}
        </button>

        {isListening && <span style={{ color: '#ff5555', fontSize: '0.9rem' }}>● Recording...</span>}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-muted, #6272a4)' }}>Transcript:</label>
        <div style={{ 
          minHeight: '80px', padding: '1rem', 
          background: 'var(--input-bg, #282a36)', borderRadius: '8px', 
          border: '1px solid var(--border-light, #44475a)',
          wordBreak: 'break-word'
        }}>
          {transcript || <span style={{ color: 'gray' }}>Speak into your microphone...</span>}
        </div>
      </div>

      <button 
        onClick={handleSend}
        disabled={!transcript.trim() || isLoading}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderRadius: '8px',
          background: (!transcript.trim() || isLoading) ? 'gray' : '#bd93f9',
          color: 'white', border: 'none', fontWeight: 'bold',
          cursor: (!transcript.trim() || isLoading) ? 'not-allowed' : 'pointer',
          width: '100%', justifyContent: 'center'
        }}
      >
        {isLoading ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : <><Send size={18} /> Send to AI</>}
      </button>

      {aiResponse && (
        <div style={{ marginTop: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#ffb86c' }}>
            AI Response (Emotion: <span style={{ color: '#8be9fd' }}>{emotion}</span>):
          </label>
          <div style={{ 
            padding: '1rem', 
            background: 'rgba(189, 147, 249, 0.1)', borderRadius: '8px', 
            border: '1px solid #bd93f9', color: '#f8f8f2'
          }}>
            {aiResponse}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceChat;
