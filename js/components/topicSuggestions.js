/**
 * SAGE - Topic Suggestions Component
 * Autocomplete, recent topics, recommendations, and topic selection functionality
 */

// Example topics data
const exampleTopics = [
    "Linear equations for Grade 9",
    "Quadratic functions for Form 4", 
    "Trigonometry basics for Grade 10",
    "Calculus derivatives for Form 6",
    "Geometry proofs for Grade 8",
    "Statistics and probability for Form 5",
    "Algebraic expressions for Grade 7",
    "Circle theorems for Form 3",
    "Logarithms for Grade 11",
    "Complex numbers for Form 6",
    "Vectors for Grade 12",
    "Integration for A-Level"
];

// Math topic suggestions for autocomplete
const mathTopicSuggestions = [
    "Linear equations",
    "Quadratic equations", 
    "Exponential functions",
    "Logarithmic functions",
    "Trigonometric functions",
    "Polynomial functions",
    "Rational functions",
    "Systems of equations",
    "Inequalities",
    "Sequences and series",
    "Matrices",
    "Vectors",
    "Complex numbers",
    "Limits",
    "Derivatives",
    "Integration",
    "Differential equations",
    "Statistics",
    "Probability",
    "Combinatorics",
    "Number theory",
    "Geometry",
    "Circle theorems",
    "Triangle properties",
    "Coordinate geometry",
    "Transformations",
    "Similarity and congruence",
    "Area and volume",
    "Pythagoras theorem"
];

// Phase 3: Add recently used topics section
function addRecentTopicsSection() {
    const recentTopics = DataManager.getRecentTopics(6);
    
    if (recentTopics.length === 0) return;
    
    const container = document.querySelector('.main-container');
    const topicInputContainer = document.getElementById('mathTopic').parentElement;
    
    console.log('Adding recent topics section...');
    console.log('Container found:', !!container);
    console.log('Topic input container found:', !!topicInputContainer);
    
    const recentSection = document.createElement('div');
    recentSection.className = 'mb-6';
    recentSection.innerHTML = `
        <label class="recent-topics-label">
            📚 Recently Used Topics
        </label>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-bottom: 1rem;" id="recentTopicsGrid">
            ${recentTopics.map((item, index) => `
                <button type="button" 
                        class="recent-topic-btn"
                        onclick="selectRecentTopic('${item.topic.replace(/'/g, "\\'").replace(/"/g, '&quot;')}', '${item.difficulty}')"
                        title="Last used: ${item.lastUsed}">
                    <div class="recent-topic-title">${item.topic}</div>
                    <div class="recent-topic-meta">${item.difficulty} • ${item.lastUsed}</div>
                </button>
            `).join('')}
        </div>
    `;
    
    // Safer insertion: insert after the topic input container
    try {
        if (topicInputContainer && topicInputContainer.parentElement === container) {
            // Insert after the topic input container
            topicInputContainer.insertAdjacentElement('afterend', recentSection);
            console.log('Recent topics section added successfully');
        } else {
            // Fallback: insert before footer to maintain proper order
            console.log('Using fallback insertion method');
            const footer = container.querySelector('.footer') || container.querySelector('footer');
            if (footer) {
                container.insertBefore(recentSection, footer);
            } else {
                container.appendChild(recentSection);
            }
        }
    } catch (error) {
        console.error('Error adding recent topics section:', error);
    }
}

// Phase 3: Select a recent topic
function selectRecentTopic(topic, difficulty) {
    const mathTopicInput = document.getElementById('mathTopic');
    const difficultySelect = document.getElementById('difficulty');
    
    if (mathTopicInput) mathTopicInput.value = topic;
    if (difficultySelect) difficultySelect.value = difficulty;
    if (mathTopicInput) mathTopicInput.focus();
    
    // Provide feedback
    displayMessage(`Selected: ${topic} (${difficulty})`, 'text-green-400');
}

// Phase 3: Add topic recommendations section
function addTopicRecommendationsSection() {
    const currentTopic = document.getElementById('mathTopic')?.value.trim() || '';
    const recommendations = TopicRecommendationEngine.getTopicRecommendations(currentTopic, 4);
    
    if (recommendations.length === 0) return;
    
    const container = document.querySelector('.main-container');
    const recentSection = document.getElementById('recentTopicsSection') || document.getElementById('mathTopic')?.parentElement;
    
    if (!container || !recentSection) return;
    
    // Remove existing recommendations section
    const existingRecommendations = document.getElementById('recommendationsSection');
    if (existingRecommendations) {
        existingRecommendations.remove();
    }
    
    const recommendationsSection = document.createElement('div');
    recommendationsSection.id = 'recommendationsSection';
    recommendationsSection.className = 'mb-6';
    recommendationsSection.innerHTML = `
        <label class="recommendation-topics-label">
            💡 Recommended Topics for You
        </label>
        <div style="display: grid; grid-template-columns: 1fr; gap: 1rem; margin-bottom: 1rem;">
            ${recommendations.map((item, index) => `
                <button type="button" 
                        class="recommendation-btn"
                        onclick="selectRecommendedTopic('${item.topic.replace(/'/g, "\\'").replace(/"/g, '&quot;')}', '${item.difficulty}')"
                        title="${item.reason}">
                    <div class="flex items-center gap-2 mb-2">
                        <div class="recommendation-title flex-1">${item.topic}</div>
                        ${createCategoryTag(item.topic)}
                    </div>
                    <div class="recommendation-meta">
                        <span class="recommendation-difficulty">${item.difficulty}</span>
                        <span class="recommendation-reason">${item.reason}</span>
                    </div>
                </button>
            `).join('')}
        </div>
    `;
    
    // Safer insertion after recent topics section if it exists
    try {
        if (document.getElementById('recentTopicsSection')) {
            const recentTopicsSection = document.getElementById('recentTopicsSection');
            recentTopicsSection.insertAdjacentElement('afterend', recommendationsSection);
            console.log('Topic recommendations added after recent topics');
        } else {
            // Fallback: insert before footer to maintain proper order
            console.log('Using fallback: inserting recommendations before footer');
            const footer = container.querySelector('.footer') || container.querySelector('footer');
            if (footer) {
                container.insertBefore(recommendationsSection, footer);
            } else {
                container.appendChild(recommendationsSection);
            }
        }
    } catch (error) {
        console.error('Error adding topic recommendations section:', error);
        // Final fallback - insert before footer
        const footer = container.querySelector('.footer') || container.querySelector('footer');
        if (footer) {
            container.insertBefore(recommendationsSection, footer);
        } else {
            container.appendChild(recommendationsSection);
        }
    }
    
    console.log('Topic recommendations section update completed');
}

