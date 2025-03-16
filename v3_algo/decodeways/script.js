// DOM Elements
const inputString = document.getElementById('inputString');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const visualizeBtn = document.getElementById('visualizeBtn');
const resetBtn = document.getElementById('resetBtn');
const inputDisplay = document.getElementById('inputDisplay');
const pointerDisplay = document.getElementById('pointerDisplay');
const dpTable = document.getElementById('dpTable');
const currentDecodings = document.getElementById('currentDecodings');
const currentOperation = document.getElementById('currentOperation');
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

inputString.addEventListener('input', () => {
    displayInput();
});

// Helper Functions
function updateSpeedValue() {
    animationSpeed = parseInt(speedSlider.value);
    speedValue.textContent = `${animationSpeed} ms`;
}

function displayInput() {
    const digits = inputString.value.split('');
    inputDisplay.innerHTML = digits.map(digit => 
        `<div class="digit">${digit}</div>`
    ).join('');
}

function updatePointer(index) {
    const digits = document.querySelectorAll('#inputDisplay .digit');
    if (digits.length > 0) {
        // Remove any previous current-position class
        digits.forEach(digit => digit.classList.remove('current-position'));
        
        if (index >= 0 && index < digits.length) {
            // Add current-position class to the current digit
            digits[index].classList.add('current-position');
            
            // Get the current digit's position
            const currentDigit = digits[index];
            const containerRect = inputDisplay.getBoundingClientRect();
            const digitRect = currentDigit.getBoundingClientRect();
            
            // Calculate the center position of the current digit relative to the container
            const leftPosition = digitRect.left - containerRect.left + (digitRect.width / 2);
            
            // Update pointer position
            pointerDisplay.style.left = `${leftPosition}px`;
        }
    }
}

function initializeDPTable(length) {
    dpTable.innerHTML = '';
    for (let i = 0; i <= length; i++) {
        const cell = document.createElement('div');
        cell.className = 'dp-cell';
        cell.innerHTML = `
            <div class="dp-value">0</div>
            <div class="dp-index">${i}</div>
        `;
        dpTable.appendChild(cell);
    }
}

async function updateDPCell(index, value, type = '') {
    const cells = dpTable.querySelectorAll('.dp-cell');
    if (index >= 0 && index < cells.length) {
        const valueDiv = cells[index].querySelector('.dp-value');
        
        // Remove previous animation classes
        valueDiv.classList.remove('current', 'updated');
        
        // Add new animation class
        if (type) {
            valueDiv.classList.add(type);
        }
        
        valueDiv.textContent = value;
        await sleep(animationSpeed / 2);
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

async function highlightDigits(index, count, type) {
    const digits = document.querySelectorAll('#inputDisplay .digit');
    for (let i = index; i < index + count && i < digits.length; i++) {
        digits[i].classList.add(type);
    }
    await sleep(animationSpeed);
    for (let i = index; i < index + count && i < digits.length; i++) {
        digits[i].classList.remove(type);
    }
}

function updateDecodings(decodings) {
    currentDecodings.innerHTML = decodings.map(decoding => 
        `<div class="decoding">${decoding}</div>`
    ).join('');
}

function showResult(ways) {
    result.textContent = `Total number of ways to decode: ${ways}`;
    result.classList.add('show');
}

function resetVisualization() {
    // Reset all displays
    inputDisplay.innerHTML = '';
    dpTable.innerHTML = '';
    currentDecodings.innerHTML = '';
    currentOperation.textContent = '';
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
    // Input validation
    const input = inputString.value.trim();
    if (!input || !/^\d+$/.test(input)) {
        alert('Please enter a valid string of digits');
        return;
    }

    // Reset and setup
    resetVisualization();
    setControlsState(true);
    
    const s = input;
    const n = s.length;
    
    // Initialize DP table
    initializeDPTable(n);
    updateCurrentStep('Starting visualization...');
    addStep('Initializing DP table');
    
    // Base case
    if (s[0] === '0') {
        await updateDPCell(0, 0, 'current');
        updateCurrentStep('First digit is 0, no valid decodings possible');
        addStep('First digit is 0, setting dp[0] = 0');
        showResult(0);
        setControlsState(false);
        return;
    }
    
    // dp[0] = 1 for first digit
    await updateDPCell(0, 1, 'updated');
    updateCurrentStep('Setting dp[0] = 1 for first digit');
    addStep('First digit is valid, setting dp[0] = 1');
    
    // Process first two digits if available
    if (n >= 2) {
        const twoDigits = parseInt(s.substring(0, 2));
        let ways = 0;
        
        // Single digit case
        if (s[1] !== '0') {
            ways += 1;
            await highlightDigits(1, 1, 'valid');
            addStep(`Second digit ${s[1]} can be decoded individually`);
        }
        
        // Two digits case
        if (twoDigits >= 10 && twoDigits <= 26) {
            ways += 1;
            await highlightDigits(0, 2, 'valid');
            addStep(`First two digits ${twoDigits} can be decoded as one letter`);
        }
        
        await updateDPCell(1, ways, 'updated');
        updateCurrentStep(`Setting dp[1] = ${ways}`);
    }
    
    // Process rest of the string
    for (let i = 2; i <= n; i++) {
        updatePointer(i - 1);
        await updateDPCell(i, 0, 'current');
        let ways = 0;
        
        // Single digit case
        if (s[i - 1] !== '0') {
            await highlightDigits(i - 1, 1, 'valid');
            ways += parseInt(dpTable.children[i - 1].querySelector('.dp-value').textContent);
            updateCurrentStep(`Adding dp[${i-1}] for single digit ${s[i-1]}`);
            addStep(`Single digit ${s[i-1]} is valid, adding ${ways} ways`);
        }
        
        // Two digits case
        const twoDigits = parseInt(s.substring(i - 2, i));
        if (twoDigits >= 10 && twoDigits <= 26) {
            await highlightDigits(i - 2, 2, 'valid');
            ways += parseInt(dpTable.children[i - 2].querySelector('.dp-value').textContent);
            updateCurrentStep(`Adding dp[${i-2}] for two digits ${twoDigits}`);
            addStep(`Two digits ${twoDigits} is valid, adding ${parseInt(dpTable.children[i - 2].querySelector('.dp-value').textContent)} ways`);
        }
        
        await updateDPCell(i, ways, 'updated');
        updateCurrentStep(`Setting dp[${i}] = ${ways}`);
        await sleep(animationSpeed);
    }
    
    // Show final result
    const finalWays = parseInt(dpTable.children[n].querySelector('.dp-value').textContent);
    updateCurrentStep('Visualization complete!');
    addStep(`Final number of ways: ${finalWays}`);
    showResult(finalWays);
    setControlsState(false);
} 