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
    
    // Get input array
    const inputArray = document.getElementById('arrayInput').value
        .split(',')
        .map(num => parseInt(num.trim()))
        .filter(num => !isNaN(num));
    
    const speed = parseInt(document.getElementById('speedSlider').value);
    
    // Validate input
    if (inputArray.length < 1) {
        alert('Please enter at least one number');
        setControlsState(true);
        return;
    }
    
    // Clear previous visualization
    resetVisualization();
    
    // Display initial array
    displayArray(inputArray);
    await sleep(speed);
    
    // Initialize min and max with first element
    let minIndex = 0;
    let maxIndex = 0;
    let minValue = inputArray[0];
    let maxValue = inputArray[0];
    
    // Update initial min-max display
    updateMinMax(minValue, minIndex, maxValue, maxIndex);
    highlightElement(0, 'current');
    updateCurrentElement(inputArray[0], 0);
    updateCurrentStep("Initializing min and max with first element: " + inputArray[0]);
    await sleep(speed);
    
    // Scan through array
    for (let i = 1; i < inputArray.length; i++) {
        const currentValue = inputArray[i];
        
        // Highlight current element
        unhighlightElement(i - 1);
        highlightElement(i, 'current');
        updateCurrentElement(currentValue, i);
        updateCurrentStep(`Checking element at index ${i}: ${currentValue}`);
        await sleep(speed);
        
        // Check for new minimum
        if (currentValue < minValue) {
            // Remove previous min highlight
            unhighlightElement(minIndex, 'min');
            
            // Update minimum
            minValue = currentValue;
            minIndex = i;
            updateMinMax(minValue, minIndex, maxValue, maxIndex);
            highlightElement(i, 'min');
            updateCurrentStep(`New minimum found: ${minValue} at index ${minIndex}`);
            await sleep(speed);
        }
        
        // Check for new maximum
        if (currentValue > maxValue) {
            // Remove previous max highlight
            unhighlightElement(maxIndex, 'max');
            
            // Update maximum
            maxValue = currentValue;
            maxIndex = i;
            updateMinMax(minValue, minIndex, maxValue, maxIndex);
            highlightElement(i, 'max');
            updateCurrentStep(`New maximum found: ${maxValue} at index ${maxIndex}`);
            await sleep(speed);
        }
    }
    
    // Final highlighting
    unhighlightAllElements();
    highlightElement(minIndex, 'min');
    highlightElement(maxIndex, 'max');
    
    // Display final result
    displayResult(minValue, minIndex, maxValue, maxIndex);
    
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

function updateCurrentElement(value, index) {
    const container = document.getElementById('currentElementVisualization');
    container.innerHTML = '';
    
    const element = document.createElement('div');
    element.className = 'element current';
    element.textContent = value;
    container.appendChild(element);
    
    const indexDisplay = document.createElement('div');
    indexDisplay.style.marginTop = '10px';
    indexDisplay.textContent = `Index: ${index}`;
    container.appendChild(indexDisplay);
}

function updateMinMax(minValue, minIndex, maxValue, maxIndex) {
    document.getElementById('minValue').textContent = minValue;
    document.getElementById('minPosition').textContent = minIndex;
    document.getElementById('maxValue').textContent = maxValue;
    document.getElementById('maxPosition').textContent = maxIndex;
}

function highlightElement(index, className) {
    const element = document.querySelector(`[data-index="${index}"]`);
    if (element) {
        element.classList.add(className);
    }
}

function unhighlightElement(index, className) {
    const element = document.querySelector(`[data-index="${index}"]`);
    if (element) {
        if (className) {
            element.classList.remove(className);
        } else {
            element.className = 'element';
        }
    }
}

function unhighlightAllElements() {
    const elements = document.querySelectorAll('.element');
    elements.forEach(element => {
        element.className = 'element';
    });
}

function updateCurrentStep(step) {
    const currentStep = document.getElementById('currentStep');
    currentStep.textContent = step;
    
    const stepsContainer = document.getElementById('stepsContainer');
    const stepElement = document.createElement('div');
    stepElement.className = 'step';
    stepElement.textContent = step;
    stepsContainer.appendChild(stepElement);
    
    // Scroll to the bottom of steps container
    stepsContainer.scrollTop = stepsContainer.scrollHeight;
}

function displayResult(minValue, minIndex, maxValue, maxIndex) {
    const result = document.getElementById('result');
    result.className = 'result-content show';
    result.innerHTML = `
        <p>Minimum Element: ${minValue} (at index ${minIndex})</p>
        <p>Maximum Element: ${maxValue} (at index ${maxIndex})</p>
    `;
}

function resetVisualization() {
    // Clear visualizations
    document.getElementById('arrayVisualization').innerHTML = '';
    document.getElementById('currentElementVisualization').innerHTML = '';
    document.getElementById('currentStep').textContent = '';
    document.getElementById('stepsContainer').innerHTML = '';
    
    // Reset min-max displays
    document.getElementById('minValue').textContent = '-';
    document.getElementById('minPosition').textContent = '-';
    document.getElementById('maxValue').textContent = '-';
    document.getElementById('maxPosition').textContent = '-';
    
    // Reset result
    const result = document.getElementById('result');
    result.className = 'result-content';
    result.textContent = '';
}

function setControlsState(enabled) {
    document.getElementById('arrayInput').disabled = !enabled;
    document.getElementById('speedSlider').disabled = !enabled;
    document.getElementById('visualizeBtn').disabled = !enabled;
    document.getElementById('resetBtn').disabled = !enabled;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
} 