/**
 * SAGE - Question Cache System
 * Handles caching of generated questions to improve performance and reduce API calls
 */

class QuestionCache {
    static generateCacheKey(topic, difficulty) {
        if (!topic || !difficulty) return null;
        return `${topic.toLowerCase().trim()}_${difficulty.toLowerCase()}`.replace(/\s+/g, '_');
    }

    static loadCache() {
        try {
            const cacheData = localStorage.getItem(CONFIG.CACHE_KEY);
            return cacheData ? JSON.parse(cacheData) : {};
        } catch (error) {
            console.error('Error loading question cache:', error);
            return {};
        }
    }

    static saveCache(cache) {
        try {
            localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(cache));
        } catch (error) {
            console.error('Error saving question cache:', error);
        }
    }

    static isExpired(timestamp) {
        const expiryTime = CONFIG.CACHE_EXPIRY_HOURS * 60 * 60 * 1000;
        return Date.now() - timestamp > expiryTime;
    }

    static get(topic, difficulty) {
        const cacheKey = this.generateCacheKey(topic, difficulty);
        if (!cacheKey) return null;

        const cache = this.loadCache();
        const entry = cache[cacheKey];

        if (!entry) return null;

        if (this.isExpired(entry.timestamp)) {
            // Remove expired entry
            delete cache[cacheKey];
            this.saveCache(cache);
            return null;
        }

        console.log(`Cache hit for: ${topic} (${difficulty})`);
        return entry.questions;
    }

    static set(topic, difficulty, questions) {
        if (!topic || !difficulty || !questions || !Array.isArray(questions)) return;

        const cacheKey = this.generateCacheKey(topic, difficulty);
        if (!cacheKey) return;

        let cache = this.loadCache();

        // Implement cache size limit
        const cacheKeys = Object.keys(cache);
        if (cacheKeys.length >= CONFIG.MAX_CACHE_SIZE) {
            // Remove oldest entries
            const sortedKeys = cacheKeys.sort((a, b) => cache[a].timestamp - cache[b].timestamp);
            const keysToRemove = sortedKeys.slice(0, cacheKeys.length - CONFIG.MAX_CACHE_SIZE + 1);
            
            keysToRemove.forEach(key => delete cache[key]);
        }

        // Add new entry
        cache[cacheKey] = {
            questions: questions,
            timestamp: Date.now(),
            metadata: {
                topic: topic,
                difficulty: difficulty,
                questionsCount: questions.length
            }
        };

        this.saveCache(cache);
        console.log(`Cached questions for: ${topic} (${difficulty})`);
    }

    static cleanup() {
        const cache = this.loadCache();
        const cleanedCache = {};
        let removedCount = 0;

        Object.keys(cache).forEach(key => {
            if (!this.isExpired(cache[key].timestamp)) {
                cleanedCache[key] = cache[key];
            } else {
                removedCount++;
            }
        });

        if (removedCount > 0) {
            this.saveCache(cleanedCache);
            console.log(`Cleaned up ${removedCount} expired cache entries`);
        }

        return removedCount;
    }

    static getCacheStats() {
        const cache = this.loadCache();
        const entries = Object.values(cache);
        const totalQuestions = entries.reduce((sum, entry) => sum + entry.questions.length, 0);
        const expiredCount = entries.filter(entry => this.isExpired(entry.timestamp)).length;

        return {
            totalEntries: entries.length,
            totalQuestions: totalQuestions,
            expiredEntries: expiredCount,
            activeEntries: entries.length - expiredCount
        };
    }

    static clear() {
        try {
            localStorage.removeItem(CONFIG.CACHE_KEY);
            console.log('Question cache cleared');
        } catch (error) {
            console.error('Error clearing question cache:', error);
        }
    }
}