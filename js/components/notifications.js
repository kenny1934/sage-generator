/**
 * SAGE - Notifications Component
 * Modal dialogs, overlays, favorites panel, keyboard shortcuts, and mobile features
 */

// Phase 3: Show favorites panel
function showFavoritesPanel() {
    const favorites = DataManager.loadFavorites();
    
    if (favorites.length === 0) {
        displayMessage('No favourite questions yet. Click the star button on any question to add it to favourites!', 'text-yellow-400');
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    overlay.innerHTML = `
        <div class="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-red-500/30">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    ⭐ Your Favourite Questions (${favorites.length})
                </h3>
                <button class="action-btn bg-red-600 hover:bg-red-700" onclick="this.closest('.fixed').remove()">
                    Close
                </button>
            </div>
            <div class="space-y-4">
                ${favorites.map((fav, index) => `
                    <div class="p-4 bg-gray-700 rounded-lg border border-gray-600">
                        <div class="flex justify-between items-start mb-2">
                            <div class="text-sm text-gray-400">${fav.topic} • ${fav.difficulty} • ${fav.date}</div>
                            <button class="text-red-400 hover:text-red-300 text-sm" onclick="removeFavorite(${fav.id}, this)">
                                Remove
                            </button>
                        </div>
                        <div class="text-white mb-2">${fav.question}</div>
                        <div class="text-gray-300 text-sm">
                            <strong>Answer:</strong> ${fav.answer}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Close on ESC or click outside
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
    
    const closeOnEsc = (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', closeOnEsc);
        }
    };
    document.addEventListener('keydown', closeOnEsc);
}

// Phase 3: Remove favorite
function removeFavorite(favoriteId, buttonElement) {
    DataManager.removeFromFavorites(favoriteId);
    buttonElement.closest('.p-4').remove();
    displayMessage('Favorite removed!', 'text-orange-400');
}

// Show keyboard shortcuts overlay
function showKeyboardShortcuts() {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
    overlay.innerHTML = `
        <div class="bg-gray-800 rounded-lg p-6 max-w-md mx-4 border border-red-500/30">
            <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                ⌨️ Keyboard Shortcuts
            </h3>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between"><span class="text-gray-300">Generate Questions:</span><span class="text-red-400">Ctrl + Enter</span></div>
                <div class="flex justify-between"><span class="text-gray-300">Focus Topic Input:</span><span class="text-red-400">Ctrl + K</span></div>
                <div class="flex justify-between"><span class="text-gray-300">Export Questions:</span><span class="text-red-400">Ctrl + E</span></div>
                <div class="flex justify-between"><span class="text-gray-300">Navigate Questions:</span><span class="text-red-400">← →</span></div>
                <div class="flex justify-between"><span class="text-gray-300">Refresh/Regenerate:</span><span class="text-red-400">F5, Ctrl + R</span></div>
                <div class="flex justify-between"><span class="text-gray-300">Show Answer 1-3:</span><span class="text-red-400">1, 2, 3</span></div>
                <div class="flex justify-between"><span class="text-gray-300">Show Favorites:</span><span class="text-red-400">Ctrl + F</span></div>
                <div class="flex justify-between"><span class="text-gray-300">Close Dialogs:</span><span class="text-red-400">Escape</span></div>
                <div class="flex justify-between"><span class="text-gray-300">Show This Help:</span><span class="text-red-400">? or ❓ button</span></div>
            </div>
            <button class="mt-4 w-full action-btn bg-red-600 hover:bg-red-700" onclick="this.parentElement.parentElement.remove()">
                Close (ESC)
            </button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Close on ESC or click outside
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
    
    const closeOnEsc = (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', closeOnEsc);
        }
    };
    document.addEventListener('keydown', closeOnEsc);
}

// Network status message display
function showNetworkMessage(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg text-white font-medium transition-all duration-300 ${
        type === 'success' ? 'bg-green-600' : 'bg-orange-600'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Create modal dialog
function createModal(title, content, buttons = []) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    
    const modal = document.createElement('div');
    modal.className = 'bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-600';
    
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center mb-4';
    header.innerHTML = `
        <h3 class="text-xl font-bold text-white">${title}</h3>
        <button class="text-gray-400 hover:text-gray-200 text-2xl" onclick="this.closest('.fixed').remove()">×</button>
    `;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'text-gray-300 mb-4';
    if (typeof content === 'string') {
        contentDiv.innerHTML = content;
    } else {
        contentDiv.appendChild(content);
    }
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex gap-2 justify-end';
    
    buttons.forEach(button => {
        const btn = document.createElement('button');
        btn.className = `action-btn ${button.className || 'bg-gray-600 hover:bg-gray-700'}`;
        btn.textContent = button.text;
        btn.onclick = button.onclick;
        buttonContainer.appendChild(btn);
    });
    
    modal.appendChild(header);
    modal.appendChild(contentDiv);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);
    
    document.body.appendChild(overlay);
    
    // Close on ESC or click outside
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
    
    const closeOnEsc = (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', closeOnEsc);
        }
    };
    document.addEventListener('keydown', closeOnEsc);
    
    return overlay;
}

// Create confirmation dialog
function createConfirmationDialog(title, message, onConfirm, onCancel = null) {
    const buttons = [
        {
            text: 'Cancel',
            className: 'bg-gray-600 hover:bg-gray-700',
            onclick: () => {
                if (onCancel) onCancel();
                document.querySelector('.fixed').remove();
            }
        },
        {
            text: 'Confirm',
            className: 'bg-red-600 hover:bg-red-700',
            onclick: () => {
                onConfirm();
                document.querySelector('.fixed').remove();
            }
        }
    ];
    
    return createModal(title, message, buttons);
}

// Mobile-specific features
function initializeMobileFeatures() {
    // Add touch feedback to all buttons
    document.addEventListener('touchstart', function(e) {
        if (e.target.classList.contains('action-btn')) {
            e.target.style.transform = 'scale(0.98)';
        }
    });
    
    document.addEventListener('touchend', function(e) {
        if (e.target.classList.contains('action-btn')) {
            setTimeout(() => {
                e.target.style.transform = '';
            }, 100);
        }
    });
    
    // Improve mobile keyboard experience
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            // Scroll into view on mobile to prevent keyboard overlap
            setTimeout(() => {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    });
    
    // Add pull-to-refresh hint (visual only)
    if (isMobileDevice()) {
        addPullToRefreshHint();
    }
}

// Detect mobile device
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Add subtle pull-to-refresh visual hint
function addPullToRefreshHint() {
    const hint = document.createElement('div');
    hint.className = 'text-center text-gray-500 text-xs py-2';
    hint.textContent = '↓ Pull down to refresh ↓';
    hint.style.opacity = '0.5';
    
    const container = document.querySelector('.main-container');
    container.insertBefore(hint, container.firstChild);
    
    // Simple pull-to-refresh detection
    let startY = 0;
    let currentY = 0;
    let pullDistance = 0;
    
    container.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    });
    
    container.addEventListener('touchmove', (e) => {
        currentY = e.touches[0].clientY;
        pullDistance = currentY - startY;
        
        if (pullDistance > 0 && window.scrollY === 0) {
            hint.style.opacity = Math.min(1, pullDistance / 100);
            hint.style.transform = `translateY(${Math.min(pullDistance / 3, 20)}px)`;
        }
    });
    
    container.addEventListener('touchend', () => {
        if (pullDistance > 80 && window.scrollY === 0 && mathTopicInput.value.trim()) {
            // Trigger refresh
            if (!generateQuestionsBtn.disabled) {
                generateMathQuestions();
            }
        }
        
        // Reset hint
        hint.style.opacity = '0.5';
        hint.style.transform = 'translateY(0)';
        pullDistance = 0;
    });
}

// Toast notification system
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    const typeClasses = {
        success: 'bg-green-600 border-green-500',
        error: 'bg-red-600 border-red-500',
        warning: 'bg-orange-600 border-orange-500',
        info: 'bg-blue-600 border-blue-500'
    };
    
    toast.className = `fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white font-medium shadow-lg transition-all duration-300 transform translate-x-full border-l-4 ${typeClasses[type] || typeClasses.info}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translate(0, 0)';
    }, 100);
    
    // Auto-remove
    setTimeout(() => {
        toast.style.transform = 'translate(100%, 0)';
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300);
    }, duration);
    
    return toast;
}

