/**
 * SAGE - Question Display Component
 * Question rendering, navigation, favorites, and similar question generation
 */

// Question navigation functions
function navigateQuestion(direction) {
    console.log(`Navigating from question ${currentQuestionIndex + 1} with direction ${direction}`);
    const newIndex = currentQuestionIndex + direction;
    console.log(`New index: ${newIndex + 1}, total questions: ${totalQuestions}`);
    
    if (newIndex >= 0 && newIndex < totalQuestions) {
        currentQuestionIndex = newIndex;
        console.log(`Current question index updated to: ${currentQuestionIndex + 1}`);
        showQuestion(currentQuestionIndex);
        updateNavigationState();
    } else {
        console.log('Navigation blocked - index out of bounds');
    }
}

function showQuestion(index) {
    const questions = document.querySelectorAll('.question-item');
    console.log(`Showing question ${index + 1}, total questions found: ${questions.length}`);
    
    questions.forEach((question, i) => {
        const isActive = i === index;
        question.classList.toggle('active', isActive);
        console.log(`Question ${i + 1}: ${isActive ? 'ACTIVE' : 'hidden'}`);
    });
    
    // Update counter
    const counter = document.getElementById('questionCounter');
    if (counter) {
        counter.textContent = `Question ${index + 1} of ${totalQuestions}`;
    }
}

function updateNavigationState() {
    if (prevQuestionBtn) {
        prevQuestionBtn.disabled = currentQuestionIndex === 0;
    }
    if (nextQuestionBtn) {
        nextQuestionBtn.disabled = currentQuestionIndex === totalQuestions - 1;
    }
}

// Phase 3: Add question to favourites
function addToFavorites(problem, questionIndex, favoriteBtn) {
    const topic = mathTopicInput.value.trim();
    const difficulty = difficultySelect.value;
    
    DataManager.addToFavorites(
        problem.question,
        problem.correctAnswer,
        problem.stepByStepSolution,
        topic,
        difficulty
    );
    
    // Update button state
    favoriteBtn.textContent = '✓ Favourited';
    favoriteBtn.disabled = true;
    favoriteBtn.className = 'action-btn bg-green-600 hover:bg-green-700';
    
    // Show success message
    displayMessage(`Question ${questionIndex + 1} added to favourites!`, 'text-green-400');
}

// Generate similar question functionality
async function generateSimilarQuestion(originalProblem, questionIndex) {
    const apiKey = localStorage.getItem(CONFIG.STORAGE_KEY);
    
    if (!apiKey) {
        createNotification('API key required for generating similar questions', 'warning');
        return;
    }
    
    if (!isOnline) {
        createNotification('Internet connection required for generating similar questions', 'warning');
        return;
    }
    
    // Show loading state for this specific question
    const similarBtn = document.querySelector(`[aria-label="Generate similar question to ${questionIndex + 1}"]`);
    const originalText = similarBtn.textContent;
    similarBtn.disabled = true;
    similarBtn.textContent = 'Generating...';
    
    try {
        const prompt = `
            Generate 1 similar math problem to the following, keeping the same topic and difficulty level but with different numbers/context:
            
            Original Question: ${originalProblem.question}
            
            Generate a new problem that:
            - Uses the same mathematical concepts
            - Has similar difficulty level
            - Uses different numbers or context
            - Follows the same format with question, correctAnswer, and stepByStepSolution in LaTeX
            
            Provide the output as a JSON object:
            {
                "question": "...",
                "correctAnswer": "...",
                "stepByStepSolution": "..."
            }
        `;
        
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        "question": { "type": "STRING" },
                        "correctAnswer": { "type": "STRING" },
                        "stepByStepSolution": { "type": "STRING" }
                    }
                }
            }
        };
        
        // Phase 4: Check cache for similar question
        const similarCacheKey = `similar_${btoa(originalProblem.question).substring(0, 20)}`;
        const cachedSimilar = QuestionCache.get(similarCacheKey, 'similar');
        if (cachedSimilar && cachedSimilar.length > 0) {
            console.log('Using cached similar question');
            replaceProblemInList(questionIndex, cachedSimilar[0]);
            createNotification('Similar question generated from cache!', 'success');
            return;
        }

        const apiUrl = `${CONFIG.API_BASE_URL}?key=${apiKey}`;
        const result = await makeAPICallWithRetry(apiUrl, payload, 2); // Fewer retries for similar questions
        
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const jsonText = result.candidates[0].content.parts[0].text;
            const newProblem = JSON.parse(jsonText);
            
            // Phase 4: Cache the similar question
            QuestionCache.set(similarCacheKey, 'similar', [newProblem]);
            
            // Replace the current question with the similar one
            replaceProblemInList(questionIndex, newProblem);
            createNotification('Similar question generated!', 'success');
        } else {
            throw new Error('Invalid response format');
        }
        
    } catch (error) {
        console.error('Error generating similar question:', error);
        createNotification('Failed to generate similar question. Please try again.', 'warning');
    } finally {
        similarBtn.disabled = false;
        similarBtn.textContent = originalText;
    }
}

