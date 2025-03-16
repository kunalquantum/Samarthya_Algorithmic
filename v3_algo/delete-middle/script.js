// DOM Elements
const stackInput = document.getElementById('stackInput');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const visualizeBtn = document.getElementById('visualizeBtn');
const resetBtn = document.getElementById('resetBtn');
const originalStackDisplay = document.getElementById('originalStackDisplay');
const workingStackDisplay = document.getElementById('workingStackDisplay');
const auxStackDisplay = document.getElementById('auxStackDisplay');
const resultStackDisplay = document.getElementById('resultStackDisplay');
const currentElementInfo = document.getElementById('currentElementInfo');
const elementStatus = document.getElementById('elementStatus');
const middleInfo = document.getElementById('middleInfo');
const currentOperation = document.getElementById('currentOperation');
const currentStep = document.getElementById('currentStep');
const stepsContainer = document.getElementById('stepsContainer');
const result = document.getElementById('result');

// Global Variables
let isVisualizing = false;
let animationSpeed = 1000;
let originalStack = [];
let workingStack = [];
let auxStack = [];
let resultStack = [];
let middleIndex = 0;
let currentCount = 0;
let recursionDepth = 0;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    updateSpeedValue();
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setControlsState(disabled) {
    stackInput.disabled = disabled;
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

function updateElementInfo(element) {
    const elementValueSpan = currentElementInfo.querySelector('.element-value span');
    elementValueSpan.textContent = element !== undefined ? element : '';
    
    // Add animation to highlight the change
    elementValueSpan.classList.remove('highlight-change');
    void elementValueSpan.offsetWidth; // Trigger reflow
    elementValueSpan.classList.add('highlight-change');
}

function updateElementStatus(status, text) {
    elementStatus.className = 'element-status';
    if (status) {
        elementStatus.classList.add(status);
    }
    const statusText = elementStatus.querySelector('.status-text');
    statusText.textContent = text;
    
    // Add animation to highlight the change
    statusText.classList.remove('highlight-change');
    void statusText.offsetWidth; // Trigger reflow
    statusText.classList.add('highlight-change');
}

function updateMiddleInfo() {
    const middleIndexSpan = middleInfo.querySelector('.middle-index span');
    const currentCountSpan = middleInfo.querySelector('.current-count span');
    
    middleIndexSpan.textContent = middleIndex;
    currentCountSpan.textContent = currentCount;
    
    // Add animation to highlight the change
    middleIndexSpan.classList.remove('highlight-change');
    currentCountSpan.classList.remove('highlight-change');
    void middleIndexSpan.offsetWidth; // Trigger reflow
    void currentCountSpan.offsetWidth; // Trigger reflow
    middleIndexSpan.classList.add('highlight-change');
    currentCountSpan.classList.add('highlight-change');
}

// Stack Operations
function parseStackInput() {
    const input = stackInput.value.trim();
    if (!input) return [];
    
    return input.split(',').map(item => item.trim()).filter(item => item !== '');
}

function displayStack(stackArray, displayElement, clearFirst = true) {
    if (clearFirst) {
        // Clear stack display but keep the stack bottom
        const stackBottom = displayElement.querySelector('.stack-bottom');
        displayElement.innerHTML = '';
        if (stackBottom) {
            displayElement.appendChild(stackBottom);
        }
    }
    
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < stackArray.length; i++) {
        const stackItem = document.createElement('div');
        stackItem.className = 'stack-item';
        stackItem.textContent = stackArray[i];
        stackItem.setAttribute('data-index', i);
        
        // Add index indicator
        const indexSpan = document.createElement('span');
        indexSpan.className = 'index';
        indexSpan.textContent = i;
        stackItem.appendChild(indexSpan);
        
        fragment.appendChild(stackItem);
    }
    
    // Insert before the stack bottom
    const stackBottom = displayElement.querySelector('.stack-bottom');
    if (stackBottom) {
        displayElement.insertBefore(fragment, stackBottom);
    } else {
        displayElement.appendChild(fragment);
    }
}

async function pushToStack(element, stackArray, displayElement, className = 'push') {
    stackArray.push(element);
    
    const stackItem = document.createElement('div');
    stackItem.className = `stack-item ${className}`;
    stackItem.textContent = element;
    stackItem.setAttribute('data-index', stackArray.length - 1);
    
    // Add index indicator
    const indexSpan = document.createElement('span');
    indexSpan.className = 'index';
    indexSpan.textContent = stackArray.length - 1;
    stackItem.appendChild(indexSpan);
    
    // Insert before the stack bottom
    const stackBottom = displayElement.querySelector('.stack-bottom');
    if (stackBottom) {
        displayElement.insertBefore(stackItem, stackBottom);
    } else {
        displayElement.appendChild(stackItem);
    }
    
    await sleep(animationSpeed / 2);
}

