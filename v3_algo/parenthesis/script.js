// DOM Elements
const expressionInput = document.getElementById('expressionInput');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const visualizeBtn = document.getElementById('visualizeBtn');
const resetBtn = document.getElementById('resetBtn');
const expressionDisplay = document.getElementById('expressionDisplay');
const stackDisplay = document.getElementById('stackDisplay');
const currentCharInfo = document.getElementById('currentCharInfo');
const charStatus = document.getElementById('charStatus');
const currentOperation = document.getElementById('currentOperation');
const currentStep = document.getElementById('currentStep');
const stepsContainer = document.getElementById('stepsContainer');
const result = document.getElementById('result');

// Global Variables
let isVisualizing = false;
let animationSpeed = 1000;
let stack = [];
let isExpressionValid = true;
let currentIndex = 0;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    updateSpeedValue();
    displayExpression();
});

speedSlider.addEventListener('input', () => {
    updateSpeedValue();
});

visualizeBtn.addEventListener('click', async () => {
    if (!isVisualizing) {
        await startVisualization();
    }
});

resetBtn.addEventListener('click', () => {
    resetVisualization();
});

expressionInput.addEventListener('input', () => {
    displayExpression();
});

// Helper Functions
function updateSpeedValue() {
    animationSpeed = parseInt(speedSlider.value);
    speedValue.textContent = `${animationSpeed} ms`;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setControlsState(disabled) {
    expressionInput.disabled = disabled;
    speedSlider.disabled = disabled;
    visualizeBtn.disabled = disabled;
    isVisualizing = disabled;
}

function addStep(step, type = 'normal') {
    const stepElement = document.createElement('div');
    stepElement.className = 'step';
    
    if (type !== 'normal') {
        stepElement.classList.add(`step-${type}`);
    }
    
    stepElement.textContent = step;
    stepsContainer.appendChild(stepElement);
    stepsContainer.scrollTop = stepsContainer.scrollHeight;
}

function updateCurrentStep(step, type = 'normal') {
    currentStep.textContent = step;
    currentStep.className = 'current-step';
    
    if (type !== 'normal') {
        currentStep.classList.add(`step-${type}`);
    }
}

function updateCharInfo(char) {
    const charValueSpan = currentCharInfo.querySelector('.char-value span');
    charValueSpan.textContent = char || '';
    
    // Add animation to highlight the change
    charValueSpan.classList.remove('highlight-change');
    void charValueSpan.offsetWidth; // Trigger reflow
    charValueSpan.classList.add('highlight-change');
}

function updateCharStatus(status, text) {
    charStatus.className = 'char-status';
    if (status) {
        charStatus.classList.add(status);
    }
    const statusText = charStatus.querySelector('.status-text');
    statusText.textContent = text;
    
    // Add animation to highlight the change
    statusText.classList.remove('highlight-change');
    void statusText.offsetWidth; // Trigger reflow
    statusText.classList.add('highlight-change');
}

// Display Functions
function displayExpression() {
    expressionDisplay.innerHTML = '';
    
    const expression = expressionInput.value;
    if (!expression) return;
    
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < expression.length; i++) {
        const charElement = document.createElement('div');
        charElement.className = 'char-item';
        charElement.textContent = expression[i];
        charElement.setAttribute('data-index', i);
        
        // Add index number
        const indexSpan = document.createElement('span');
        indexSpan.className = 'char-index';
        indexSpan.textContent = i;
        charElement.appendChild(indexSpan);
        
        // Pre-classify opening and closing brackets
        if (isOpeningBracket(expression[i])) {
            charElement.classList.add('opening');
        } else if (isClosingBracket(expression[i])) {
            charElement.classList.add('closing');
        }
        
        fragment.appendChild(charElement);
    }
    
    expressionDisplay.appendChild(fragment);
}

function isOpeningBracket(char) {
    return char === '(' || char === '{' || char === '[';
}

