document.addEventListener('DOMContentLoaded', function() {
    const arrayInput = document.getElementById('arrayInput');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const visualizeBtn = document.getElementById('visualizeBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    // Update speed value display
    speedSlider.addEventListener('input', function() {
        speedValue.textContent = `${this.value} ms`;
    });

    // Visualization button click handler
    visualizeBtn.addEventListener('click', startVisualization);
    
    // Reset button click handler
    resetBtn.addEventListener('click', resetVisualization);
});

async function startVisualization() {
    // Disable controls during visualization
    setControlsState(false);
    
    // Get input array and speed
    const inputArray = document.getElementById('arrayInput').value
        .split(',')
        .map(num => parseInt(num.trim()))
        .filter(num => !isNaN(num));
    
    const speed = parseInt(document.getElementById('speedSlider').value);
    
    // Clear previous visualization
    resetVisualization();
    
    // Display initial array
    displayArray(inputArray);
    await sleep(speed);
    
    // First pass: Count frequencies
    const frequencyMap = new Map();
    for (let i = 0; i < inputArray.length; i++) {
        const num = inputArray[i];
        
        // Highlight current element
        highlightElement(i);
        updateCurrentStep(`Counting frequency of element: ${num}`);
        
        // Update frequency map
        frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
        displayFrequencyMap(frequencyMap);
        
        await sleep(speed);
    }
    
    // Second pass: Find first non-repeating
    let firstNonRepeating = null;
    for (let i = 0; i < inputArray.length; i++) {
        const num = inputArray[i];
        
        // Highlight current element
        highlightElement(i);
        updateCurrentStep(`Checking if ${num} appears only once`);
        
        if (frequencyMap.get(num) === 1) {
            firstNonRepeating = num;
            markNonRepeating(i);
            break;
        } else {
            markRepeating(i);
        }
        
        await sleep(speed);
    }
    
    // Display result
    displayResult(firstNonRepeating);
    
    // Enable controls
    setControlsState(true);
}

function displayArray(array) {
    const container = document.getElementById('arrayVisualization');
    container.innerHTML = '';
    
    array.forEach((num, index) => {
        const element = document.createElement('div');
        element.className = 'element';
        element.textContent = num;
        element.setAttribute('data-index', index);
        container.appendChild(element);
    });
}

function displayFrequencyMap(frequencyMap) {
    const container = document.getElementById('frequencyVisualization');
    container.innerHTML = '';
    
    frequencyMap.forEach((freq, num) => {
        const pair = document.createElement('div');
        pair.className = 'frequency-pair';
        pair.innerHTML = `${num}: ${freq}`;
        container.appendChild(pair);
    });
}

function highlightElement(index) {
    // Reset all elements
    const elements = document.querySelectorAll('.element');
    elements.forEach(el => el.classList.remove('current'));
    
    // Highlight current element
    const currentElement = document.querySelector(`[data-index="${index}"]`);
    if (currentElement) {
        currentElement.classList.add('current');
        
        // Update current element display
        const currentElementDisplay = document.getElementById('currentElement');
        currentElementDisplay.textContent = currentElement.textContent;
    }
}

function markNonRepeating(index) {
    const element = document.querySelector(`[data-index="${index}"]`);
    if (element) {
        element.classList.add('non-repeating');
    }
}

function markRepeating(index) {
    const element = document.querySelector(`[data-index="${index}"]`);
    if (element) {
        element.classList.add('repeating');
    }
}

function updateCurrentStep(step) {
    const currentStep = document.getElementById('currentStep');
    currentStep.textContent = step;
    
    const stepsContainer = document.getElementById('stepsContainer');
    const stepElement = document.createElement('div');
    stepElement.className = 'step';
    stepElement.textContent = step;
    stepsContainer.appendChild(stepElement);
}

function displayResult(number) {
    const result = document.getElementById('result');
    result.className = 'result-content show';
    
    if (number !== null) {
        result.textContent = `First non-repeating number: ${number}`;
        result.classList.add('success');
    } else {
        result.textContent = 'No non-repeating number found';
        result.classList.add('not-found');
    }
}

function resetVisualization() {
    // Clear visualizations
    document.getElementById('arrayVisualization').innerHTML = '';
    document.getElementById('frequencyVisualization').innerHTML = '';
    document.getElementById('currentElement').textContent = '';
    document.getElementById('currentStep').textContent = '';
    document.getElementById('stepsContainer').innerHTML = '';
    
    // Reset result
    const result = document.getElementById('result');
    result.className = 'result-content';
    result.textContent = '';
}

function setControlsState(enabled) {
    document.getElementById('arrayInput').disabled = !enabled;
    document.getElementById('speedSlider').disabled = !enabled;
    document.getElementById('visualizeBtn').disabled = !enabled;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
} 