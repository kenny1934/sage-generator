/**
 * SAGE - Cost Tracking and Usage Analytics
 * Handles cost estimation, usage tracking, and analytics for Gemini 2.5 models
 */

class CostTracker {
    constructor() {
        this.storageKey = CONFIG.COST_TRACKING_KEY;
        this.usageKey = CONFIG.USAGE_STATS_KEY;
        this.initializeStorage();
    }

    initializeStorage() {
        // Initialize cost tracking data if not exists
        if (!localStorage.getItem(this.storageKey)) {
            const initialData = {
                totalCost: 0,
                monthlyBudget: 5.00, // Default $5/month
                currentMonth: new Date().getMonth(),
                currentYear: new Date().getFullYear(),
                monthlyCost: 0,
                lastResetDate: new Date().toISOString()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(initialData));
        }

        // Initialize usage statistics if not exists
        if (!localStorage.getItem(this.usageKey)) {
            const initialUsage = {
                totalRequests: 0,
                totalTokensInput: 0,
                totalTokensOutput: 0,
                modelUsage: {
                    'flash-lite': { requests: 0, inputTokens: 0, outputTokens: 0, cost: 0 },
                    'flash': { requests: 0, inputTokens: 0, outputTokens: 0, cost: 0 },
                    'pro': { requests: 0, inputTokens: 0, outputTokens: 0, cost: 0 }
                },
                monthlyUsage: [],
                lastRequest: null
            };
            localStorage.setItem(this.usageKey, JSON.stringify(initialUsage));
        }

        this.checkMonthlyReset();
    }

    checkMonthlyReset() {
        const costData = this.getCostData();
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        if (costData.currentMonth !== currentMonth || costData.currentYear !== currentYear) {
            // Reset monthly cost for new month
            costData.monthlyCost = 0;
            costData.currentMonth = currentMonth;
            costData.currentYear = currentYear;
            costData.lastResetDate = new Date().toISOString();
            this.saveCostData(costData);
        }
    }

    getCostData() {
        return JSON.parse(localStorage.getItem(this.storageKey));
    }

    saveCostData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    getUsageData() {
        return JSON.parse(localStorage.getItem(this.usageKey));
    }

    saveUsageData(data) {
        localStorage.setItem(this.usageKey, JSON.stringify(data));
    }

    // Estimate token count for input text (rough approximation)
    estimateTokens(text) {
        // Rough estimate: 1 token ≈ 4 characters for English text
        // For mathematical content, we'll be slightly more conservative
        return Math.ceil(text.length / 3.5);
    }

    // Estimate cost for a request before making it
    estimateCost(inputText, modelKey = CONFIG.DEFAULT_MODEL, outputTokens = 500) {
        const model = GEMINI_MODELS[modelKey];
        if (!model) return 0;

        const inputTokens = this.estimateTokens(inputText);
        const inputCost = (inputTokens / 1000000) * model.pricing.input;
        const outputCost = (outputTokens / 1000000) * model.pricing.output;

        return {
            inputTokens,
            outputTokens,
            inputCost,
            outputCost,
            totalCost: inputCost + outputCost,
            model: model.name
        };
    }

    // Record actual usage after API call
    recordUsage(modelKey, inputTokens, outputTokens, actualCost = null) {
        const model = GEMINI_MODELS[modelKey];
        if (!model) return;

        // Calculate cost if not provided
        const cost = actualCost || this.calculateCost(modelKey, inputTokens, outputTokens);

        // Update cost tracking
        const costData = this.getCostData();
        costData.totalCost += cost;
        costData.monthlyCost += cost;
        this.saveCostData(costData);

        // Update usage statistics
        const usageData = this.getUsageData();
        usageData.totalRequests++;
        usageData.totalTokensInput += inputTokens;
        usageData.totalTokensOutput += outputTokens;

        // Update model-specific usage
        if (!usageData.modelUsage[modelKey]) {
            usageData.modelUsage[modelKey] = { requests: 0, inputTokens: 0, outputTokens: 0, cost: 0 };
        }

        usageData.modelUsage[modelKey].requests++;
        usageData.modelUsage[modelKey].inputTokens += inputTokens;
        usageData.modelUsage[modelKey].outputTokens += outputTokens;
        usageData.modelUsage[modelKey].cost += cost;

        usageData.lastRequest = new Date().toISOString();
        this.saveUsageData(usageData);

        return cost;
    }

