// DOM Elements
const inputString = document.getElementById('inputString');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const visualizeBtn = document.getElementById('visualizeBtn');
const resetBtn = document.getElementById('resetBtn');
const inputDisplay = document.getElementById('inputDisplay');
const pointerDisplay = document.getElementById('pointerDisplay');
const stackDisplay = document.getElementById('stackDisplay');
const currentOperation = document.getElementById('currentOperation');
const resultPreview = document.getElementById('resultPreview');
const currentStep = document.getElementById('currentStep');
const stepsContainer = document.getElementById('stepsContainer');
const result = document.getElementById('result');

// Global Variables
let isVisualizing = false;
let animationSpeed = 1000;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    updateSpeedValue();
    displayInput();
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

// Helper Functions
function updateSpeedValue() {
    animationSpeed = parseInt(speedSlider.value);
    speedValue.textContent = `${animationSpeed} ms`;
}

function displayInput() {
    const chars = inputString.value.split('');
    inputDisplay.innerHTML = chars.map(char => 
        `<div class="character">${char}</div>`
    ).join('');
}

function updatePointer(index) {
    const chars = document.querySelectorAll('#inputDisplay .character');
    if (chars.length > 0) {
        // Remove any previous current-position class
        chars.forEach(char => char.classList.remove('current-position'));
        
        if (index >= 0 && index < chars.length) {
            // Add current-position class to the current character
            chars[index].classList.add('current-position');
            
            // Get the current character's position
            const currentChar = chars[index];
            const containerRect = inputDisplay.getBoundingClientRect();
            const charRect = currentChar.getBoundingClientRect();
            
            // Calculate the center position of the current character relative to the container
            const leftPosition = charRect.left - containerRect.left + (charRect.width / 2);
            
            // Update pointer position
            pointerDisplay.style.left = `${leftPosition}px`;
        }
    }
}

function addStep(step) {
    const stepElement = document.createElement('div');
    stepElement.className = 'step';
    stepElement.textContent = step;
    stepsContainer.appendChild(stepElement);
    stepsContainer.scrollTop = stepsContainer.scrollHeight;
}

function updateCurrentStep(step) {
    currentStep.textContent = step;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setControlsState(disabled) {
    inputString.disabled = disabled;
    speedSlider.disabled = disabled;
    visualizeBtn.disabled = disabled;
    isVisualizing = disabled;
}

// Stack Operations with Animations
async function pushToStack(char) {
    const stackItem = document.createElement('div');
    stackItem.className = 'stack-item';
    stackItem.textContent = char;
    stackDisplay.appendChild(stackItem);
    await sleep(animationSpeed / 2);
}

async function popFromStack() {
    const stackItems = stackDisplay.querySelectorAll('.stack-item');
    if (stackItems.length > 0) {
        const lastItem = stackItems[stackItems.length - 1];
        lastItem.classList.add('pop');
        await sleep(animationSpeed / 2);
        lastItem.remove();
    }
}

// Visualization Functions
async function highlightCharacter(index, type) {
    const chars = document.querySelectorAll('#inputDisplay .character');
    if (index >= 0 && index < chars.length) {
        chars[index].classList.add(type);
        await sleep(animationSpeed);
        chars[index].classList.remove(type);
    }
}

function updateResultPreview() {
    const stackItems = stackDisplay.querySelectorAll('.stack-item');
    const resultString = Array.from(stackItems).map(item => item.textContent).join('');
    resultPreview.innerHTML = resultString.split('').map(char => 
        `<div class="character">${char}</div>`
    ).join('');
}

async function showFinalResult() {
    const stackItems = stackDisplay.querySelectorAll('.stack-item');
    const resultString = Array.from(stackItems).map(item => item.textContent).join('');
    result.textContent = `Final string after removing adjacent duplicates: "${resultString}"`;
    result.classList.add('show');
}

function resetVisualization() {
    // Reset all displays
    inputDisplay.innerHTML = '';
    stackDisplay.innerHTML = '';
    currentOperation.textContent = '';
    resultPreview.innerHTML = '';
    currentStep.textContent = '';
    stepsContainer.innerHTML = '';
    result.textContent = '';
    result.classList.remove('show');
    pointerDisplay.style.left = '0';
    
    // Reset controls
    setControlsState(false);
    
    // Reset input display
    displayInput();
}

// Main Visualization Function
async function startVisualization() {
    // Validation
    if (!inputString.value.trim()) {
        alert('Please enter a string');
        return;
    }

    // Reset and setup
    resetVisualization();
    setControlsState(true);
    
    const input = inputString.value;
    let stack = [];
    
    updateCurrentStep('Starting visualization...');
    addStep('Algorithm started');
    
    // Process each character
    for (let i = 0; i < input.length; i++) {
        const currentChar = input[i];
        updatePointer(i);
        
        // Highlight current character
        await highlightCharacter(i, 'current');
        
        if (stack.length === 0) {
            // Empty stack case
            updateCurrentStep(`Stack is empty. Pushing '${currentChar}'`);
            addStep(`Pushing '${currentChar}' to empty stack`);
            stack.push(currentChar);
            await pushToStack(currentChar);
            
        } else {
            // Compare with top of stack
            const topChar = stack[stack.length - 1];
            
            if (topChar === currentChar) {
                // Found duplicate
                updateCurrentStep(`Found duplicate: '${currentChar}'. Removing both characters.`);
                addStep(`Found duplicate: '${currentChar}'. Popping from stack.`);
                await highlightCharacter(i, 'duplicate');
                stack.pop();
                await popFromStack();
                
            } else {
                // No duplicate
                updateCurrentStep(`No duplicate. Pushing '${currentChar}'`);
                addStep(`Pushing '${currentChar}' to stack`);
                stack.push(currentChar);
                await pushToStack(currentChar);
            }
        }
        
        updateResultPreview();
        await sleep(animationSpeed / 2);
    }
    
    // Finalize visualization
    updateCurrentStep('Visualization complete!');
    addStep('Algorithm completed');
    await showFinalResult();
    setControlsState(false);
} 