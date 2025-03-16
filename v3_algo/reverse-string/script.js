// DOM Elements
const stringInput = document.getElementById('stringInput');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const visualizeBtn = document.getElementById('visualizeBtn');
const resetBtn = document.getElementById('resetBtn');
const originalStringDisplay = document.getElementById('originalStringDisplay');
const stackDisplay = document.getElementById('stackDisplay');
const reversedStringDisplay = document.getElementById('reversedStringDisplay');
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
let currentIndex = 0;
let reversedString = '';

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    updateSpeedValue();
    displayOriginalString();
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

stringInput.addEventListener('input', () => {
    displayOriginalString();
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
    stringInput.disabled = disabled;
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
function displayOriginalString() {
    originalStringDisplay.innerHTML = '';
    
    const inputString = stringInput.value;
    if (!inputString) return;
    
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < inputString.length; i++) {
        const charElement = document.createElement('div');
        charElement.className = 'char-item';
        charElement.textContent = inputString[i];
        charElement.setAttribute('data-index', i);
        
        // Add index number
        const indexSpan = document.createElement('span');
        indexSpan.className = 'char-index';
        indexSpan.textContent = i;
        charElement.appendChild(indexSpan);
        
        fragment.appendChild(charElement);
    }
    
    originalStringDisplay.appendChild(fragment);
}

function highlightOriginalChar(index, className) {
    const charElement = document.querySelector(`#originalStringDisplay .char-item[data-index="${index}"]`);
    
    if (charElement) {
        // Remove existing highlight classes
        charElement.classList.remove('current', 'push', 'processed');
        
        // Add new highlight class
        if (className) {
            charElement.classList.add(className);
        }
        
        // Scroll to ensure the character is visible
        charElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function markOriginalCharAsProcessed(index) {
    const charElement = document.querySelector(`#originalStringDisplay .char-item[data-index="${index}"]`);
    
    if (charElement) {
        charElement.classList.add('processed');
    }
}

// Stack Operations
function pushToStack(char) {
    const stackItem = document.createElement('div');
    stackItem.className = 'stack-item push';
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

async function popFromStack() {
    if (stack.length === 0) return null;
    
    const poppedChar = stack.pop();
    const stackItem = stackDisplay.firstChild;
    
    if (stackItem && stackItem.className !== 'stack-bottom') {
        stackItem.classList.remove('push');
        stackItem.classList.add('pop');
        
        await sleep(animationSpeed / 2);
        
        stackItem.classList.add('popping');
        await sleep(animationSpeed);
        stackItem.remove();
    }
    
    return poppedChar;
}

// Add character to reversed string
function addToReversedString(char) {
    const charElement = document.createElement('div');
    charElement.className = 'char-item result appear';
    charElement.textContent = char;
    
    // Add to the end of the reversed string
    reversedStringDisplay.appendChild(charElement);
    
    // Update the reversed string
    reversedString += char;
}

// Visualization Functions
async function reverseString() {
    const inputString = stringInput.value;
    stack = [];
    reversedString = '';
    
    updateCurrentStep('Starting string reversal...');
    addStep('Initializing empty stack');
    
    // Phase 1: Push all characters onto the stack
    updateCurrentStep('Phase 1: Pushing all characters onto the stack', 'push');
    addStep('Starting to push characters onto the stack', 'push');
    
    for (currentIndex = 0; currentIndex < inputString.length; currentIndex++) {
        const currentChar = inputString[currentIndex];
        
        // Highlight current character
        highlightOriginalChar(currentIndex, 'current');
        updateCharInfo(currentChar);
        
        await sleep(animationSpeed / 2);
        
        // Push character onto stack
        updateCurrentStep(`Pushing character '${currentChar}' at index ${currentIndex} onto the stack`, 'push');
        addStep(`Pushing '${currentChar}' onto the stack`, 'push');
        updateCharStatus('push', `Pushing: '${currentChar}'`);
        
        highlightOriginalChar(currentIndex, 'push');
        pushToStack(currentChar);
        
        await sleep(animationSpeed);
        
        // Mark character as processed
        markOriginalCharAsProcessed(currentIndex);
    }
    
    // Phase 2: Pop all characters from the stack to form the reversed string
    updateCurrentStep('Phase 2: Popping characters from the stack to form the reversed string', 'pop');
    addStep('Starting to pop characters from the stack', 'pop');
    
    let popIndex = 0;
    while (stack.length > 0) {
        updateCharStatus('pop', 'Popping from stack');
        
        // Pop character from stack
        const poppedChar = await popFromStack();
        
        if (poppedChar) {
            updateCurrentStep(`Popped character '${poppedChar}' from the stack`, 'pop');
            addStep(`Popped '${poppedChar}' from the stack`, 'pop');
            updateCharInfo(poppedChar);
            
            await sleep(animationSpeed / 2);
            
            // Add to reversed string
            updateCurrentStep(`Adding '${poppedChar}' to the reversed string at position ${popIndex}`, 'result');
            addStep(`Adding '${poppedChar}' to the reversed string`, 'result');
            updateCharStatus('result', `Adding to Result: '${poppedChar}'`);
            
            addToReversedString(poppedChar);
            
            await sleep(animationSpeed);
            
            popIndex++;
        }
    }
    
    // Final result
    updateCurrentStep('String reversal complete!', 'success');
    addStep(`Original string: "${inputString}"`, 'normal');
    addStep(`Reversed string: "${reversedString}"`, 'success');
    updateCharStatus('completed', 'Reversal Complete');
    
    showResult();
}

function showResult() {
    result.textContent = `Original: "${stringInput.value}" → Reversed: "${reversedString}"`;
    result.className = 'result-content completed';
}

function resetVisualization() {
    originalStringDisplay.innerHTML = '';
    reversedStringDisplay.innerHTML = '';
    
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
    reversedString = '';
    currentIndex = 0;
    
    setControlsState(false);
    displayOriginalString();
}

async function startVisualization() {
    const inputString = stringInput.value;
    
    if (!inputString) {
        alert('Please enter a string to reverse');
        return;
    }
    
    resetVisualization();
    setControlsState(true);
    
    displayOriginalString();
    
    updateCurrentStep('Starting string reversal...');
    addStep('Initializing visualization');
    
    // Update current operation
    currentOperation.textContent = 'Reversing the string using a stack';
    
    try {
        await reverseString();
    } catch (error) {
        console.error('Error during visualization:', error);
    } finally {
        setControlsState(false);
    }
} 