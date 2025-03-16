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
    
    // Initialize variables for Kadane's algorithm
    let currentSum = 0;
    let maxSum = inputArray[0];
    let start = 0;
    let end = 0;
    let tempStart = 0;
    
    // Update initial state
    updateSums(currentSum, maxSum);
    updateCurrentStep("Starting Kadane's Algorithm");
    await sleep(speed);
    
    // Kadane's algorithm with visualization
    for (let i = 0; i < inputArray.length; i++) {
        // Highlight current element
        highlightElement(i);
        
        // Update current sum
        if (currentSum + inputArray[i] > inputArray[i]) {
            currentSum = currentSum + inputArray[i];
            updateCurrentStep(`Adding ${inputArray[i]} to current sum: ${currentSum}`);
        } else {
            currentSum = inputArray[i];
            tempStart = i;
            updateCurrentStep(`Starting new subarray at index ${i} with value ${inputArray[i]}`);
        }
        
        // Update window visualization
        updateWindowVisualization(inputArray, tempStart, i);
        updateSums(currentSum, maxSum);
        await sleep(speed);
        
        // Update maximum sum if necessary
        if (currentSum > maxSum) {
            maxSum = currentSum;
            start = tempStart;
            end = i;
            updateCurrentStep(`New maximum sum found: ${maxSum} from index ${start} to ${end}`);
            updateMaxSubarray(inputArray, start, end);
        }
        
        await sleep(speed);
    }
    
    // Display final result
    displayResult(maxSum, start, end);
    highlightMaxSubarray(start, end);
    
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
        element.className = 'element included';
        element.textContent = array[i];
        container.appendChild(element);
    }
}

function updateMaxSubarray(array, start, end) {
    const container = document.getElementById('maxSubarrayVisualization');
    container.innerHTML = '';
    
    for (let i = start; i <= end; i++) {
        const element = document.createElement('div');
        element.className = 'element max-subarray';
        element.textContent = array[i];
        container.appendChild(element);
    }
}

function highlightElement(index) {
    // Reset all elements
    const elements = document.querySelectorAll('.array-elements .element');
    elements.forEach(el => el.classList.remove('current'));
    
    // Highlight current element
    const currentElement = document.querySelector(`.array-elements [data-index="${index}"]`);
    if (currentElement) {
        currentElement.classList.add('current');
    }
}

function highlightMaxSubarray(start, end) {
    const elements = document.querySelectorAll('.array-elements .element');
    elements.forEach((el, index) => {
        if (index >= start && index <= end) {
            el.classList.add('max-subarray');
        }
    });
}

function updateSums(currentSum, maxSum) {
    document.getElementById('currentSum').textContent = currentSum;
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
        <p>Maximum Subarray Sum: ${maxSum}</p>
        <p>Subarray Indices: [${start}, ${end}]</p>
    `;
}

function resetVisualization() {
    // Clear visualizations
    document.getElementById('arrayVisualization').innerHTML = '';
    document.getElementById('windowVisualization').innerHTML = '';
    document.getElementById('maxSubarrayVisualization').innerHTML = '';
    document.getElementById('currentStep').textContent = '';
    document.getElementById('stepsContainer').innerHTML = '';
    document.getElementById('currentSum').textContent = '0';
    document.getElementById('maxSum').textContent = '0';
    
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