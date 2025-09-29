/**
 * SAGE - Statistics Display Component
 * Dashboard creation, stats updates, and achievement notifications
 */

// Phase 3: Add stats dashboard
function addStatsDashboard() {
    console.log('Adding stats dashboard...');
    
    const container = document.querySelector('.config-panel');
    
    console.log('Config panel container found:', !!container);
    
    if (!container) {
        console.error('Config panel container not found for stats dashboard');
        return;
    }
    
    const statsSection = document.createElement('div');
    statsSection.className = 'mt-8 p-4 rounded-lg border';
    statsSection.style.background = 'var(--surface)';
    statsSection.style.borderColor = 'var(--border-color)';
    statsSection.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold flex items-center gap-2" style="color: var(--text-primary);">
                📊 Your Progress
            </h3>
            <button type="button" 
                    class="text-xs transition-colors"
                    style="color: var(--text-secondary);"
                    onmouseover="this.style.color='var(--text-primary)'" 
                    onmouseout="this.style.color='var(--text-secondary)'"
                    onclick="toggleStatsDetails()"
                    id="statsToggleBtn">
                Show Details
            </button>
        </div>
        <div id="statsOverview" class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div class="stats-item">
                <div class="text-2xl font-bold" style="color: var(--accent);" id="totalQuestions">0</div>
                <div class="text-xs" style="color: var(--text-secondary);">Questions Generated</div>
            </div>
            <div class="stats-item">
                <div class="text-2xl font-bold" style="color: var(--accent);" id="totalSessions">0</div>
                <div class="text-xs" style="color: var(--text-secondary);">Study Sessions</div>
            </div>
            <div class="stats-item">
                <div class="text-2xl font-bold" style="color: var(--accent);" id="topicsExplored">0</div>
                <div class="text-xs" style="color: var(--text-secondary);">Topics Explored</div>
            </div>
            <div class="stats-item">
                <div class="text-2xl font-bold text-orange-400" id="currentStreak">0</div>
                <div class="text-xs" style="color: var(--text-secondary);">Day Streak 🔥</div>
            </div>
        </div>
        <div id="statsDetails" class="mt-4 space-y-3 hidden">
            <div id="favoriteTopicsSection"></div>
            <div id="difficultyDistributionSection"></div>
            <div id="streakDetailsSection"></div>
        </div>
        
    `;
    
    // Create Data Management section that will be added below stats
    const dataManagementSection = document.createElement('div');
    dataManagementSection.id = 'dataManagementContainer';
    dataManagementSection.className = 'mt-6 p-4 rounded-lg border';
    dataManagementSection.style.background = 'var(--surface)';
    dataManagementSection.style.borderColor = 'var(--border-color)';
    dataManagementSection.innerHTML = `
        <h3 class="text-lg font-semibold mb-3 flex items-center gap-2" style="color: var(--text-primary);">
            🗄️ Data Management
        </h3>
        <div class="flex gap-2 flex-wrap mb-3">
            <button id="exportDataBtn" class="action-btn text-sm px-3 py-2 rounded transition-colors" 
                    style="background: #059669; border: 1px solid #047857; color: white;"
                    onmouseover="this.style.background='#047857'" 
                    onmouseout="this.style.background='#059669'">
                📦 Export All Data
            </button>
            <button id="importDataBtn" class="action-btn text-sm px-3 py-2 rounded transition-colors"
                    style="background: #2563eb; border: 1px solid #1d4ed8; color: white;"
                    onmouseover="this.style.background='#1d4ed8'" 
                    onmouseout="this.style.background='#2563eb'">
                📥 Import Data
            </button>
            <button id="clearDataBtn" class="action-btn text-sm px-3 py-2 rounded transition-colors"
                    style="background: #dc2626; border: 1px solid #b91c1c; color: white;"
                    onmouseover="this.style.background='#b91c1c'" 
                    onmouseout="this.style.background='#dc2626'">
                🗑️ Clear All
            </button>
        </div>
        <input type="file" id="importFileInput" class="hidden" accept=".json">
        <p class="text-xs" style="color: var(--text-secondary);">
            Export your preferences, history, favourites, streaks, and stats for backup or transfer between devices.
        </p>
    `;
    
    try {
        // Always ensure dashboard is positioned at the bottom of the container
        const existingDashboard = container.querySelector('#statsOverview')?.parentElement;
        if (existingDashboard) {
            existingDashboard.remove();
            console.log('Removed existing dashboard to reposition');
        }
        
        // Append stats section to the container
        container.appendChild(statsSection);
        console.log('Stats dashboard added successfully at bottom position');
        
        // Remove existing data management section if it exists
        const existingDataManagement = container.querySelector('#dataManagementContainer');
        if (existingDataManagement) {
            existingDataManagement.remove();
        }
        
        // Add Data Management section after stats
        container.appendChild(dataManagementSection);
        console.log('Data Management section added after stats dashboard');
        
        // Set up event listeners for data management buttons
        const exportDataBtn = document.getElementById('exportDataBtn');
        const importDataBtn = document.getElementById('importDataBtn');
        const clearDataBtn = document.getElementById('clearDataBtn');
        const importFileInput = document.getElementById('importFileInput');
        
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                DataExportManager.exportData();
            });
        }
        
        if (importDataBtn) {
            importDataBtn.addEventListener('click', () => {
                importFileInput.click();
            });
        }
        
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => {
                DataExportManager.clearAllData();
            });
        }
        
        if (importFileInput) {
            importFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    DataExportManager.importData(file);
                    // Reset file input
                    e.target.value = '';
                }
            });
        }
        
    } catch (error) {
        console.error('Error in addStatsDashboard function:', error);
    }
}

// Phase 3: Update stats display
function updateStatsDisplay() {
    const stats = DataManager.loadStats();
    const streakData = DataManager.loadStreaksAndMilestones();
    
    // Update main dashboard stats
    const totalQuestionsEl = document.getElementById('totalQuestions');
    const totalSessionsEl = document.getElementById('totalSessions');
    const topicsExploredEl = document.getElementById('topicsExplored');
    const currentStreakEl = document.getElementById('currentStreak');
    
    if (totalQuestionsEl) {
        totalQuestionsEl.textContent = stats.totalQuestions;
    }
    if (totalSessionsEl) {
        totalSessionsEl.textContent = stats.totalSessions;
    }
    if (topicsExploredEl) {
        topicsExploredEl.textContent = Object.keys(stats.favoriteTopics).length;
    }
    if (currentStreakEl) {
        currentStreakEl.textContent = streakData.currentStreak;
    }
    
    // Update detailed stats if visible (with small delay to ensure DOM is ready)
    setTimeout(() => {
        updateDetailedStats(stats);
        updateStreakDetails(streakData);
    }, 100);
}

// Phase 3: Update detailed stats
function updateDetailedStats(stats) {
    const favoriteTopicsSection = document.getElementById('favoriteTopicsSection');
    const difficultyDistributionSection = document.getElementById('difficultyDistributionSection');
    
    // Only update if both elements exist
    if (!favoriteTopicsSection || !difficultyDistributionSection) {
        console.log('Stats detail elements not found - stats dashboard may not be initialized yet');
        return;
    }
    
    // Favorite topics
    const topTopics = Object.entries(stats.favoriteTopics)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
    
    favoriteTopicsSection.innerHTML = topTopics.length > 0 ? `
        <div class="text-sm font-medium mb-2" style="color: var(--text-primary);">Most Practiced Topics:</div>
        <div class="space-y-1">
            ${topTopics.map(([topic, count]) => `
                <div class="flex justify-between text-xs">
                    <span class="truncate" style="color: var(--text-secondary);">${topic}</span>
                    <span style="color: var(--accent);">${count} times</span>
                </div>
            `).join('')}
        </div>
    ` : '<div class="text-xs" style="color: var(--text-muted);">No topics practiced yet</div>';
    
    // Difficulty distribution
    const difficultyEntries = Object.entries(stats.difficultyDistribution);
    difficultyDistributionSection.innerHTML = difficultyEntries.length > 0 ? `
        <div class="text-sm font-medium mb-2" style="color: var(--text-primary);">Difficulty Breakdown:</div>
        <div class="grid grid-cols-2 gap-2">
            ${difficultyEntries.map(([difficulty, count]) => `
                <div class="flex justify-between text-xs">
                    <span style="color: var(--text-secondary);">${difficulty}:</span>
                    <span style="color: var(--accent);">${count}</span>
                </div>
            `).join('')}
        </div>
    ` : '<div class="text-xs" style="color: var(--text-muted);">No difficulty data yet</div>';
}

// Phase 4: Update streak details
function updateStreakDetails(streakData) {
    const streakDetailsSection = document.getElementById('streakDetailsSection');
    
    if (!streakDetailsSection) {
        console.log('Streak details section not found - stats dashboard may not be initialized yet');
        return;
    }
    
    // Recent achievements
    const recentAchievements = Object.values(streakData.milestones)
        .sort((a, b) => new Date(b.achievedDate) - new Date(a.achievedDate))
        .slice(0, 3);
    
    streakDetailsSection.innerHTML = `
        <div class="text-sm font-medium mb-2" style="color: var(--text-primary);">Streak Stats:</div>
        <div class="grid grid-cols-2 gap-2 mb-3">
            <div class="flex justify-between text-xs">
                <span style="color: var(--text-secondary);">Longest Streak:</span>
                <span class="text-orange-400">${streakData.longestStreak} days</span>
            </div>
            <div class="flex justify-between text-xs">
                <span style="color: var(--text-secondary);">Total Days:</span>
                <span class="text-orange-400">${streakData.totalDaysUsed}</span>
            </div>
        </div>
        ${recentAchievements.length > 0 ? `
            <div class="text-sm font-medium mb-2" style="color: var(--text-primary);">Recent Achievements:</div>
            <div class="space-y-1">
                ${recentAchievements.map(achievement => `
                    <div class="flex items-center justify-between text-xs p-2 rounded" style="background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3);">
                        <span class="font-medium text-yellow-500">🏆 ${achievement.name}</span>
                        <span style="color: var(--text-secondary);">${achievement.description}</span>
                    </div>
                `).join('')}
            </div>
        ` : '<div class="text-xs" style="color: var(--text-muted);">No achievements yet - keep using SAGE!</div>'}
    `;
}

// Phase 3: Toggle stats details
function toggleStatsDetails() {
    const details = document.getElementById('statsDetails');
    const toggleBtn = document.getElementById('statsToggleBtn');
    
    if (details.classList.contains('hidden')) {
        details.classList.remove('hidden');
        toggleBtn.textContent = 'Hide Details';
        updateDetailedStats(DataManager.loadStats());
        updateStreakDetails(DataManager.loadStreaksAndMilestones());
    } else {
        details.classList.add('hidden');
        toggleBtn.textContent = 'Show Details';
    }
}

// Phase 4: Show achievement notifications with celebratory animations
function showAchievementNotifications(achievements) {
    if (achievements.length === 0) return;
    
    // Trigger celebration animation for first achievement
    if (window.celebrationEngine) {
        const intensity = achievements.length > 1 ? 'high' : 'medium';
        window.celebrationEngine.triggerCelebration(intensity);
    }
    
    // Show notifications sequentially
    achievements.forEach((achievement, index) => {
        setTimeout(() => {
            showAchievementNotification(achievement);
        }, index * 1500); // 1.5 seconds between each notification
    });
}

// Individual achievement notification
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-50 max-w-sm p-4 bg-yellow-900/90 border border-yellow-600/50 rounded-lg shadow-lg transform translate-x-full transition-all duration-500';
    
    notification.innerHTML = `
        <div class="flex items-start gap-3">
            <div class="text-2xl">🏆</div>
            <div class="flex-1">
                <h4 class="text-yellow-200 font-bold text-sm mb-1">Achievement Unlocked!</h4>
                <p class="text-yellow-100 font-medium text-sm">${achievement.name}</p>
                <p class="text-yellow-300 text-xs mt-1">${achievement.description}</p>
            </div>
            <button class="text-yellow-400 hover:text-yellow-200 text-lg" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translate(0, 0)';
    }, 100);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translate(100%, 0)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 500);
    }, 5000);
}