async function popFromStack(stackArray, displayElement, className = 'pop') {
    if (stackArray.length === 0) return null;
    
    const poppedElement = stackArray.pop();
    const stackItem = displayElement.querySelector(`.stack-item[data-index="${stackArray.length}"]`);
    
    if (stackItem) {
        stackItem.classList.remove('push', 'middle', 'recursion');
        stackItem.classList.add(className);
        
        await sleep(animationSpeed / 2);
        
        if (className === 'pop' || className === 'skip') {
            await sleep(animationSpeed / 2);
            stackItem.remove();
        }
    }
    
    return poppedElement;
}

async function highlightStackItem(stackArray, displayElement, index, className) {
    const stackItem = displayElement.querySelector(`.stack-item[data-index="${index}"]`);
    
    if (stackItem) {
        // Remove existing highlight classes
        stackItem.classList.remove('push', 'pop', 'middle', 'skip', 'recursion');
        
        // Add new highlight class
        if (className) {
            stackItem.classList.add(className);
        }
        
        await sleep(animationSpeed / 2);
    }
}

// Visualization Functions
async function calculateMiddleIndex() {
    const stackSize = workingStack.length;
    middleIndex = Math.floor(stackSize / 2);
    
    updateCurrentStep(`Calculating middle index for stack of size ${stackSize}`, 'middle');
    addStep(`Stack size: ${stackSize}`, 'middle');
    addStep(`Middle index: ${middleIndex} (0-indexed)`, 'middle');
    
    updateMiddleInfo();
    
    await sleep(animationSpeed);
    
    // Highlight the middle element
    if (stackSize > 0) {
        await highlightStackItem(workingStack, workingStackDisplay, middleIndex, 'middle');
    }
    
    return middleIndex;
}

async function deleteMiddleRecursive(depth = 0) {
    recursionDepth = depth;
    
    // Base case: If stack is empty or has only one element
    if (workingStack.length === 0) {
        updateCurrentStep(`Base case: Stack is empty, returning from recursion depth ${depth}`, 'recursion');
        addStep(`Recursion depth ${depth}: Stack is empty, returning`, 'recursion');
        return;
    }
    
    // Pop the top element
    updateCurrentStep(`Recursion depth ${depth}: Popping element from stack`, 'pop');
    addStep(`Recursion depth ${depth}: Popping element from stack`, 'pop');
    
    updateElementStatus('pop', `Popping: Recursion Depth ${depth}`);
    const temp = await popFromStack(workingStack, workingStackDisplay);
    updateElementInfo(temp);
    
    await sleep(animationSpeed);
    
    // Push to auxiliary stack to visualize recursion
    updateCurrentStep(`Recursion depth ${depth}: Storing element in auxiliary stack`, 'recursion');
    addStep(`Recursion depth ${depth}: Storing element ${temp} in auxiliary stack`, 'recursion');
    
    updateElementStatus('recursion', `Storing: Recursion Depth ${depth}`);
    await pushToStack(temp, auxStack, auxStackDisplay, 'recursion');
    
    await sleep(animationSpeed);
    
    // Increment current count
    currentCount++;
    updateMiddleInfo();
    
    // Check if we've reached the middle element
    if (currentCount === middleIndex + 1) {
        updateCurrentStep(`Recursion depth ${depth}: Found middle element ${temp}`, 'middle');
        addStep(`Recursion depth ${depth}: Found middle element ${temp} at index ${middleIndex}`, 'middle');
        
        updateElementStatus('middle', `Middle Element: ${temp}`);
        
        // Skip the middle element (don't push it back)
        updateCurrentStep(`Recursion depth ${depth}: Skipping middle element ${temp}`, 'skip');
        addStep(`Recursion depth ${depth}: Skipping middle element ${temp}`, 'skip');
        
        updateElementStatus('skip', `Skipping Middle Element`);
        
        // Remove from auxiliary stack
        await popFromStack(auxStack, auxStackDisplay, 'skip');
        
        await sleep(animationSpeed);
    } else {
        // Recursive call to delete the middle element
        updateCurrentStep(`Recursion depth ${depth}: Making recursive call to depth ${depth + 1}`, 'recursion');
        addStep(`Recursion depth ${depth}: Making recursive call to depth ${depth + 1}`, 'recursion');
        
        await sleep(animationSpeed);
        
        // Make the recursive call
        await deleteMiddleRecursive(depth + 1);
        
        // After returning from recursion, push the current element back to the stack
        updateCurrentStep(`Recursion depth ${depth}: Returning from recursion, pushing ${temp} back to stack`, 'push');
        addStep(`Recursion depth ${depth}: Pushing ${temp} back to stack`, 'push');
        
        updateElementStatus('push', `Pushing Back: Recursion Depth ${depth}`);
        updateElementInfo(temp);
        
        // Remove from auxiliary stack
        await popFromStack(auxStack, auxStackDisplay);
        
        // Push back to working stack
        await pushToStack(temp, workingStack, workingStackDisplay);
        
        await sleep(animationSpeed);
    }
}

