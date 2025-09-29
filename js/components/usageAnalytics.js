/**
 * SAGE - Usage Analytics Component
 * Displays detailed usage statistics and cost breakdowns
 */

function showUsageAnalytics() {
    if (!window.costTracker) {
        console.error('window.costTracker is not available');
        displayMessage("Cost tracking not available", "text-red-500");
        return;
    }

    const stats = window.costTracker.getUsageStatistics();
    const budgetStatus = window.costTracker.getBudgetStatus();

    const modal = createAnalyticsModal(stats, budgetStatus);
    document.body.appendChild(modal);

    // Animate in
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function createAnalyticsModal(stats, budgetStatus) {
    const modalOverlay = createElementSafe('div', {
        className: 'modal-overlay usage-analytics-modal'
    });

    const modalContent = createElementSafe('div', {
        className: 'modal-content usage-analytics-content'
    });

    // Modal header
    const header = createElementSafe('div', {
        className: 'modal-header'
    });

    const title = createElementSafe('h2', {
        textContent: 'Usage Analytics & Cost Tracking',
        className: 'modal-title'
    });

    const closeBtn = createElementSafe('button', {
        className: 'close-btn',
        textContent: '✕'
    });

    // Add event listener manually (createElementSafe doesn't support onclick for security)
    closeBtn.addEventListener('click', () => closeAnalyticsModal(modalOverlay));

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Modal body
    const body = createElementSafe('div', {
        className: 'modal-body usage-analytics-body'
    });

    // Overview section
    const overview = createOverviewSection(stats, budgetStatus);
    body.appendChild(overview);

    // Budget section
    const budget = createBudgetSection(budgetStatus);
    body.appendChild(budget);

    // Model breakdown section
    const modelBreakdown = createModelBreakdownSection(stats.modelBreakdown);
    body.appendChild(modelBreakdown);

    // Export section
    const exportSection = createExportSection();
    body.appendChild(exportSection);

    modalContent.appendChild(header);
    modalContent.appendChild(body);
    modalOverlay.appendChild(modalContent);

    // Close on overlay click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeAnalyticsModal(modalOverlay);
        }
    });

    // Close on Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeAnalyticsModal(modalOverlay);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

    return modalOverlay;
}

function createOverviewSection(stats, budgetStatus) {
    const section = createElementSafe('div', {
        className: 'analytics-section'
    });

    const sectionTitle = createElementSafe('h3', {
        textContent: 'Overview',
        className: 'section-title'
    });

    const overviewGrid = createElementSafe('div', {
        className: 'analytics-grid'
    });

    const overviewStats = [
        { label: 'Total Requests', value: window.costTracker.formatNumber(stats.totalRequests) },
        { label: 'Input Tokens', value: window.costTracker.formatNumber(stats.totalTokensInput) },
        { label: 'Output Tokens', value: window.costTracker.formatNumber(stats.totalTokensOutput) },
        { label: 'Total Cost', value: window.costTracker.formatCurrency(stats.totalCost) },
        { label: 'Monthly Cost', value: window.costTracker.formatCurrency(stats.monthlyCost) },
        { label: 'Budget Remaining', value: window.costTracker.formatCurrency(budgetStatus.remainingBudget) }
    ];

    overviewStats.forEach(stat => {
        const statCard = createStatCard(stat.label, stat.value);
        overviewGrid.appendChild(statCard);
    });

    section.appendChild(sectionTitle);
    section.appendChild(overviewGrid);

    return section;
}

function createBudgetSection(budgetStatus) {
    const section = createElementSafe('div', {
        className: 'analytics-section'
    });

    const sectionTitle = createElementSafe('h3', {
        textContent: 'Budget Status',
        className: 'section-title'
    });

    const budgetBar = createElementSafe('div', {
        className: 'budget-progress-large'
    });

    const budgetFill = createElementSafe('div', {
        className: budgetStatus.isOverBudget ? 'budget-fill over-budget' : 'budget-fill'
    });
    budgetFill.style.width = `${Math.min(budgetStatus.percentUsed, 100)}%`;

    budgetBar.appendChild(budgetFill);

    const budgetText = createElementSafe('div', {
        className: 'budget-status-text'
    });

    const statusColor = budgetStatus.isOverBudget ? 'text-red-500' :
                       budgetStatus.percentUsed > 80 ? 'text-yellow-500' : 'text-green-500';

    budgetText.innerHTML = `
        <div class="budget-info-row">
            <span>Monthly Budget:</span>
            <span class="font-mono">${window.costTracker.formatCurrency(budgetStatus.monthlyBudget)}</span>
        </div>
        <div class="budget-info-row">
            <span>Used This Month:</span>
            <span class="font-mono ${statusColor}">${window.costTracker.formatCurrency(budgetStatus.monthlyCost)}</span>
        </div>
        <div class="budget-info-row">
            <span>Remaining:</span>
            <span class="font-mono ${statusColor}">${window.costTracker.formatCurrency(budgetStatus.remainingBudget)}</span>
        </div>
        <div class="budget-info-row">
            <span>Usage Percentage:</span>
            <span class="font-mono ${statusColor}">${budgetStatus.percentUsed.toFixed(1)}%</span>
        </div>
    `;

    const budgetActions = createElementSafe('div', {
        className: 'budget-actions'
    });

    const changeBudgetBtn = createElementSafe('button', {
        className: 'action-btn bg-blue-600 hover:bg-blue-700',
        textContent: 'Change Budget'
    });

    // Add event listener manually (createElementSafe doesn't support onclick for security)
    changeBudgetBtn.addEventListener('click', () => {
        showBudgetSettings();
        // Refresh the modal
        const modal = document.querySelector('.usage-analytics-modal');
        if (modal) {
            closeAnalyticsModal(modal);
            setTimeout(showUsageAnalytics, 100);
        }
    });

    budgetActions.appendChild(changeBudgetBtn);

    section.appendChild(sectionTitle);
    section.appendChild(budgetBar);
    section.appendChild(budgetText);
    section.appendChild(budgetActions);

    return section;
}

