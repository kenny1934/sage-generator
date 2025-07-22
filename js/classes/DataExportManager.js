/**
 * SAGE - Data Export/Import Manager
 * Handles export and import of user data including preferences, history, favorites, and stats
 */

class DataExportManager {
    static getAllUserData() {
        const data = {
            exportTimestamp: new Date().toISOString(),
            exportVersion: '4.2',
            data: {
                preferences: DataManager.loadPreferences(),
                history: DataManager.loadHistory(),
                favorites: DataManager.loadFavorites(),
                stats: DataManager.loadStats(),
                streaks: DataManager.loadStreaksAndMilestones(),
                theme: localStorage.getItem(CONFIG.THEME_KEY),
                cache: QuestionCache.loadCache()
            }
        };
        return data;
    }

    static exportData() {
        try {
            const data = this.getAllUserData();
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sage-data-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNetworkMessage('Data exported successfully!', 'success');
            console.log('User data exported successfully');
        } catch (error) {
            console.error('Error exporting data:', error);
            showNetworkMessage('Error exporting data. Please try again.', 'error');
        }
    }

    static importData(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                this.validateAndImportData(importedData);
            } catch (error) {
                console.error('Error parsing import file:', error);
                showNetworkMessage('Invalid file format. Please select a valid SAGE export file.', 'error');
            }
        };
        reader.readAsText(file);
    }

    static validateAndImportData(importedData) {
        try {
            // Basic validation
            if (!importedData.data || typeof importedData.data !== 'object') {
                throw new Error('Invalid data structure');
            }

            const confirmed = confirm(
                'This will replace all your current data including preferences, history, favourites, and stats. ' +
                'Are you sure you want to continue?\n\n' +
                `Import file created: ${importedData.exportTimestamp || 'Unknown date'}`
            );

            if (!confirmed) return;

            // Import each data type
            const { data } = importedData;
            
            if (data.preferences) {
                localStorage.setItem(CONFIG.PREFERENCES_KEY, JSON.stringify(data.preferences));
            }
            
            if (data.history) {
                localStorage.setItem(CONFIG.HISTORY_KEY, JSON.stringify(data.history));
            }
            
            if (data.favorites) {
                localStorage.setItem(CONFIG.FAVORITES_KEY, JSON.stringify(data.favorites));
            }
            
            if (data.stats) {
                localStorage.setItem(CONFIG.STATS_KEY, JSON.stringify(data.stats));
            }
            
            if (data.streaks) {
                localStorage.setItem(CONFIG.STREAKS_KEY, JSON.stringify(data.streaks));
            }
            
            if (data.theme) {
                localStorage.setItem(CONFIG.THEME_KEY, data.theme);
            }
            
            if (data.cache) {
                localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(data.cache));
            }

            showNetworkMessage('Data imported successfully! Refreshing page...', 'success');
            
            // Refresh the page to reload all data
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('Error importing data:', error);
            showNetworkMessage('Error importing data. Please check the file format.', 'error');
        }
    }

    static clearAllData() {
        const confirmed = confirm(
            'This will permanently delete ALL your data including:\n' +
            '• User preferences\n' +
            '• Question history\n' +
            '• Favorite questions\n' +
            '• Usage statistics\n' +
            '• Achievement streaks\n' +
            '• Cached questions\n\n' +
            'This action cannot be undone. Are you absolutely sure?'
        );

        if (!confirmed) return;

        const doubleConfirm = confirm('Last chance! This will delete everything. Continue?');
        if (!doubleConfirm) return;

        try {
            // Clear all localStorage data except API key
            const apiKey = localStorage.getItem(CONFIG.STORAGE_KEY);
            
            localStorage.removeItem(CONFIG.PREFERENCES_KEY);
            localStorage.removeItem(CONFIG.HISTORY_KEY);
            localStorage.removeItem(CONFIG.FAVORITES_KEY);
            localStorage.removeItem(CONFIG.STATS_KEY);
            localStorage.removeItem(CONFIG.STREAKS_KEY);
            localStorage.removeItem(CONFIG.THEME_KEY);
            localStorage.removeItem(CONFIG.CACHE_KEY);
            
            showNetworkMessage('All data cleared successfully! Refreshing page...', 'success');
            
            // Refresh the page
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('Error clearing data:', error);
            showNetworkMessage('Error clearing data. Please try again.', 'error');
        }
    }

    static getDataSummary() {
        const data = this.getAllUserData().data;
        return {
            preferences: Object.keys(data.preferences || {}).length,
            history: (data.history || []).length,
            favorites: (data.favorites || []).length,
            stats: data.stats ? 1 : 0,
            streaks: data.streaks ? 1 : 0,
            cache: Object.keys(data.cache || {}).length
        };
    }
}