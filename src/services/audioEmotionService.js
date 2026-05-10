import axios from 'axios';
import { API_BASE_URL } from '../config';

/**
 * Audio Recording & Emotion Analysis Service
 * 
 * Handles:
 * - Recording audio from microphone using Web Audio API
 * - Converting to WAV format
 * - Sending to backend for emotion analysis via HuggingFace
 */
class AudioEmotionService {
    static mediaRecorder = null;
    static audioChunks = [];
    static audioContext = null;
    static stream = null;
    static analyzerNode = null;
    static animationId = null;

    /**
     * Initialize audio context and get microphone access
     */
    static async initialize() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Web Audio API not supported in this browser');
            }

            // Get microphone access
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                }
            });

            // Create audio context for visualization
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.audioContext.createMediaStreamSource(this.stream);
            this.analyzerNode = this.audioContext.createAnalyser();
            source.connect(this.analyzerNode);

            console.log('[AudioEmotionService] Microphone initialized');
            return true;
        } catch (error) {
            console.error('[AudioEmotionService] Failed to initialize:', error.message);
            throw error;
        }
    }

    /**
     * Start recording audio
     */
    static startRecording() {
        if (!this.stream) {
            throw new Error('Microphone not initialized. Call initialize() first.');
        }

        this.audioChunks = [];

        // Create MediaRecorder
        this.mediaRecorder = new MediaRecorder(this.stream, {
            mimeType: 'audio/webm;codecs=opus', // or 'audio/wav' if supported
        });

        this.mediaRecorder.addEventListener('dataavailable', (event) => {
            this.audioChunks.push(event.data);
        });

        this.mediaRecorder.start();
        console.log('[AudioEmotionService] Recording started');
        return true;
    }

    /**
     * Stop recording and return audio blob
     */
    static async stopRecording() {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                reject(new Error('No active recording'));
                return;
            }

            this.mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                console.log('[AudioEmotionService] Recording stopped. Blob size:', audioBlob.size);
                resolve(audioBlob);
            }, { once: true });

            this.mediaRecorder.stop();
        });
    }

    /**
     * Send audio blob to backend for emotion analysis
     * @param {Blob} audioBlob - Audio blob from recorder
     * @returns {Promise<object>} - Emotion analysis result
     */
    static async analyzeAudio(audioBlob) {
        try {
            if (!audioBlob || audioBlob.size === 0) {
                throw new Error('Audio blob is empty');
            }

            console.log('[AudioEmotionService] Sending audio for analysis... Size:', audioBlob.size);

            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            const response = await axios.post(
                `${API_BASE_URL}/api/emotion/analyze-audio`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    timeout: 60000, // 60 seconds timeout for HF Space
                }
            );

            console.log('[AudioEmotionService] Analysis result:', response.data);
            return response.data;

        } catch (error) {
            console.error('[AudioEmotionService] Analysis error:', error.message);
            throw new Error(`Emotion analysis failed: ${error.message}`);
        }
    }

    /**
     * Full workflow: Record -> Analyze
     * @param {number} durationMs - Duration to record in milliseconds
     * @returns {Promise<object>} - Emotion analysis result
     */
    static async recordAndAnalyze(durationMs = 10000) {
        try {
            // Initialize if not already done
            if (!this.stream) {
                await this.initialize();
            }

            // Start recording
            this.startRecording();

            // Wait for specified duration
            await new Promise(resolve => setTimeout(resolve, durationMs));

            // Stop recording
            const audioBlob = await this.stopRecording();

            // Analyze emotion
            const result = await this.analyzeAudio(audioBlob);

            return result;

        } catch (error) {
            console.error('[AudioEmotionService] recordAndAnalyze error:', error.message);
            throw error;
        }
    }

    /**
     * Get current audio level (for visualization)
     * Returns value between 0 and 1
     */
    static getAudioLevel() {
        if (!this.analyzerNode) return 0;

        const dataArray = new Uint8Array(this.analyzerNode.frequencyBinCount);
        this.analyzerNode.getByteFrequencyData(dataArray);

        // Calculate average frequency
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        return average / 255; // Normalize to 0-1
    }

    /**
     * Cleanup resources
     */
    static cleanup() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        this.mediaRecorder = null;
        this.audioChunks = [];
        this.stream = null;
        this.analyzerNode = null;

        console.log('[AudioEmotionService] Cleanup completed');
    }

    /**
     * Check HuggingFace Space health
     */
    static async checkHealth() {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/emotion/health`);
            return response.data;
        } catch (error) {
            console.error('[AudioEmotionService] Health check failed:', error.message);
            throw error;
        }
    }
}

export default AudioEmotionService;
