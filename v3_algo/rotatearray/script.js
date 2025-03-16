// Method explanations
const methodExplanations = {
    oneByOne: {
        title: 'One by One Rotation',
        description: 'Rotates the array by moving elements one position at a time.',
        complexity: {
            time: 'O(n × k)',
            space: 'O(1)'
        },
        bestFor: 'Best for small rotations (small k)'
    },
    reversal: {
        title: 'Reversal Algorithm',
        description: 'Reverses three parts of the array to achieve rotation.',
        complexity: {
            time: 'O(n)',
            space: 'O(1)'
        },
        bestFor: 'Best for large arrays with any k'
    },
    blockSwap: {
        title: 'Block Swap Algorithm',
        description: 'Swaps blocks of array elements to achieve rotation.',
        complexity: {
            time: 'O(n)',
            space: 'O(1)'
        },
        bestFor: 'Best for large arrays, especially when k is close to n/2'
    }
};

// Update method explanation when selection changes
document.getElementById('methodSelect').addEventListener('change', function() {
    updateMethodExplanation(this.value);
});

function updateMethodExplanation(method) {
    const explanation = methodExplanations[method];
    document.getElementById('methodExplanation').innerHTML = `
        <h4>${explanation.title}</h4>
        <p>${explanation.description}</p>
        <ul>
            <li>Time Complexity: ${explanation.complexity.time}</li>
            <li>Space Complexity: ${explanation.complexity.space}</li>
            <li>${explanation.bestFor}</li>
        </ul>
    `;
}

// Main rotation button click handler
document.getElementById('rotateButton').addEventListener('click', function() {
    const arrayInput = document.getElementById('arrayInput').value;
    const k = parseInt(document.getElementById('rotationInput').value);
    const direction = document.querySelector('input[name="direction"]:checked').value;
    const method = document.getElementById('methodSelect').value;
    
    const array = arrayInput.split(',').map(item => item.trim()).filter(item => item !== '');
    
    if (array.length === 0) {
        alert('Please enter valid array elements');
        return;
    }

    const visualization = document.getElementById('arrayVisualization');
    const subVisualization = document.getElementById('subArrayVisualization');
    const stepsContainer = document.getElementById('steps');
    const currentStepDisplay = document.getElementById('currentStep');
    const speedSlider = document.getElementById('speedSlider');
    const animationSpeed = parseInt(speedSlider.value);

    // Clear previous outputs
    visualization.innerHTML = '';
    subVisualization.innerHTML = '';
    stepsContainer.innerHTML = '';
    currentStepDisplay.innerHTML = '';

    // Initialize visualization
    initializeVisualization(array, visualization, stepsContainer);

    // Calculate effective k
    const effectiveK = direction === 'right' ? 
        k % array.length : 
        (array.length - (k % array.length)) % array.length;

    // Choose rotation method
    switch(method) {
        case 'oneByOne':
            animateOneByOne(array, effectiveK, visualization, stepsContainer, currentStepDisplay, animationSpeed, direction);
            break;
        case 'reversal':
            animateReversal(array, effectiveK, visualization, subVisualization, stepsContainer, currentStepDisplay, animationSpeed, direction);
            break;
        case 'blockSwap':
            animateBlockSwap(array, effectiveK, visualization, subVisualization, stepsContainer, currentStepDisplay, animationSpeed, direction);
            break;
    }
});

// One by One rotation method
function animateOneByOne(array, k, visualization, stepsContainer, currentStepDisplay, animationSpeed, direction) {
    let currentStep = 0;
    let rotatedArray = [...array];
    
    function rotateStep() {
        if (currentStep >= k) {
            finishRotation(rotatedArray, visualization, stepsContainer, currentStepDisplay);
            return;
        }

        currentStepDisplay.textContent = `Step ${currentStep + 1}: Rotating one position ${direction}...`;
        
        // Highlight the elements that will be moved
        const elements = visualization.getElementsByClassName('array-element');
        Array.from(elements).forEach(element => element.classList.remove('highlight', 'moving'));
        
        if (direction === 'right') {
            elements[elements.length - 1].classList.add('highlight', 'moving');
            const lastElement = rotatedArray[rotatedArray.length - 1];
            rotatedArray = [lastElement, ...rotatedArray.slice(0, -1)];
        } else {
            elements[0].classList.add('highlight', 'moving');
            const firstElement = rotatedArray[0];
            rotatedArray = [...rotatedArray.slice(1), firstElement];
        }

        // Update visualization with enhanced animation
        setTimeout(() => {
            updateVisualization(rotatedArray, visualization, direction);
            stepsContainer.innerHTML += `
                <div>Step ${currentStep + 1}: [${rotatedArray.join(', ')}]</div>
            `;
            currentStep++;
            setTimeout(rotateStep, animationSpeed);
        }, 750); // Half of the animation duration
    }

    rotateStep();
}

// Reversal Algorithm
function animateReversal(array, k, visualization, subVisualization, stepsContainer, currentStepDisplay, animationSpeed, direction) {
    let rotatedArray = [...array];
    const n = array.length;
    let step = 1;

    function reverseSubArray(arr, start, end) {
        const temp = arr.slice(start, end + 1).reverse();
        for (let i = 0; i < temp.length; i++) {
            arr[start + i] = temp[i];
        }
    }

    function animateStep() {
        switch(step) {
            case 1:
                currentStepDisplay.textContent = 'Step 1: Reversing first part of array...';
                reverseSubArray(rotatedArray, 0, k - 1);
                updateVisualizationWithHighlight(rotatedArray, visualization, 0, k - 1, 'reversed');
                break;
            case 2:
                currentStepDisplay.textContent = 'Step 2: Reversing second part of array...';
                reverseSubArray(rotatedArray, k, n - 1);
                updateVisualizationWithHighlight(rotatedArray, visualization, k, n - 1, 'reversed');
                break;
            case 3:
                currentStepDisplay.textContent = 'Step 3: Reversing entire array...';
                reverseSubArray(rotatedArray, 0, n - 1);
                updateVisualizationWithHighlight(rotatedArray, visualization, 0, n - 1, 'reversed');
                finishRotation(rotatedArray, visualization, stepsContainer, currentStepDisplay);
                return;
        }

        stepsContainer.innerHTML += `
            <div>Step ${step}: [${rotatedArray.join(', ')}]</div>
        `;

        step++;
        setTimeout(animateStep, animationSpeed);
    }

    animateStep();
}

