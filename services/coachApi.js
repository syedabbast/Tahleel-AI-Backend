import axios from 'axios';

const API_BASE_URL = 'https://tahleel-ai-backend.onrender.com/api';

// Mock data for development
const mockData = {
  squad: [
    { id: 1, name: "Ahmed Al-Rashid", position: "GK", fitness: 98, form: 8.2, availability: "available", photo: "👤" },
    { id: 2, name: "Omar Hassan", position: "CB", fitness: 92, form: 7.8, availability: "available", photo: "👤" },
    { id: 3, name: "Khalid Mansour", position: "CB", fitness: 88, form: 8.5, availability: "minor_injury", photo: "👤" },
    { id: 4, name: "Youssef Ahmed", position: "LB", fitness: 95, form: 7.9, availability: "available", photo: "👤" },
    { id: 5, name: "Mohammed Ali", position: "RB", fitness: 90, form: 8.1, availability: "available", photo: "👤" },
    { id: 6, name: "Salem Al-Dawsari", position: "CM", fitness: 93, form: 8.7, availability: "available", photo: "👤" },
    { id: 7, name: "Faisal Mubarak", position: "CM", fitness: 89, form: 7.6, availability: "suspended", photo: "👤" },
    { id: 8, name: "Nasser Abdullah", position: "AM", fitness: 94, form: 9.1, availability: "available", photo: "👤" },
    { id: 9, name: "Fahad Al-Muwallad", position: "LW", fitness: 91, form: 8.3, availability: "available", photo: "👤" },
    { id: 10, name: "Salman Al-Faraj", position: "RW", fitness: 87, form: 7.7, availability: "minor_injury", photo: "👤" },
    { id: 11, name: "Abdulrazak Hamdallah", position: "ST", fitness: 96, form: 9.3, availability: "available", photo: "👤" }
  ],
  
  trainingSchedule: [
    { date: "2025-07-16", type: "Tactical Training", focus: "Set Pieces", duration: "90 min" },
    { date: "2025-07-17", type: "Recovery Session", focus: "Light Training", duration: "60 min" },
    { date: "2025-07-18", type: "Match Preparation", focus: "Opposition Analysis", duration: "75 min" },
    { date: "2025-07-19", type: "Final Training", focus: "Team Shape", duration: "45 min" }
  ],

  teamStats: {
    wins: 8,
    draws: 3,
    losses: 1,
    goalsFor: 24,
    goalsAgainst: 8,
    cleanSheets: 6,
    currentForm: ['W', 'W', 'D', 'W', 'W']
  }
};

export const coachApi = {
  // Squad Management
  async getSquad() {
    try {
      const response = await axios.get(`${API_BASE_URL}/coach/squad`);
      return response.data;
    } catch (error) {
      console.warn('Using mock squad data:', error.message);
      return mockData.squad;
    }
  },

  async updatePlayerStatus(playerId, status) {
    try {
      const response = await axios.patch(`${API_BASE_URL}/coach/player/${playerId}`, {
        availability: status
      });
      return response.data;
    } catch (error) {
      console.error('Error updating player:', error);
      // Return mock success for development
      return { success: true };
    }
  },

  // Training Management
  async getTrainingSchedule() {
    try {
      const response = await axios.get(`${API_BASE_URL}/coach/training`);
      return response.data;
    } catch (error) {
      console.warn('Using mock training data:', error.message);
      return mockData.trainingSchedule;
    }
  },

  async createTrainingSession(sessionData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/coach/training`, sessionData);
      return response.data;
    } catch (error) {
      console.error('Error creating training session:', error);
      return { success: true, id: Date.now() };
    }
  },

  // Analytics
  async getTeamAnalytics(period = 'season') {
    try {
      const response = await axios.get(`${API_BASE_URL}/coach/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      console.warn('Using mock analytics data:', error.message);
      return mockData.teamStats;
    }
  },

  // Live Match
  async getLiveMatchData(matchId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/coach/match/${matchId}/live`);
      return response.data;
    } catch (error) {
      console.warn('Using mock live match data:', error.message);
      return {
        isLive: true,
        score: { home: 2, away: 1 },
        minute: 67,
        events: []
      };
    }
  }
};