function isClosingBracket(char) {
    return char === ')' || char === '}' || char === ']';
}

function getMatchingBracket(char) {
    const bracketPairs = {
        '(': ')',
        '{': '}',
        '[': ']',
        ')': '(',
        '}': '{',
        ']': '['
    };
    
    return bracketPairs[char] || null;
}

function highlightChar(index, className) {
    const charElement = document.querySelector(`.char-item[data-index="${index}"]`);
    
    if (charElement) {
        // Remove existing highlight classes
        charElement.classList.remove('current', 'matching', 'error');
        
        // Add new highlight class
        if (className) {
            charElement.classList.add(className);
        }
        
        // Scroll to ensure the character is visible
        charElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function markCharAsProcessed(index) {
    const charElement = document.querySelector(`.char-item[data-index="${index}"]`);
    
    if (charElement) {
        charElement.classList.add('processed');
    }
}

// Stack Operations
function pushToStack(char, type = 'opening') {
    const stackItem = document.createElement('div');
    stackItem.className = 'stack-item';
    stackItem.classList.add(type);
    stackItem.textContent = char;
    stackItem.setAttribute('data-char', char);
    
    // Insert at the beginning (top of the stack)
    if (stackDisplay.firstChild && stackDisplay.firstChild.className !== 'stack-bottom') {
        stackDisplay.insertBefore(stackItem, stackDisplay.firstChild);
    } else {
        stackDisplay.insertBefore(stackItem, stackDisplay.querySelector('.stack-bottom'));
    }
    
    stack.push(char);
}

async function popFromStack(expectedChar = null, type = 'matching') {
    if (stack.length === 0) return null;
    
    const poppedChar = stack.pop();
    const stackItem = stackDisplay.firstChild;
    
    if (stackItem && stackItem.className !== 'stack-bottom') {
        if (expectedChar && poppedChar !== expectedChar) {
            stackItem.classList.add('error');
            await sleep(animationSpeed / 2);
        } else {
            stackItem.classList.add(type);
        }
        
        stackItem.classList.add('popping');
        await sleep(animationSpeed);
        stackItem.remove();
    }
    
    return poppedChar;
}

// Visualization Functions
async function checkParenthesisCompleteness() {
    const expression = expressionInput.value;
    stack = [];
    isExpressionValid = true;
    
    updateCurrentStep('Starting parenthesis check...');
    addStep('Initializing empty stack');
    
    for (currentIndex = 0; currentIndex < expression.length; currentIndex++) {
        const currentChar = expression[currentIndex];
        
        // Highlight current character
        highlightChar(currentIndex, 'current');
        updateCharInfo(currentChar);
        
        await sleep(animationSpeed);
        
        if (isOpeningBracket(currentChar)) {
            // Process opening bracket
            updateCurrentStep(`Found opening bracket '${currentChar}' at index ${currentIndex}`, 'opening');
            addStep(`Pushing '${currentChar}' onto the stack`, 'opening');
            updateCharStatus('opening', `Opening Bracket: '${currentChar}'`);
            
            pushToStack(currentChar, 'opening');
            await sleep(animationSpeed);
            
        } else if (isClosingBracket(currentChar)) {
            // Process closing bracket
            updateCurrentStep(`Found closing bracket '${currentChar}' at index ${currentIndex}`, 'closing');
            updateCharStatus('closing', `Closing Bracket: '${currentChar}'`);
            
            if (stack.length === 0) {
                // Stack is empty, no matching opening bracket
                addStep(`Error: No matching opening bracket for '${currentChar}'`, 'error');
                updateCharStatus('error', 'Error: Stack Empty');
                highlightChar(currentIndex, 'error');
                isExpressionValid = false;
                await sleep(animationSpeed);
                break;
            }
            
            const expectedOpeningBracket = getMatchingBracket(currentChar);
            const topOfStack = stack[stack.length - 1];
            
            addStep(`Checking if top of stack '${topOfStack}' matches with '${expectedOpeningBracket}'`, 'closing');
            
            if (topOfStack === expectedOpeningBracket) {
                // Matching brackets
                addStep(`Match found! Popping '${topOfStack}' from stack`, 'matching');
                updateCharStatus('matching', 'Matching Brackets');
                highlightChar(currentIndex, 'matching');
                
                await popFromStack(expectedOpeningBracket, 'matching');
            } else {
                // Mismatched brackets
                addStep(`Error: Mismatched brackets. Expected '${expectedOpeningBracket}' but found '${topOfStack}'`, 'error');
                updateCharStatus('error', 'Error: Mismatched Brackets');
                highlightChar(currentIndex, 'error');
                
                await popFromStack(expectedOpeningBracket, 'error');
                isExpressionValid = false;
                await sleep(animationSpeed);
                break;
            }
        } else {
            // Non-bracket character, just skip
            updateCurrentStep(`Character '${currentChar}' is not a bracket, skipping`, 'info');
            addStep(`Skipping non-bracket character '${currentChar}'`, 'info');
            updateCharStatus('', 'Not a Bracket');
            await sleep(animationSpeed / 2);
        }
        
        // Mark character as processed
        markCharAsProcessed(currentIndex);
    }
    
    // Check if stack is empty at the end
    if (isExpressionValid && stack.length > 0) {
        updateCurrentStep('Error: Unmatched opening brackets remain on the stack', 'error');
        addStep(`Error: ${stack.length} unmatched opening bracket(s) remain on the stack`, 'error');
        updateCharStatus('error', 'Error: Unmatched Opening Brackets');
        isExpressionValid = false;
    }
    
    // Final result
    if (isExpressionValid) {
        updateCurrentStep('Check complete! The expression has balanced parentheses', 'success');
        addStep('Expression is valid: All brackets are properly matched and nested', 'success');
        updateCharStatus('completed', 'Valid Expression');
    } else {
        updateCurrentStep('Check complete! The expression has unbalanced parentheses', 'error');
        addStep('Expression is invalid: Brackets are not properly matched or nested', 'error');
        updateCharStatus('error', 'Invalid Expression');
    }
    
    showResult();
}

function showResult() {
    if (isExpressionValid) {
        result.textContent = 'Valid Expression: All brackets are properly matched and nested';
        result.className = 'result-content valid';
    } else {
        result.textContent = 'Invalid Expression: Brackets are not properly matched or nested';
        result.className = 'result-content invalid';
    }
}

function resetVisualization() {
    expressionDisplay.innerHTML = '';
    
    // Clear stack display but keep the stack bottom
    const stackBottom = stackDisplay.querySelector('.stack-bottom');
    stackDisplay.innerHTML = '';
    if (stackBottom) {
        stackDisplay.appendChild(stackBottom);
    }
    
    currentCharInfo.querySelector('.char-value span').textContent = '';
    updateCharStatus('', 'Not Started');
    
    currentOperation.textContent = '';
    currentStep.textContent = '';
    stepsContainer.innerHTML = '';
    result.textContent = '';
    result.className = 'result-content';
    
    stack = [];
    isExpressionValid = true;
    currentIndex = 0;
    
    setControlsState(false);
    displayExpression();
}

async function startVisualization() {
    const expression = expressionInput.value;
    
    if (!expression) {
        alert('Please enter an expression with parentheses');
        return;
    }
    
    resetVisualization();
    setControlsState(true);
    
    displayExpression();
    
    updateCurrentStep('Starting parenthesis check...');
    addStep('Initializing visualization');
    
    // Update current operation
    currentOperation.textContent = 'Checking if the expression has balanced parentheses';
    
    try {
        await checkParenthesisCompleteness();
    } catch (error) {
        console.error('Error during visualization:', error);
    } finally {
        setControlsState(false);
    }
} 