// Block Swap Algorithm
function animateBlockSwap(array, k, visualization, subVisualization, stepsContainer, currentStepDisplay, animationSpeed, direction) {
    let rotatedArray = [...array];
    const n = array.length;
    let step = 1;

    function swapBlocks(arr, start1, start2, size) {
        for (let i = 0; i < size; i++) {
            const temp = arr[start1 + i];
            arr[start1 + i] = arr[start2 + i];
            arr[start2 + i] = temp;
        }
    }

    function animateStep() {
        if (k === 0 || k === n) {
            finishRotation(rotatedArray, visualization, stepsContainer, currentStepDisplay);
            return;
        }

        if (k <= n - k) {
            currentStepDisplay.textContent = `Step ${step}: Swapping blocks of size ${k}...`;
            swapBlocks(rotatedArray, 0, n - k, k);
            updateVisualizationWithHighlight(rotatedArray, visualization, 0, k - 1, 'swapped');
            updateVisualizationWithHighlight(rotatedArray, visualization, n - k, n - 1, 'swapped');
        } else {
            currentStepDisplay.textContent = `Step ${step}: Swapping blocks of size ${n - k}...`;
            swapBlocks(rotatedArray, 0, k, n - k);
            updateVisualizationWithHighlight(rotatedArray, visualization, 0, n - k - 1, 'swapped');
            updateVisualizationWithHighlight(rotatedArray, visualization, k, n - 1, 'swapped');
        }

        stepsContainer.innerHTML += `
            <div>Step ${step}: [${rotatedArray.join(', ')}]</div>
        `;

        if (step >= 3) {
            finishRotation(rotatedArray, visualization, stepsContainer, currentStepDisplay);
            return;
        }

        step++;
        setTimeout(animateStep, animationSpeed);
    }

    animateStep();
}

function updateVisualizationWithHighlight(array, container, start, end, className) {
    container.innerHTML = '';
    array.forEach((value, index) => {
        const element = document.createElement('div');
        element.className = 'array-element';
        
        // Add staggered animation for highlighting
        setTimeout(() => {
            if (index >= start && index <= end) {
                element.classList.add(className);
                element.classList.add('highlight');
            }
        }, index * 100);

        element.textContent = value;
        element.setAttribute('data-index', index);
        container.appendChild(element);
    });
}

function finishRotation(array, visualization, stepsContainer, currentStepDisplay) {
    // Add completion animation
    const elements = visualization.getElementsByClassName('array-element');
    Array.from(elements).forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('highlight');
            setTimeout(() => element.classList.remove('highlight'), 500);
        }, index * 100);
    });

    currentStepDisplay.textContent = `✨ Rotation complete! Final array: [${array.join(', ')}]`;
    stepsContainer.innerHTML += `
        <div style="color: #34a853; font-weight: bold;">✓ Rotation complete!</div>
        <div>Final array: [${array.join(', ')}]</div>
    `;
    
    setTimeout(() => {
        updateVisualization(array, visualization);
    }, 1000);
}

// Speed slider event listener
document.getElementById('speedSlider').addEventListener('input', function() {
    const speedValueDisplay = document.getElementById('speedValue');
    speedValueDisplay.textContent = `${this.value} ms`;
});

function initializeVisualization(array, visualization, stepsContainer) {
    // Display initial state
    stepsContainer.innerHTML = `
        <div>1. Initial array: [${array.join(', ')}]</div>
    `;

    // Create initial array elements
    array.forEach((value, index) => {
        const element = document.createElement('div');
        element.className = 'array-element';
        element.textContent = value;
        element.setAttribute('data-index', index);
        visualization.appendChild(element);
    });
}

function updateVisualization(array, container, direction) {
    // Store current elements
    const elements = container.getElementsByClassName('array-element');
    
    // Remove any existing animation classes
    Array.from(elements).forEach(element => {
        element.classList.remove('slide-right', 'slide-left', 'moving');
    });

    // Add animation classes with staggered delay
    Array.from(elements).forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('moving');
            element.classList.add(direction === 'right' ? 'slide-right' : 'slide-left');
        }, index * 100); // Stagger the animations
    });

    // Update elements after animation
    setTimeout(() => {
        container.innerHTML = '';
        array.forEach((value, index) => {
            const element = document.createElement('div');
            element.className = 'array-element';
            element.textContent = value;
            element.setAttribute('data-index', index);
            container.appendChild(element);
        });
    }, 1500); // Match the CSS animation duration
}

// Helper function to validate input
function validateArrayInput(input) {
    return input.split(',')
        .map(item => item.trim())
        .filter(item => item !== '' && !isNaN(item))
        .map(Number);
}

// Update the initial method explanation
document.addEventListener('DOMContentLoaded', function() {
    // Set initial speed value
    const speedValueDisplay = document.getElementById('speedValue');
    const speedSlider = document.getElementById('speedSlider');
    speedValueDisplay.textContent = `${speedSlider.value} ms`;
    
    // Update initial method explanation
    updateMethodExplanation('oneByOne');
}); 