// Loading overlay
function showLoadingOverlay(message = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    overlay.id = 'loadingOverlay';
    
    overlay.innerHTML = `
        <div class="bg-gray-800 rounded-lg p-6 flex items-center gap-3 border border-gray-600">
            <div class="math-spinner">
                <span class="math-symbol">π</span>
                <span class="math-symbol">∑</span>
                <span class="math-symbol">∫</span>
                <span class="math-symbol">∞</span>
            </div>
            <span class="text-white font-medium">${message}</span>
        </div>
    `;
    
    document.body.appendChild(overlay);
    return overlay;
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// Alert system for important messages
function showAlert(title, message, type = 'info') {
    const alertDiv = document.createElement('div');
    const typeClasses = {
        success: 'bg-green-900/20 border-green-500/30 text-green-200',
        error: 'bg-red-900/20 border-red-500/30 text-red-200',
        warning: 'bg-orange-900/20 border-orange-500/30 text-orange-200',
        info: 'bg-blue-900/20 border-blue-500/30 text-blue-200'
    };
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    alertDiv.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md p-4 rounded-lg border ${typeClasses[type] || typeClasses.info} shadow-lg`;
    
    alertDiv.innerHTML = `
        <div class="flex items-start gap-3">
            <div class="text-xl">${icons[type] || icons.info}</div>
            <div class="flex-1">
                <h4 class="font-semibold mb-1">${title}</h4>
                <p class="text-sm">${message}</p>
            </div>
            <button class="text-gray-400 hover:text-gray-200 ml-2" onclick="this.closest('.fixed').remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.style.opacity = '0';
            alertDiv.style.transform = 'translate(-50%, -20px)';
            setTimeout(() => {
                if (alertDiv.parentElement) {
                    alertDiv.parentElement.removeChild(alertDiv);
                }
            }, 300);
        }
    }, 5000);
    
    return alertDiv;
}