function createModelBreakdownSection(modelBreakdown) {
    const section = createElementSafe('div', {
        className: 'analytics-section'
    });

    const sectionTitle = createElementSafe('h3', {
        textContent: 'Model Usage Breakdown',
        className: 'section-title'
    });

    const modelGrid = createElementSafe('div', {
        className: 'model-breakdown-grid'
    });

    Object.entries(modelBreakdown).forEach(([modelKey, usage]) => {
        const modelConfig = GEMINI_MODELS[modelKey];
        if (!modelConfig || usage.requests === 0) return;

        const modelCard = createElementSafe('div', {
            className: 'model-breakdown-card'
        });

        const modelHeader = createElementSafe('div', {
            className: 'model-card-header'
        });

        const modelName = createElementSafe('h4', {
            textContent: modelConfig.name,
            className: 'model-card-title'
        });

        const modelCost = createElementSafe('span', {
            textContent: window.costTracker.formatCurrency(usage.cost),
            className: 'model-card-cost'
        });

        modelHeader.appendChild(modelName);
        modelHeader.appendChild(modelCost);

        const modelStats = createElementSafe('div', {
            className: 'model-card-stats'
        });

        const stats = [
            { label: 'Requests', value: window.costTracker.formatNumber(usage.requests) },
            { label: 'Input Tokens', value: window.costTracker.formatNumber(usage.inputTokens) },
            { label: 'Output Tokens', value: window.costTracker.formatNumber(usage.outputTokens) }
        ];

        stats.forEach(stat => {
            const statRow = createElementSafe('div', {
                className: 'model-stat-row'
            });

            const label = createElementSafe('span', {
                textContent: stat.label + ':',
                className: 'model-stat-label'
            });

            const value = createElementSafe('span', {
                textContent: stat.value,
                className: 'model-stat-value'
            });

            statRow.appendChild(label);
            statRow.appendChild(value);
            modelStats.appendChild(statRow);
        });

        modelCard.appendChild(modelHeader);
        modelCard.appendChild(modelStats);
        modelGrid.appendChild(modelCard);
    });

    section.appendChild(sectionTitle);
    section.appendChild(modelGrid);

    return section;
}

function createExportSection() {
    const section = createElementSafe('div', {
        className: 'analytics-section'
    });

    const sectionTitle = createElementSafe('h3', {
        textContent: 'Export Data',
        className: 'section-title'
    });

    const exportActions = createElementSafe('div', {
        className: 'export-actions'
    });

    const exportBtn = createElementSafe('button', {
        className: 'action-btn bg-green-600 hover:bg-green-700',
        textContent: 'Export Usage Data'
    });

    // Add event listener manually (createElementSafe doesn't support onclick for security)
    exportBtn.addEventListener('click', exportUsageData);

    const resetBtn = createElementSafe('button', {
        className: 'action-btn bg-red-600 hover:bg-red-700',
        textContent: 'Reset All Data'
    });

    // Add event listener manually (createElementSafe doesn't support onclick for security)
    resetBtn.addEventListener('click', resetUsageData);

    exportActions.appendChild(exportBtn);
    exportActions.appendChild(resetBtn);

    section.appendChild(sectionTitle);
    section.appendChild(exportActions);

    return section;
}

function createStatCard(label, value) {
    const card = createElementSafe('div', {
        className: 'stat-card'
    });

    const labelEl = createElementSafe('div', {
        textContent: label,
        className: 'stat-label'
    });

    const valueEl = createElementSafe('div', {
        textContent: value,
        className: 'stat-value'
    });

    card.appendChild(labelEl);
    card.appendChild(valueEl);

    return card;
}

function closeAnalyticsModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
}

function exportUsageData() {
    const data = window.costTracker.exportUsageData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `sage-usage-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();

    URL.revokeObjectURL(url);
    displayMessage('Usage data exported successfully', 'text-green-500');
}

function resetUsageData() {
    if (confirm('Are you sure you want to reset all usage data? This action cannot be undone.')) {
        window.costTracker.resetAllData();
        displayMessage('All usage data has been reset', 'text-green-500');

        // Refresh the modal
        const modal = document.querySelector('.usage-analytics-modal');
        if (modal) {
            closeAnalyticsModal(modal);
            setTimeout(showUsageAnalytics, 100);
        }
    }
}