/**
 * SAGE - Topic Recommendation Engine
 * Provides intelligent topic suggestions based on user behavior and preferences
 */

class TopicRecommendationEngine {
    static getTopicRecommendations(currentTopic = '', limit = 4) {
        const stats = DataManager.loadStats();
        const history = DataManager.loadHistory();
        const preferences = DataManager.loadPreferences();
        
        // Base topic suggestions organized by category
        const topicDatabase = {
            algebra: [
                "Linear equations for Grade 9",
                "Quadratic equations for Form 4", 
                "Systems of equations for Grade 10",
                "Polynomial operations for Form 5",
                "Factoring techniques for Grade 9",
                "Inequalities for Grade 10"
            ],
            geometry: [
                "Circle theorems for Form 3",
                "Triangle properties for Grade 8",
                "Area and perimeter for Grade 7",
                "3D shapes and volumes for Form 4",
                "Coordinate geometry for Grade 10",
                "Trigonometry basics for Form 4"
            ],
            calculus: [
                "Limits and continuity for Form 6",
                "Derivatives for A-Level",
                "Integration for Form 6",
                "Applications of calculus for Grade 12",
                "Differential equations for A-Level"
            ],
            statistics: [
                "Data analysis for Grade 9",
                "Probability for Form 5",
                "Normal distribution for A-Level",
                "Hypothesis testing for Grade 12",
                "Regression analysis for Form 6"
            ],
            advanced: [
                "Complex numbers for Form 6",
                "Vectors for Grade 12",
                "Matrices for A-Level",
                "Sequences and series for Form 5",
                "Logarithms for Grade 11"
            ]
        };
        
        let recommendations = [];
        
        // 1. Analyze current topic to suggest related topics
        if (currentTopic) {
            const category = this.categorizeTopic(currentTopic);
            if (category && topicDatabase[category]) {
                recommendations.push(...topicDatabase[category]
                    .filter(topic => !topic.toLowerCase().includes(currentTopic.toLowerCase().split(' ')[0]))
                    .slice(0, 2));
            }
        }
        
        // 2. Suggest topics based on user's favorite subjects
        const favoriteTopics = Object.entries(stats.favoriteTopics || {})
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([topic]) => topic);
        
        favoriteTopics.forEach(favTopic => {
            const category = this.categorizeTopic(favTopic);
            if (category && topicDatabase[category]) {
                recommendations.push(...topicDatabase[category]
                    .filter(topic => !recommendations.includes(topic))
                    .slice(0, 1));
            }
        });
        
        // 3. Progressive difficulty suggestions
        const userPreferredDifficulty = preferences.preferredDifficulty || 'Medium';
        const nextLevel = this.getNextDifficultyLevel(userPreferredDifficulty);
        
        // 4. Fill remaining slots with popular topics
        const popularTopics = [
            "Linear equations for Grade 9",
            "Quadratic functions for Form 4",
            "Circle theorems for Form 3",
            "Trigonometry basics for Grade 10",
            "Probability for Form 5",
            "Derivatives for Form 6"
        ].filter(topic => !recommendations.includes(topic));
        
        recommendations.push(...popularTopics);
        
        // Remove duplicates and limit results
        recommendations = [...new Set(recommendations)].slice(0, limit);
        
        return recommendations.map(topic => ({
            topic,
            difficulty: this.suggestDifficulty(topic, userPreferredDifficulty),
            reason: this.getRecommendationReason(topic, currentTopic, favoriteTopics)
        }));
    }
    
    static categorizeTopic(topic) {
        const topicLower = topic.toLowerCase();
        if (topicLower.includes('algebra') || topicLower.includes('equation') || topicLower.includes('polynomial')) return 'algebra';
        if (topicLower.includes('geometry') || topicLower.includes('triangle') || topicLower.includes('circle') || topicLower.includes('area')) return 'geometry';
        if (topicLower.includes('calculus') || topicLower.includes('derivative') || topicLower.includes('integral') || topicLower.includes('limit')) return 'calculus';
        if (topicLower.includes('statistic') || topicLower.includes('probability') || topicLower.includes('data')) return 'statistics';
        if (topicLower.includes('complex') || topicLower.includes('vector') || topicLower.includes('matrix')) return 'advanced';
        return 'algebra'; // default category
    }
    
    static getNextDifficultyLevel(currentLevel) {
        const levels = ['Easy', 'Medium', 'Hard', 'Challenging'];
        const currentIndex = levels.indexOf(currentLevel);
        return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : currentLevel;
    }
    
    static suggestDifficulty(topic, userPreferred) {
        // Suggest appropriate difficulty based on topic complexity
        if (topic.includes('Grade 7') || topic.includes('Grade 8')) return 'Easy';
        if (topic.includes('Form 6') || topic.includes('A-Level') || topic.includes('Grade 12')) return 'Hard';
        return userPreferred;
    }
    
    static getRecommendationReason(topic, currentTopic, favoriteTopics) {
        if (currentTopic && this.categorizeTopic(topic) === this.categorizeTopic(currentTopic)) {
            return 'Related to current topic';
        }
        if (favoriteTopics.some(fav => this.categorizeTopic(topic) === this.categorizeTopic(fav))) {
            return 'Based on your interests';
        }
        return 'Popular topic';
    }
}