// Phase 3: Select a recommended topic
function selectRecommendedTopic(topic, difficulty) {
    const mathTopicInput = document.getElementById('mathTopic');
    const difficultySelect = document.getElementById('difficulty');
    
    if (mathTopicInput) mathTopicInput.value = topic;
    if (difficultySelect) difficultySelect.value = difficulty;
    if (mathTopicInput) mathTopicInput.focus();
    
    // Provide feedback
    displayMessage(`Selected recommendation: ${topic} (${difficulty})`, 'text-blue-400');
    
    // Update recommendations based on new topic
    setTimeout(() => {
        console.log('Updating recommendations section...');
        addTopicRecommendationsSection();
        
        // Wait for DOM to update, then reposition dashboard
        setTimeout(() => {
            console.log('Repositioning dashboard after recommendations update...');
            addStatsDashboard();
        }, 100);
    }, 500);
}

// Phase 3: Update recent topics display
function updateRecentTopicsDisplay() {
    const recentTopicsGrid = document.getElementById('recentTopicsGrid');
    if (!recentTopicsGrid) return;
    
    const recentTopics = DataManager.getRecentTopics(6);
    
    if (recentTopics.length === 0) {
        recentTopicsGrid.parentElement.style.display = 'none';
        return;
    }
    
    recentTopicsGrid.innerHTML = recentTopics.map((item, index) => `
        <button type="button" 
                class="recent-topic-btn"
                onclick="selectRecentTopic('${item.topic.replace(/'/g, "\\'").replace(/"/g, '&quot;')}', '${item.difficulty}')"
                title="Last used: ${item.lastUsed}">
            <div class="recent-topic-title">${item.topic}</div>
            <div class="recent-topic-meta">${item.difficulty} • ${item.lastUsed}</div>
        </button>
    `).join('');
    
    recentTopicsGrid.parentElement.style.display = 'block';
}

// Smart input features: autocomplete
function setupAutocomplete() {
    const dropdown = document.getElementById('autocompleteDropdown');
    const mathTopicInput = document.getElementById('mathTopic');
    let selectedIndex = -1;
    
    if (!dropdown || !mathTopicInput) {
        console.error('Autocomplete elements not found');
        return;
    }
    
    mathTopicInput.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase();
        if (value.length < 2) {
            hideAutocomplete();
            return;
        }
        
        const matches = mathTopicSuggestions.filter(suggestion => 
            suggestion.toLowerCase().includes(value)
        ).slice(0, 8); // Limit to 8 suggestions
        
        if (matches.length > 0) {
            showAutocomplete(matches);
        } else {
            hideAutocomplete();
        }
        selectedIndex = -1;
    });
    
    mathTopicInput.addEventListener('keydown', (e) => {
        const items = dropdown.querySelectorAll('.autocomplete-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection(items);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            selectSuggestion(items[selectedIndex].textContent);
        } else if (e.key === 'Escape') {
            hideAutocomplete();
        }
    });
    
    // Hide autocomplete when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.autocomplete-container')) {
            hideAutocomplete();
        }
    });
    
    function showAutocomplete(suggestions) {
        dropdown.innerHTML = '';
        suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.textContent = suggestion;
            item.addEventListener('click', () => selectSuggestion(suggestion));
            dropdown.appendChild(item);
        });
        dropdown.style.display = 'block';
    }
    
    function hideAutocomplete() {
        dropdown.style.display = 'none';
        selectedIndex = -1;
    }
    
    function updateSelection(items) {
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === selectedIndex);
        });
    }
    
    function selectSuggestion(suggestion) {
        const mathTopicInput = document.getElementById('mathTopic');
        if (mathTopicInput) {
            const currentValue = mathTopicInput.value;
            const words = currentValue.split(' ');
            words[words.length - 1] = suggestion;
            mathTopicInput.value = words.join(' ') + ' ';
            hideAutocomplete();
            mathTopicInput.focus();
        }
    }
}

// Setup difficulty descriptions
function setupDifficultyDescriptions() {
    const difficultyDescriptions = {
        'Easy': 'Simple problems with basic concepts and clear solutions',
        'Medium': 'Moderate complexity with step-by-step explanations',
        'Hard': 'Advanced problems requiring deeper mathematical understanding',
        'Challenging': 'Complex multi-step problems for advanced learners'
    };
    
    const descriptionElement = document.getElementById('difficultyDescription');
    
    if (difficultySelect && descriptionElement) {
        difficultySelect.addEventListener('change', (e) => {
            const selectedDifficulty = e.target.value;
            descriptionElement.textContent = difficultyDescriptions[selectedDifficulty] || 
                difficultyDescriptions['Medium'];
        });
    }
}

// Initialize smart input features
function initializeSmartInput() {
    setupAutocomplete();
    setupDifficultyDescriptions();
}