    calculateCost(modelKey, inputTokens, outputTokens) {
        const model = GEMINI_MODELS[modelKey];
        if (!model) return 0;

        const inputCost = (inputTokens / 1000000) * model.pricing.input;
        const outputCost = (outputTokens / 1000000) * model.pricing.output;
        return inputCost + outputCost;
    }

    // Get current budget status
    getBudgetStatus() {
        const costData = this.getCostData();
        const remainingBudget = costData.monthlyBudget - costData.monthlyCost;
        const percentUsed = (costData.monthlyCost / costData.monthlyBudget) * 100;

        return {
            monthlyBudget: costData.monthlyBudget,
            monthlyCost: costData.monthlyCost,
            remainingBudget,
            percentUsed,
            isOverBudget: costData.monthlyCost > costData.monthlyBudget
        };
    }

    // Update monthly budget
    updateBudget(newBudget) {
        const costData = this.getCostData();
        costData.monthlyBudget = Math.max(0.01, parseFloat(newBudget));
        this.saveCostData(costData);
    }

    // Get usage statistics
    getUsageStatistics() {
        const usageData = this.getUsageData();
        const costData = this.getCostData();

        return {
            totalRequests: usageData.totalRequests,
            totalTokensInput: usageData.totalTokensInput,
            totalTokensOutput: usageData.totalTokensOutput,
            totalCost: costData.totalCost,
            monthlyCost: costData.monthlyCost,
            modelBreakdown: usageData.modelUsage,
            lastRequest: usageData.lastRequest
        };
    }

    // Get cost recommendation for different models
    getModelRecommendation(inputText, difficulty = 'intermediate') {
        const estimates = {};
        const outputTokensEstimate = this.estimateOutputTokens(difficulty);

        Object.keys(GEMINI_MODELS).forEach(modelKey => {
            const model = GEMINI_MODELS[modelKey];
            estimates[modelKey] = {
                ...this.estimateCost(inputText, modelKey, outputTokensEstimate),
                recommended: model.recommended.includes(difficulty.toLowerCase())
            };
        });

        return estimates;
    }

    estimateOutputTokens(difficulty) {
        const estimates = {
            'basic': 300,
            'intermediate': 500,
            'advanced': 800
        };
        return estimates[difficulty.toLowerCase()] || 500;
    }

    // Export usage data
    exportUsageData() {
        return {
            costData: this.getCostData(),
            usageData: this.getUsageData(),
            exportDate: new Date().toISOString()
        };
    }

    // Reset all data (with confirmation)
    resetAllData() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.usageKey);
        this.initializeStorage();
    }

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 4,
            maximumFractionDigits: 6
        }).format(amount);
    }

    // Format large numbers
    formatNumber(number) {
        return new Intl.NumberFormat('en-US').format(number);
    }
}

// Global cost tracker instance with error handling
try {
    window.costTracker = new CostTracker();
    console.log('✅ CostTracker initialized successfully');
} catch (error) {
    console.error('❌ Failed to initialize CostTracker:', error);
    // Create a minimal fallback to prevent errors
    window.costTracker = {
        getBudgetStatus: () => ({ monthlyBudget: 5, monthlyCost: 0, remainingBudget: 5, percentUsed: 0, isOverBudget: false }),
        getUsageStatistics: () => ({ totalRequests: 0, totalTokensInput: 0, totalTokensOutput: 0, totalCost: 0, monthlyCost: 0, modelBreakdown: {}, lastRequest: null }),
        formatCurrency: (amount) => `$${amount.toFixed(4)}`,
        updateBudget: () => {},
        resetAllData: () => {},
        exportUsageData: () => ({})
    };
}