// Replace a specific problem in the displayed list
function replaceProblemInList(index, newProblem) {
    // Update the stored questions array
    currentQuestions[index] = newProblem;
    
    // Find the question element
    const questions = document.querySelectorAll('.question-item');
    const questionElement = questions[index];
    
    if (questionElement) {
        // Update the question content
        const questionRendered = questionElement.querySelector('.math-rendered');
        const questionLatex = questionElement.querySelector('.latex-view');
        
        if (questionRendered) {
            if (newProblem.question.includes('\\') && !newProblem.question.includes('$')) {
                const processedQuestion = preprocessMathContent(newProblem.question);
                setHTMLContent(questionRendered, sanitizeString(processedQuestion));
            } else {
                setHTMLContent(questionRendered, sanitizeString(newProblem.question));
            }
        }
        if (questionLatex) setTextContent(questionLatex, newProblem.question);
        
        // Update answer content
        const answerContentDiv = questionElement.querySelector('.answer-content');
        if (answerContentDiv) {
            let processedAnswer = newProblem.correctAnswer;
            let processedSolution = newProblem.stepByStepSolution;
            
            // Only preprocess if there's LaTeX without delimiters
            if (newProblem.correctAnswer.includes('\\') && !newProblem.correctAnswer.includes('$')) {
                processedAnswer = preprocessMathContent(newProblem.correctAnswer);
            }
            
            if (newProblem.stepByStepSolution.includes('\\') && !newProblem.stepByStepSolution.includes('$')) {
                processedSolution = preprocessMathContent(newProblem.stepByStepSolution);
            }
            
            console.log('🔍 DEBUG: About to call sanitizeWithLineBreaks (similar question)');
            console.log('Function exists:', typeof sanitizeWithLineBreaks !== 'undefined');
            
            // Use safe function call with fallback
            const safeRender = (content) => {
                try {
                    if (typeof sanitizeWithLineBreaks !== 'undefined') {
                        return sanitizeWithLineBreaks(content);
                    } else {
                        console.error('sanitizeWithLineBreaks not defined, using fallback');
                        return sanitizeString(content);
                    }
                } catch (error) {
                    console.error('Error in sanitizeWithLineBreaks:', error);
                    return sanitizeString(content);
                }
            };

            // Update the similar question rendering to use proper sanitization functions
            const safeRenderAnswerSimilar = (content) => {
                try {
                    return sanitizeString(content); // Answers should NOT have line breaks
                } catch (error) {
                    console.error('Error in sanitizeString for similar answer:', error);
                    return content || '';
                }
            };
            
            const safeRenderSolutionSimilar = (content) => {
                try {
                    if (typeof sanitizeWithLineBreaks !== 'undefined') {
                        return sanitizeWithLineBreaks(content); // Solutions SHOULD have line breaks
                    } else {
                        console.error('sanitizeWithLineBreaks not defined, using fallback');
                        return sanitizeString(content);
                    }
                } catch (error) {
                    console.error('Error in sanitizeWithLineBreaks for similar solution:', error);
                    return sanitizeString(content);
                }
            };

            answerContentDiv.innerHTML = `<div class="mb-3 p-2 rounded text-xs" style="background: var(--button-bg); border: 1px solid var(--border-color); color: var(--text-secondary);">
                                             <span class="font-semibold">⚠️ AI Generated Content:</span> Please verify answers independently. AI responses may contain errors.
                                         </div>` +
                                         `<p class="font-bold mb-2" style="color: var(--accent);">Correct Answer:</p><div class="mb-4 math-rendered" style="color: var(--text-primary);">${safeRenderAnswerSimilar(processedAnswer)}</div>` +
                                         `<div class="latex-view">${safeRenderAnswerSimilar(newProblem.correctAnswer)}</div>` +
                                         `<p class="font-bold mb-2" style="color: var(--accent);">Step-by-Step Solution:</p><div class="math-rendered" style="color: var(--text-primary);">${safeRenderSolutionSimilar(processedSolution)}</div>` +
                                         `<div class="latex-view">${safeRenderSolutionSimilar(newProblem.stepByStepSolution)}</div>`;
            
            // Hide the answer initially
            answerContentDiv.style.display = 'none';
            const revealBtn = questionElement.querySelector('.action-btn:nth-child(2)'); // Second button (reveal)
            if (revealBtn) {
                revealBtn.textContent = 'Show Answer & Steps';
                revealBtn.setAttribute('aria-expanded', 'false');
            }
        }
        
        // Re-render math content
        retryMathRendering(questionElement);
        
        // Apply current view state
        const mathRenderedElements = questionElement.querySelectorAll('.math-rendered');
        const latexElements = questionElement.querySelectorAll('.latex-view');
        
        mathRenderedElements.forEach(el => {
            el.style.display = isMathRendered ? 'block' : 'none';
        });
        latexElements.forEach(el => {
            el.style.display = isMathRendered ? 'none' : 'block';
        });
    }
}

