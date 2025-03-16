document.addEventListener('DOMContentLoaded', function() {
    const arrayInput = document.getElementById('arrayInput');
    const windowSizeInput = document.getElementById('windowSize');
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
    
    // Get input array and window size
    const inputArray = document.getElementById('arrayInput').value
        .split(',')
        .map(num => parseInt(num.trim()))
        .filter(num => !isNaN(num));
    
    const k = parseInt(document.getElementById('windowSize').value);
    const speed = parseInt(document.getElementById('speedSlider').value);
    
    // Validate input
    if (k > inputArray.length) {
        alert('Window size cannot be larger than array length');
        setControlsState(true);
        return;
    }
    
    // Clear previous visualization
    resetVisualization();
    
    // Display initial array
    displayArray(inputArray);
    await sleep(speed);
    
    // Initialize variables for sliding window
    let windowSum = 0;
    let maxSum = Number.MIN_SAFE_INTEGER;
    let maxStart = 0;
    
    // Calculate sum of first window
    updateCurrentStep("Calculating sum of first window");
    for (let i = 0; i < k; i++) {
        windowSum += inputArray[i];
        highlightElement(i, 'in-window');
        await sleep(speed / 2);
    }
    
    maxSum = windowSum;
    updateSums(windowSum, maxSum);
    updateWindowVisualization(inputArray, 0, k - 1);
    updateMaxWindow(inputArray, 0, k - 1);
    
    // Slide window
    for (let i = k; i < inputArray.length; i++) {
        // Remove first element of previous window
        windowSum = windowSum - inputArray[i - k];
        updateCurrentStep(`Removing ${inputArray[i - k]} from window`);
        unhighlightElement(i - k);
        await sleep(speed);
        
        // Add current element
        windowSum = windowSum + inputArray[i];
        updateCurrentStep(`Adding ${inputArray[i]} to window`);
        highlightElement(i, 'in-window');
        
        // Update window visualization
        updateWindowVisualization(inputArray, i - k + 1, i);
        updateSums(windowSum, maxSum);
        await sleep(speed);
        
        // Update maximum if necessary
        if (windowSum > maxSum) {
            maxSum = windowSum;
            maxStart = i - k + 1;
            updateCurrentStep(`New maximum sum found: ${maxSum}`);
            updateMaxWindow(inputArray, maxStart, i);
            await sleep(speed);
        }
    }
    
    // Display final result
    displayResult(maxSum, maxStart, maxStart + k - 1);
    highlightMaxWindow(maxStart, maxStart + k - 1);
    
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

function updateWindowVisualization(array, start, end) {
    const container = document.getElementById('windowVisualization');
    container.innerHTML = '';
    
    for (let i = start; i <= end; i++) {
        const element = document.createElement('div');
        element.className = 'element in-window';
        element.textContent = array[i];
        container.appendChild(element);
    }
}

function updateMaxWindow(array, start, end) {
    const container = document.getElementById('maxWindowVisualization');
    container.innerHTML = '';
    
    for (let i = start; i <= end; i++) {
        const element = document.createElement('div');
        element.className = 'element max-window';
        element.textContent = array[i];
        container.appendChild(element);
    }
}

function highlightElement(index, className = 'current') {
    const element = document.querySelector(`[data-index="${index}"]`);
    if (element) {
        element.classList.add(className);
    }
}

function unhighlightElement(index) {
    const element = document.querySelector(`[data-index="${index}"]`);
    if (element) {
        element.classList.remove('in-window', 'current');
    }
}

function highlightMaxWindow(start, end) {
    const elements = document.querySelectorAll('.array-elements .element');
    elements.forEach((el, index) => {
        if (index >= start && index <= end) {
            el.classList.add('max-window');
        }
    });
}

function updateSums(windowSum, maxSum) {
    document.getElementById('windowSum').textContent = windowSum;
    document.getElementById('maxSum').textContent = maxSum;
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

function displayResult(maxSum, start, end) {
    const result = document.getElementById('result');
    result.className = 'result-content show';
    result.innerHTML = `
        <p>Maximum Sum: ${maxSum}</p>
        <p>Window Position: [${start}, ${end}]</p>
    `;
}

function resetVisualization() {
    // Clear visualizations
    document.getElementById('arrayVisualization').innerHTML = '';
    document.getElementById('windowVisualization').innerHTML = '';
    document.getElementById('maxWindowVisualization').innerHTML = '';
    document.getElementById('currentStep').textContent = '';
    document.getElementById('stepsContainer').innerHTML = '';
    document.getElementById('windowSum').textContent = '0';
    document.getElementById('maxSum').textContent = '0';
    
    // Reset result
    const result = document.getElementById('result');
    result.className = 'result-content';
    result.textContent = '';
}

function setControlsState(enabled) {
    document.getElementById('arrayInput').disabled = !enabled;
    document.getElementById('windowSize').disabled = !enabled;
    document.getElementById('speedSlider').disabled = !enabled;
    document.getElementById('visualizeBtn').disabled = !enabled;
    document.getElementById('resetBtn').disabled = !enabled;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
} 