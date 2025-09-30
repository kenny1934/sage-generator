/**
 * SAGE - Data Manager
 * Handles all data persistence, user preferences, history, stats, and streaks
 */

class DataManager {
    static loadPreferences() {
        try {
            const preferences = localStorage.getItem(CONFIG.PREFERENCES_KEY);
            return preferences ? JSON.parse(preferences) : {
                preferredDifficulty: 'Medium',
                preferredTopics: [],
                lastUsedTopic: '',
                autoSaveHistory: true,
                maxHistoryItems: 50
            };
        } catch (error) {
            console.error('Error loading preferences:', error);
            return this.getDefaultPreferences();
        }
    }

    static savePreferences(preferences) {
        try {
            localStorage.setItem(CONFIG.PREFERENCES_KEY, JSON.stringify(preferences));
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    }

    static getDefaultPreferences() {
        return {
            preferredDifficulty: 'Medium',
            preferredTopics: [],
            lastUsedTopic: '',
            autoSaveHistory: true,
            maxHistoryItems: 50
        };
    }

    static loadHistory() {
        try {
            const history = localStorage.getItem(CONFIG.HISTORY_KEY);
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error loading history:', error);
            return [];
        }
    }

    static saveHistory(historyItems) {
        try {
            const preferences = this.loadPreferences();
            if (!preferences.autoSaveHistory) return;

            // Limit history size
            const limitedHistory = historyItems.slice(0, preferences.maxHistoryItems);
            localStorage.setItem(CONFIG.HISTORY_KEY, JSON.stringify(limitedHistory));
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }

    static addToHistory(topic, difficulty, questionsCount = 3) {
        const history = this.loadHistory();
        const historyItem = {
            id: Date.now(),
            topic: topic.trim(),
            difficulty,
            questionsCount,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString()
        };

        // Remove duplicate topics (keep most recent)
        const filteredHistory = history.filter(item => 
            item.topic.toLowerCase() !== topic.toLowerCase().trim()
        );

        // Add new item at the beginning
        const updatedHistory = [historyItem, ...filteredHistory];
        this.saveHistory(updatedHistory);
        this.updateStats(topic, difficulty);

        return updatedHistory;
    }

    static getRecentTopics(limit = 6) {
        const history = this.loadHistory();
        return history.slice(0, limit).map(item => ({
            topic: item.topic,
            difficulty: item.difficulty,
            lastUsed: item.date
        }));
    }

    static loadStats() {
        try {
            const stats = localStorage.getItem(CONFIG.STATS_KEY);
            return stats ? JSON.parse(stats) : {
                totalQuestions: 0,
                totalSessions: 0,
                favoriteTopics: {},
                difficultyDistribution: {},
                firstUsed: new Date().toISOString(),
                lastUsed: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error loading stats:', error);
            return this.getDefaultStats();
        }
    }

    static saveStats(stats) {
        try {
            localStorage.setItem(CONFIG.STATS_KEY, JSON.stringify(stats));
        } catch (error) {
            console.error('Error saving stats:', error);
        }
    }

    static updateStats(topic, difficulty) {
        const stats = this.loadStats();
        
        stats.totalQuestions += 3; // Assuming 3 questions per generation
        stats.totalSessions += 1;
        stats.lastUsed = new Date().toISOString();

        // Track favorite topics
        const topicKey = topic.toLowerCase().trim();
        stats.favoriteTopics[topicKey] = (stats.favoriteTopics[topicKey] || 0) + 1;

        // Track difficulty distribution
        stats.difficultyDistribution[difficulty] = (stats.difficultyDistribution[difficulty] || 0) + 1;

        this.saveStats(stats);
    }

    static getDefaultStats() {
        return {
            totalQuestions: 0,
            totalSessions: 0,
            favoriteTopics: {},
            difficultyDistribution: {},
            firstUsed: new Date().toISOString(),
            lastUsed: new Date().toISOString()
        };
    }

    static loadFavorites() {
        try {
            const favorites = localStorage.getItem(CONFIG.FAVORITES_KEY);
            return favorites ? JSON.parse(favorites) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }

    static saveFavorites(favorites) {
        try {
            localStorage.setItem(CONFIG.FAVORITES_KEY, JSON.stringify(favorites));
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    }

    static addToFavorites(question, answer, solution, topic, difficulty) {
        const favorites = this.loadFavorites();
        const questionHash = typeof simpleHash === 'function' ? simpleHash(question) : question.substring(0, 50);

        const favorite = {
            id: Date.now(),
            questionHash, // Add hash for tracking
            question,
            answer,
            solution,
            topic,
            difficulty,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString()
        };

        favorites.unshift(favorite);
        this.saveFavorites(favorites);
        return favorites;
    }

    static isQuestionFavorited(questionHash) {
        const favorites = this.loadFavorites();
        return favorites.some(fav => fav.questionHash === questionHash);
    }

    static removeFromFavorites(favoriteId) {
        const favorites = this.loadFavorites();
        const updatedFavorites = favorites.filter(fav => fav.id !== favoriteId);
        this.saveFavorites(updatedFavorites);
        return updatedFavorites;
    }

    // Phase 4: Usage Streaks and Milestones
    static loadStreaksAndMilestones() {
        try {
            const data = localStorage.getItem(CONFIG.STREAKS_KEY || 'sage-streaks');
            return data ? JSON.parse(data) : {
                currentStreak: 0,
                longestStreak: 0,
                lastUsageDate: null,
                totalDaysUsed: 0,
                milestones: {},
                achievements: []
            };
        } catch (error) {
            console.error('Error loading streaks data:', error);
            return this.getDefaultStreaksData();
        }
    }

    static saveStreaksAndMilestones(data) {
        try {
            localStorage.setItem(CONFIG.STREAKS_KEY || 'sage-streaks', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving streaks data:', error);
        }
    }

    static getDefaultStreaksData() {
        return {
            currentStreak: 0,
            longestStreak: 0,
            lastUsageDate: null,
            totalDaysUsed: 0,
            milestones: {},
            achievements: []
        };
    }

    static updateUsageStreak() {
        const today = new Date().toDateString();
        const streakData = this.loadStreaksAndMilestones();
        
        // If used today, no need to update
        if (streakData.lastUsageDate === today) {
            return streakData;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toDateString();
        
        if (streakData.lastUsageDate === yesterdayString) {
            // Continue streak
            streakData.currentStreak += 1;
        } else if (streakData.lastUsageDate === null || streakData.lastUsageDate !== today) {
            // Start new streak or reset
            streakData.currentStreak = 1;
        }
        
        // Update data
        streakData.lastUsageDate = today;
        streakData.totalDaysUsed += 1;
        streakData.longestStreak = Math.max(streakData.longestStreak, streakData.currentStreak);
        
        // Check for milestones
        this.checkMilestones(streakData);
        
        this.saveStreaksAndMilestones(streakData);
        return streakData;
    }

    static checkMilestones(streakData) {
        const milestones = [
            { type: 'streak', value: 3, name: 'Getting Started', description: '3 days in a row!' },
            { type: 'streak', value: 7, name: 'Week Warrior', description: '7 days streak!' },
            { type: 'streak', value: 14, name: 'Fortnight Fighter', description: '2 weeks streak!' },
            { type: 'streak', value: 30, name: 'Monthly Master', description: '30 days streak!' },
            { type: 'questions', value: 50, name: 'Half Century', description: '50 questions generated!' },
            { type: 'questions', value: 100, name: 'Centurion', description: '100 questions generated!' },
            { type: 'questions', value: 500, name: 'Math Machine', description: '500 questions generated!' },
            { type: 'topics', value: 10, name: 'Topic Explorer', description: '10 different topics!' },
            { type: 'topics', value: 25, name: 'Subject Master', description: '25 different topics!' }
        ];
        
        const stats = this.loadStats();
        
        milestones.forEach(milestone => {
            const key = `${milestone.type}_${milestone.value}`;
            if (!streakData.milestones[key]) {
                let achieved = false;
                
                switch (milestone.type) {
                    case 'streak':
                        achieved = streakData.currentStreak >= milestone.value;
                        break;
                    case 'questions':
                        achieved = stats.totalQuestions >= milestone.value;
                        break;
                    case 'topics':
                        achieved = Object.keys(stats.favoriteTopics).length >= milestone.value;
                        break;
                }
                
                if (achieved) {
                    streakData.milestones[key] = {
                        ...milestone,
                        achievedDate: new Date().toISOString(),
                        isNew: true
                    };
                    streakData.achievements.push(key);
                }
            }
        });
    }

    static getNewAchievements() {
        const streakData = this.loadStreaksAndMilestones();
        const newAchievements = Object.values(streakData.milestones)
            .filter(milestone => milestone.isNew);
        
        // Mark as seen
        Object.keys(streakData.milestones).forEach(key => {
            if (streakData.milestones[key].isNew) {
                streakData.milestones[key].isNew = false;
            }
        });
        this.saveStreaksAndMilestones(streakData);
        
        return newAchievements;
    }

    // Phase 4: Topic Categorization System
    static categorizeTopicByKeywords(topic) {
        if (!topic || typeof topic !== 'string') return 'General';
        
        const topicLower = topic.toLowerCase();
        
        const categories = {
            'Algebra': [
                'algebra', 'equation', 'linear', 'quadratic', 'polynomial', 'variable', 'expression', 
                'solve', 'factor', 'expand', 'simplify', 'inequalities', 'systems', 'matrix', 'matrices'
            ],
            'Geometry': [
                'geometry', 'triangle', 'circle', 'rectangle', 'square', 'polygon', 'angle', 'perimeter', 
                'area', 'volume', 'circumference', 'radius', 'diameter', 'coordinate', 'point', 'line',
                'parallel', 'perpendicular', 'congruent', 'similar', 'theorem', 'proof'
            ],
            'Calculus': [
                'calculus', 'derivative', 'integral', 'limit', 'differential', 'integration', 'differentiation',
                'slope', 'tangent', 'rate', 'optimization', 'maximum', 'minimum', 'curve', 'function'
            ],
            'Trigonometry': [
                'trigonometry', 'sin', 'cos', 'tan', 'sine', 'cosine', 'tangent', 'angle', 'radian', 
                'degree', 'amplitude', 'period', 'frequency', 'wave', 'oscillation'
            ],
            'Statistics': [
                'statistics', 'probability', 'data', 'mean', 'median', 'mode', 'standard deviation',
                'variance', 'distribution', 'sample', 'population', 'regression', 'correlation',
                'hypothesis', 'confidence', 'interval'
            ],
            'Number Theory': [
                'number', 'prime', 'composite', 'factor', 'multiple', 'divisible', 'modular', 'gcd', 
                'lcm', 'fibonacci', 'sequence', 'series', 'arithmetic', 'geometric'
            ],
            'Complex Numbers': [
                'complex', 'imaginary', 'real', 'conjugate', 'modulus', 'argument', 'polar', 'exponential'
            ]
        };
        
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => topicLower.includes(keyword))) {
                return category;
            }
        }
        
        return 'General';
    }

    static getCategoryColor(category) {
        const colors = {
            'Algebra': '#3b82f6',      // Blue
            'Geometry': '#10b981',     // Green  
            'Calculus': '#f59e0b',     // Orange
            'Trigonometry': '#8b5cf6', // Purple
            'Statistics': '#ef4444',   // Red
            'Number Theory': '#06b6d4', // Cyan
            'Complex Numbers': '#ec4899', // Pink
            'General': '#6b7280'       // Gray
        };
        return colors[category] || colors['General'];
    }

    static getCategoryIcon(category) {
        const icons = {
            'Algebra': '🔢',
            'Geometry': '📐',
            'Calculus': '📈',
            'Trigonometry': '📊',
            'Statistics': '📋',
            'Number Theory': '🔱',
            'Complex Numbers': '🔮',
            'General': '📚'
        };
        return icons[category] || icons['General'];
    }
}