async function deleteMiddleElement() {
    // Reset counters
    currentCount = 0;
    recursionDepth = 0;
    
    // Calculate middle index
    await calculateMiddleIndex();
    
    // Start the recursive process
    updateCurrentStep('Starting recursive process to delete middle element', 'recursion');
    addStep('Starting recursive deletion process', 'recursion');
    
    await sleep(animationSpeed);
    
    // Call the recursive function
    await deleteMiddleRecursive();
    
    // Copy the result to the result stack
    updateCurrentStep('Copying final stack to result', 'normal');
    addStep('Copying final stack to result', 'normal');
    
    for (let i = 0; i < workingStack.length; i++) {
        await pushToStack(workingStack[i], resultStack, resultStackDisplay);
        await sleep(animationSpeed / 2);
    }
    
    // Show final result
    showResult();
}

function showResult() {
    const originalElements = originalStack.join(', ');
    const resultElements = resultStack.join(', ');
    
    result.textContent = `Original Stack: [${originalElements}] → Result Stack (Middle Element Removed): [${resultElements}]`;
    result.className = 'result-content completed';
    
    updateCurrentStep('Middle element deletion complete!', 'success');
    addStep(`Original stack: [${originalElements}]`, 'normal');
    addStep(`Result stack: [${resultElements}]`, 'success');
    updateElementStatus('completed', 'Deletion Complete');
}

function resetVisualization() {
    // Clear all stacks
    originalStack = [];
    workingStack = [];
    auxStack = [];
    resultStack = [];
    
    // Reset displays
    originalStackDisplay.innerHTML = '<div class="stack-bottom">Stack Bottom</div>';
    workingStackDisplay.innerHTML = '<div class="stack-bottom">Stack Bottom</div>';
    auxStackDisplay.innerHTML = '<div class="stack-bottom">Stack Bottom</div>';
    resultStackDisplay.innerHTML = '<div class="stack-bottom">Stack Bottom</div>';
    
    // Reset info displays
    currentElementInfo.querySelector('.element-value span').textContent = '';
    updateElementStatus('', 'Not Started');
    
    middleInfo.querySelector('.middle-index span').textContent = '0';
    middleInfo.querySelector('.current-count span').textContent = '0';
    
    // Reset operation and steps
    currentOperation.textContent = '';
    currentStep.textContent = '';
    stepsContainer.innerHTML = '';
    result.textContent = '';
    result.className = 'result-content';
    
    // Reset counters
    middleIndex = 0;
    currentCount = 0;
    recursionDepth = 0;
    
    // Enable controls
    setControlsState(false);
}

async function startVisualization() {
    const inputStack = parseStackInput();
    
    if (inputStack.length === 0) {
        alert('Please enter valid stack elements');
        return;
    }
    
    resetVisualization();
    setControlsState(true);
    
    // Initialize stacks
    originalStack = [...inputStack];
    workingStack = [...inputStack];
    
    // Display original stack
    updateCurrentStep('Initializing visualization', 'normal');
    addStep('Parsing input stack', 'normal');
    
    displayStack(originalStack, originalStackDisplay);
    displayStack(workingStack, workingStackDisplay);
    
    await sleep(animationSpeed);
    
    // Update current operation
    currentOperation.textContent = 'Deleting the middle element from the stack using recursion';
    
    try {
        await deleteMiddleElement();
    } catch (error) {
        console.error('Error during visualization:', error);
    } finally {
        setControlsState(false);
    }
} 