// Create individual question item DOM element
function createQuestionItem(problem, index, mathTopic) {
    console.log(`🔍 DEBUG: createQuestionItem ENTRY for question ${index + 1} [VERSION 2.0]`);
    
    try {
        console.log(`🔍 DEBUG: createQuestionItem called for question ${index + 1}`);
        console.log('Problem data:', {
            question: problem.question?.substring(0, 50) + '...',
            hasStepByStepSolution: !!problem.stepByStepSolution,
            solutionHasNewlines: problem.stepByStepSolution?.includes('\n')
        });
        
        console.log('🔍 DEBUG: Creating problem div...');
        const problemDiv = document.createElement('div');
    problemDiv.className = 'question-item';
    problemDiv.style.animationDelay = `${index * 0.1}s`; // Staggered animation
    problemDiv.setAttribute('role', 'listitem');

    const questionHeader = document.createElement('div');
    questionHeader.className = 'flex items-center justify-between mb-4';
    
    const questionTitle = document.createElement('h3');
    questionTitle.className = 'text-xl font-semibold';
    questionTitle.style.color = 'var(--text-primary)';
    questionTitle.textContent = `Problem ${index + 1}:`;
    
    const categoryTagDiv = document.createElement('div');
    categoryTagDiv.innerHTML = createCategoryTag(mathTopic, 'medium');
    
    questionHeader.appendChild(questionTitle);
    questionHeader.appendChild(categoryTagDiv);
    problemDiv.appendChild(questionHeader);

    // Container for rendered math
    const questionRenderedDiv = document.createElement('div');
    questionRenderedDiv.className = 'text-lg mb-4 math-rendered';
    questionRenderedDiv.style.color = 'var(--text-primary)';
    
    console.log('🔍 DEBUG: About to preprocess question content...');
    
    // Always preprocess the content to ensure proper math handling
    try {
        console.log(`Question ${index + 1} raw content:`, problem.question.substring(0, 150) + '...');
        console.log('🔍 DEBUG: Calling preprocessMathContent...');
        const processedQuestion = preprocessMathContent(problem.question);
        console.log('🔍 DEBUG: Calling sanitizeString for question (questions should not have line breaks)...');
        setHTMLContent(questionRenderedDiv, sanitizeString(processedQuestion));
        console.log(`Question ${index + 1} after processing:`, processedQuestion.substring(0, 150) + '...');
        console.log(`Question ${index + 1} has dollar signs:`, processedQuestion.includes('$'));
    } catch (error) {
        console.error(`🔍 DEBUG: Error processing question ${index + 1}:`, error);
        setHTMLContent(questionRenderedDiv, sanitizeString(problem.question));
    }
    console.log('🔍 DEBUG: Appending question div to problem div...');
    problemDiv.appendChild(questionRenderedDiv);

    // Container for raw LaTeX
    const questionLatexDiv = document.createElement('div');
    questionLatexDiv.className = 'latex-view'; // Hidden by default initially
    questionLatexDiv.textContent = problem.question;
    problemDiv.appendChild(questionLatexDiv);

    console.log('🔍 DEBUG: About to create action buttons... [NEW CODE LOADED]');
    // Create action buttons
    try {
        const buttonContainer = createQuestionButtons(problem, index);
        console.log('🔍 DEBUG: createQuestionButtons succeeded');
        problemDiv.appendChild(buttonContainer);
        console.log('🔍 DEBUG: Button container appended');
    } catch (error) {
        console.error('🔍 DEBUG: Error in createQuestionButtons:', error);
        // Continue without buttons
    }

    console.log('🔍 DEBUG: About to call createAnswerContent...');
    // Create answer content div (hidden initially)
    const answerContentDiv = createAnswerContent(problem);
    console.log('🔍 DEBUG: createAnswerContent returned:', !!answerContentDiv);
    problemDiv.appendChild(answerContentDiv);

        console.log('🔍 DEBUG: createQuestionItem completed successfully');
        return problemDiv;
        
    } catch (error) {
        console.error(`🔍 DEBUG: FATAL ERROR in createQuestionItem for question ${index + 1}:`, error);
        console.error('Error stack:', error.stack);
        
        // Create a fallback simple question div
        const fallbackDiv = document.createElement('div');
        fallbackDiv.className = 'question-item';
        fallbackDiv.innerHTML = `
            <div class="text-red-500 p-4 border border-red-500 rounded">
                <h3>Error rendering question ${index + 1}</h3>
                <p>Question: ${problem.question || 'No question'}</p>
                <p>Answer: ${problem.correctAnswer || 'No answer'}</p>
                <pre class="whitespace-pre-wrap mt-2">${problem.stepByStepSolution || 'No solution'}</pre>
                <p class="text-xs mt-2">Error: ${error.message}</p>
            </div>
        `;
        return fallbackDiv;
    }
}

