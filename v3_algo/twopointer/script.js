document.addEventListener('DOMContentLoaded', function() {
    const arrayInput = document.getElementById('arrayInput');
    const targetSumInput = document.getElementById('targetSum');
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
    
    // Get input array and target sum
    const inputArray = document.getElementById('arrayInput').value
        .split(',')
        .map(num => parseInt(num.trim()))
        .filter(num => !isNaN(num));
    
    const targetSum = parseInt(document.getElementById('targetSum').value);
    const speed = parseInt(document.getElementById('speedSlider').value);
    
    // Validate input
    if (inputArray.length < 2) {
        alert('Please enter at least 2 numbers');
        setControlsState(true);
        return;
    }
    
    // Clear previous visualization
    resetVisualization();
    
    // Display initial array and target sum
    displayArray(inputArray);
    document.getElementById('targetDisplay').textContent = targetSum;
    await sleep(speed);
    
    // Initialize pointers
    let left = 0;
    let right = inputArray.length - 1;
    
    // Initialize pointers visualization
    updatePointers(left, right);
    updateCurrentStep("Starting two pointer technique with left at index 0 and right at last index");
    await sleep(speed);
    
    // Find pairs
    const foundPairs = [];
    while (left < right) {
        const currentSum = inputArray[left] + inputArray[right];
        
        // Highlight current elements
        highlightElement(left, 'left-pointer');
        highlightElement(right, 'right-pointer');
        
        // Update current pair display
        updateCurrentPair(inputArray[left], inputArray[right], currentSum);
        updateCurrentStep(`Checking sum of elements at indices ${left} (${inputArray[left]}) and ${right} (${inputArray[right]}): ${currentSum}`);
        await sleep(speed);
        
        if (currentSum === targetSum) {
            // Found a pair
            foundPairs.push([inputArray[left], inputArray[right]]);
            updateCurrentStep(`Found pair: [${inputArray[left]}, ${inputArray[right]}]`);
            
            // Highlight found pair
            highlightElement(left, 'pair-found');
            highlightElement(right, 'pair-found');
            addFoundPair(inputArray[left], inputArray[right]);
            await sleep(speed);
            
            // Move both pointers
            unhighlightElement(left);
            unhighlightElement(right);
            left++;
            right--;
        } else if (currentSum < targetSum) {
            // Sum is too small, move left pointer
            updateCurrentStep(`Sum ${currentSum} < ${targetSum}, moving left pointer`);
            unhighlightElement(left);
            left++;
        } else {
            // Sum is too large, move right pointer
            updateCurrentStep(`Sum ${currentSum} > ${targetSum}, moving right pointer`);
            unhighlightElement(right);
            right--;
        }
        
        // Update pointer positions
        updatePointers(left, right);
        await sleep(speed);
    }
    
    // Display final result
    displayResult(foundPairs);
    
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

function updatePointers(left, right) {
    const arrayContainer = document.getElementById('arrayVisualization');
    const leftPointer = document.getElementById('leftPointer');
    const rightPointer = document.getElementById('rightPointer');
    
    const elements = arrayContainer.getElementsByClassName('element');
    if (elements.length > 0) {
        const elementWidth = elements[0].offsetWidth;
        const elementMargin = 10; // gap between elements
        
        // Calculate positions
        const containerLeft = arrayContainer.getBoundingClientRect().left;
        const leftPos = elements[left].getBoundingClientRect().left - containerLeft + elementWidth/2;
        const rightPos = elements[right].getBoundingClientRect().left - containerLeft + elementWidth/2;
        
        leftPointer.style.left = `${leftPos}px`;
        rightPointer.style.left = `${rightPos}px`;
    }
}

function updateCurrentPair(leftNum, rightNum, currentSum) {
    const container = document.getElementById('pairVisualization');
    container.innerHTML = '';
    
    // Create left element
    const leftElement = document.createElement('div');
    leftElement.className = 'element left-pointer';
    leftElement.textContent = leftNum;
    container.appendChild(leftElement);
    
    // Create plus sign
    const plus = document.createElement('div');
    plus.textContent = '+';
    plus.style.margin = '0 10px';
    container.appendChild(plus);
    
    // Create right element
    const rightElement = document.createElement('div');
    rightElement.className = 'element right-pointer';
    rightElement.textContent = rightNum;
    container.appendChild(rightElement);
    
    // Create equals sign
    const equals = document.createElement('div');
    equals.textContent = '=';
    equals.style.margin = '0 10px';
    container.appendChild(equals);
    
    // Create sum
    const sumElement = document.createElement('div');
    sumElement.className = 'element';
    sumElement.textContent = currentSum;
    container.appendChild(sumElement);
    
    // Update current sum display
    document.getElementById('currentSum').textContent = currentSum;
}

function addFoundPair(leftNum, rightNum) {
    const container = document.getElementById('foundPairsVisualization');
    const pairItem = document.createElement('div');
    pairItem.className = 'pair-item';
    
    // Create left number
    const leftElement = document.createElement('div');
    leftElement.className = 'element pair-found';
    leftElement.textContent = leftNum;
    pairItem.appendChild(leftElement);
    
    // Create right number
    const rightElement = document.createElement('div');
    rightElement.className = 'element pair-found';
    rightElement.textContent = rightNum;
    pairItem.appendChild(rightElement);
    
    container.appendChild(pairItem);
}

function highlightElement(index, className) {
    const element = document.querySelector(`[data-index="${index}"]`);
    if (element) {
        element.classList.add(className);
    }
}

function unhighlightElement(index) {
    const element = document.querySelector(`[data-index="${index}"]`);
    if (element) {
        element.classList.remove('left-pointer', 'right-pointer', 'pair-found');
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
    
    // Scroll to the bottom of steps container
    stepsContainer.scrollTop = stepsContainer.scrollHeight;
}

function displayResult(pairs) {
    const result = document.getElementById('result');
    result.className = 'result-content show';
    
    if (pairs.length === 0) {
        result.innerHTML = '<p>No pairs found that sum to the target value.</p>';
    } else {
        const pairsStr = pairs.map(pair => `[${pair[0]}, ${pair[1]}]`).join(', ');
        result.innerHTML = `
            <p>Found ${pairs.length} pair${pairs.length > 1 ? 's' : ''} that sum to the target value:</p>
            <p>${pairsStr}</p>
        `;
    }
}

function resetVisualization() {
    // Clear visualizations
    document.getElementById('arrayVisualization').innerHTML = '';
    document.getElementById('pairVisualization').innerHTML = '';
    document.getElementById('foundPairsVisualization').innerHTML = '';
    document.getElementById('currentStep').textContent = '';
    document.getElementById('stepsContainer').innerHTML = '';
    document.getElementById('currentSum').textContent = '0';
    document.getElementById('targetDisplay').textContent = '0';
    
    // Reset pointers
    const leftPointer = document.getElementById('leftPointer');
    const rightPointer = document.getElementById('rightPointer');
    leftPointer.style.left = '0';
    rightPointer.style.left = '0';
    
    // Reset result
    const result = document.getElementById('result');
    result.className = 'result-content';
    result.textContent = '';
}

function setControlsState(enabled) {
    document.getElementById('arrayInput').disabled = !enabled;
    document.getElementById('targetSum').disabled = !enabled;
    document.getElementById('speedSlider').disabled = !enabled;
    document.getElementById('visualizeBtn').disabled = !enabled;
    document.getElementById('resetBtn').disabled = !enabled;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
} 