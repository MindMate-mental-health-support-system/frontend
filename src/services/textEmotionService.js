import axios from 'axios';
import { API_BASE_URL } from '../config';

/**
 * Text Emotion Detection Service
 * 
 * Analyzes text messages for emotions
 * Integrates with HuggingFace Text Emotion Detector
 */
class TextEmotionService {
    /**
     * Analyze emotion from text
     * @param {string} text - Text to analyze
     * @returns {Promise<object>} - Emotion analysis result
     */
    static async analyzeText(text) {
        try {
            if (!text || typeof text !== 'string' || text.trim().length === 0) {
                throw new Error('Text input is required and cannot be empty');
            }

            console.log('[TextEmotionService] Analyzing text:', text.substring(0, 50));

            const response = await axios.post(
                `${API_BASE_URL}/api/emotion/analyze-text`,
                { text: text.trim() },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000, // 30 seconds timeout for HF Space
                }
            );

            console.log('[TextEmotionService] Analysis result:', response.data);
            return response.data;

        } catch (error) {
            console.error('[TextEmotionService] Analysis error:', error.message);
            throw new Error(`Text emotion analysis failed: ${error.message}`);
        }
    }

    /**
     * Get emotion emoji for display
     */
    static getEmojiForEmotion(emotion) {
        const emojis = {
            'happy': '😊',
            'sad': '😢',
            'angry': '😠',
            'fear': '😨',
            'fearful': '😨',
            'disgust': '🤢',
            'disgusted': '🤢',
            'surprise': '😲',
            'surprised': '😲',
            'neutral': '😐'
        };

        return emojis[emotion?.toLowerCase()] || '💭';
    }

    /**
     * Get color for emotion badge
     */
    static getColorForEmotion(emotion) {
        const colors = {
            'happy': '#22c55e',      // green
            'sad': '#3b82f6',        // blue
            'angry': '#ef4444',      // red
            'fear': '#f59e0b',       // amber
            'fearful': '#f59e0b',
            'disgust': '#8b5cf6',    // purple
            'disgusted': '#8b5cf6',
            'surprise': '#ec4899',   // pink
            'surprised': '#ec4899',
            'neutral': '#6b7280'     // gray
        };

        return colors[emotion?.toLowerCase()] || '#6b7280';
    }

    /**
     * Check health of text emotion endpoint
     */
    static async checkHealth() {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/emotion/health`);
            return response.data;
        } catch (error) {
            console.error('[TextEmotionService] Health check failed:', error.message);
            throw error;
        }
    }
}

export default TextEmotionService;