// Create action buttons for a question
function createQuestionButtons(problem, index) {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex flex-wrap gap-2 mt-4';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'action-btn bg-gray-600 hover:bg-gray-700';
    copyBtn.textContent = 'Copy Question';
    copyBtn.setAttribute('aria-label', `Copy question ${index + 1}`);
    copyBtn.addEventListener('click', () => copyToClipboard(problem.question));
    buttonContainer.appendChild(copyBtn);

    const revealBtn = document.createElement('button');
    revealBtn.className = 'action-btn bg-red-600 hover:bg-red-700';
    revealBtn.textContent = 'Show Answer & Steps';
    revealBtn.setAttribute('aria-label', `Show answer and steps for question ${index + 1}`);
    buttonContainer.appendChild(revealBtn);

    const similarBtn = document.createElement('button');
    similarBtn.className = 'action-btn bg-blue-600 hover:bg-blue-700';
    similarBtn.textContent = 'Generate Similar';
    similarBtn.setAttribute('aria-label', `Generate similar question to ${index + 1}`);
    similarBtn.addEventListener('click', () => generateSimilarQuestion(problem, index));
    buttonContainer.appendChild(similarBtn);
    
    // Phase 3: Add favourite button
    const favoriteBtn = document.createElement('button');
    favoriteBtn.className = 'action-btn bg-yellow-600 hover:bg-yellow-700';
    favoriteBtn.textContent = '⭐ Favourite';
    favoriteBtn.setAttribute('aria-label', `Add question ${index + 1} to favourites`);
    favoriteBtn.addEventListener('click', () => addToFavorites(problem, index, favoriteBtn));
    buttonContainer.appendChild(favoriteBtn);

    return buttonContainer;
}

