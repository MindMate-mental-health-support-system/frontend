import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import VoiceChat from './components/VoiceChat';
import './index.css';

// Simple Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('mindmate_token');
  const alias = localStorage.getItem('mindmate_alias');
  // Allow if logged in OR if using a Guest alias
  if (!token && !alias?.startsWith('Guest_')) {
    return <Navigate type="replace" to="/login" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/voicechat" element={
            <ProtectedRoute>
              <VoiceChat />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