// Create answer content section
function createAnswerContent(problem) {
    console.log('🔍 DEBUG: createAnswerContent called');
    console.log('Problem stepByStepSolution:', JSON.stringify(problem.stepByStepSolution));
    console.log('Has newlines:', problem.stepByStepSolution?.includes('\n'));
    
    const answerContentDiv = document.createElement('div');
    answerContentDiv.className = 'answer-content text-gray-300';
    
    // Minimal processing - preserve content as much as possible
    let processedAnswer = problem.correctAnswer;
    let processedSolution = problem.stepByStepSolution;
    
    // Only preprocess if there's LaTeX without delimiters
    if (problem.correctAnswer.includes('\\') && !problem.correctAnswer.includes('$')) {
        processedAnswer = preprocessMathContent(problem.correctAnswer);
    }
    
    if (problem.stepByStepSolution.includes('\\') && !problem.stepByStepSolution.includes('$')) {
        processedSolution = preprocessMathContent(problem.stepByStepSolution);
    }
    
    console.log('🔍 DEBUG: About to call sanitizeWithLineBreaks');
    console.log('Function exists:', typeof sanitizeWithLineBreaks !== 'undefined');
    
    // Use safe function call with appropriate sanitization for each content type
    const safeRenderAnswer = (content) => {
        try {
            // Answers should NOT have line breaks - use sanitizeString
            return sanitizeString(content);
        } catch (error) {
            console.error('Error in sanitizeString for answer:', error);
            return content || '';
        }
    };
    
    const safeRenderSolution = (content) => {
        try {
            // Solutions SHOULD have line breaks - use sanitizeWithLineBreaks
            if (typeof sanitizeWithLineBreaks !== 'undefined') {
                return sanitizeWithLineBreaks(content);
            } else {
                console.error('sanitizeWithLineBreaks not defined, using fallback');
                return sanitizeString(content);
            }
        } catch (error) {
            console.error('Error in sanitizeWithLineBreaks for solution:', error);
            return sanitizeString(content);
        }
    };

    answerContentDiv.innerHTML = `<div class="mb-3 p-2 rounded text-xs" style="background: var(--button-bg); border: 1px solid var(--border-color); color: var(--text-secondary);">
                                     <span class="font-semibold">⚠️ AI Generated Content:</span> Please verify answers independently. AI responses may contain errors.
                                 </div>` +
                                 `<p class="font-bold mb-2" style="color: var(--accent);">Correct Answer:</p><div class="mb-4 math-rendered" style="color: var(--text-primary);">${safeRenderAnswer(processedAnswer)}</div>` +
                                 `<div class="latex-view">${safeRenderAnswer(problem.correctAnswer)}</div>` + // Raw LaTeX for answer
                                 `<p class="font-bold mb-2" style="color: var(--accent);">Step-by-Step Solution:</p><div class="math-rendered" style="color: var(--text-primary);">${safeRenderSolution(processedSolution)}</div>` +
                                 `<div class="latex-view">${safeRenderSolution(problem.stepByStepSolution)}</div>`; // Raw LaTeX with preserved line breaks
    
    return answerContentDiv;
}

// Setup answer reveal functionality for a question
function setupAnswerReveal(problemDiv, answerContentDiv) {
    const revealBtn = problemDiv.querySelector('.action-btn:nth-child(2)'); // Second button (reveal)
    
    if (revealBtn) {
        revealBtn.addEventListener('click', () => {
            const isVisible = answerContentDiv.style.display === 'block';
            answerContentDiv.style.display = isVisible ? 'none' : 'block';
            revealBtn.textContent = isVisible ? 'Show Answer & Steps' : 'Hide Answer & Steps';
            revealBtn.setAttribute('aria-expanded', !isVisible);
            
            // Re-render math in the revealed section if it's currently rendered view
            if (!isVisible && isMathRendered) {
                 retryMathRendering(answerContentDiv);
            }
        });
    }
}