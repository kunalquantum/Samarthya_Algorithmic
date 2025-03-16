document.getElementById('checkButton').addEventListener('click', function() {
    const string1 = document.getElementById('string1').value.toLowerCase().replace(/[^a-z0-9]/g, '');
    const string2 = document.getElementById('string2').value.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const viz1 = document.querySelector('#string1Viz .viz-content');
    const viz2 = document.querySelector('#string2Viz .viz-content');
    const stepsContainer = document.getElementById('steps');
    const currentStepDisplay = document.getElementById('currentStep');

    // Clear previous outputs
    viz1.innerHTML = '';
    viz2.innerHTML = '';
    stepsContainer.innerHTML = '';
    currentStepDisplay.innerHTML = '';

    // Get animation speed from slider
    const speedSlider = document.getElementById('speedSlider');
    const animationSpeed = parseInt(speedSlider.value);

    // Initialize the visualization
    initializeVisualization(string1, string2, viz1, viz2, stepsContainer);

    // Start the animation
    animateAnagramCheck(string1, string2, viz1, viz2, stepsContainer, currentStepDisplay, animationSpeed);
});

document.getElementById('speedSlider').addEventListener('input', function() {
    const speedValueDisplay = document.getElementById('speedValue');
    speedValueDisplay.textContent = `${this.value} ms`;
});

function initializeVisualization(str1, str2, viz1, viz2, stepsContainer) {
    // Display initial state
    stepsContainer.innerHTML = `
        <div>1. Original strings:</div>
        <div>First string: "${str1}"</div>
        <div>Second string: "${str2}"</div>
        <div>2. Checking if lengths match...</div>
    `;

    // Create initial character elements
    createCharacterElements(str1, viz1);
    createCharacterElements(str2, viz2);
}

function createCharacterElements(str, container) {
    str.split('').forEach((char, index) => {
        const element = document.createElement('div');
        element.className = 'array-element';
        element.textContent = char;
        element.setAttribute('data-index', index);
        container.appendChild(element);
    });
}

function animateAnagramCheck(str1, str2, viz1, viz2, stepsContainer, currentStepDisplay, animationSpeed) {
    // Convert strings to sorted arrays for comparison
    const arr1 = str1.split('').sort();
    const arr2 = str2.split('').sort();

    // Check if lengths match
    if (str1.length !== str2.length) {
        currentStepDisplay.textContent = "Not an anagram: Strings have different lengths!";
        highlightAllElements(viz1, viz2, 'no-match');
        stepsContainer.innerHTML += `<div>❌ Strings have different lengths (${str1.length} vs ${str2.length})</div>`;
        return;
    }

    stepsContainer.innerHTML += `<div>✓ Lengths match (${str1.length} characters)</div>`;
    stepsContainer.innerHTML += `<div>3. Sorting both strings...</div>`;

    // Animate sorting process
    let currentStep = 0;
    const interval = setInterval(() => {
        if (currentStep >= arr1.length) {
            clearInterval(interval);
            finishAnagramCheck(str1, str2, arr1, arr2, viz1, viz2, stepsContainer, currentStepDisplay);
            return;
        }

        // Update visualization for current character
        const elements1 = viz1.getElementsByClassName('array-element');
        const elements2 = viz2.getElementsByClassName('array-element');

        // Reset previous highlights
        resetHighlights(elements1);
        resetHighlights(elements2);

        // Highlight current characters being compared
        elements1[currentStep].classList.add('highlight');
        elements2[currentStep].classList.add('highlight');

        // Update current step display
        currentStepDisplay.textContent = `Comparing characters: '${arr1[currentStep]}' and '${arr2[currentStep]}'`;

        // Check if characters match
        if (arr1[currentStep] === arr2[currentStep]) {
            elements1[currentStep].classList.add('match');
            elements2[currentStep].classList.add('match');
        } else {
            elements1[currentStep].classList.add('no-match');
            elements2[currentStep].classList.add('no-match');
        }

        currentStep++;
    }, animationSpeed);
}

function finishAnagramCheck(str1, str2, arr1, arr2, viz1, viz2, stepsContainer, currentStepDisplay) {
    const isAnagram = arr1.join('') === arr2.join('');
    
    if (isAnagram) {
        currentStepDisplay.textContent = "✨ These strings are anagrams! ✨";
        stepsContainer.innerHTML += `
            <div>✓ All characters match after sorting</div>
            <div>✓ "${str1}" and "${str2}" are anagrams!</div>
        `;
        highlightAllElements(viz1, viz2, 'match');
    } else {
        currentStepDisplay.textContent = "These strings are not anagrams.";
        stepsContainer.innerHTML += `
            <div>❌ Character mismatch found</div>
            <div>❌ "${str1}" and "${str2}" are not anagrams.</div>
        `;
        highlightAllElements(viz1, viz2, 'no-match');
    }
}

function resetHighlights(elements) {
    Array.from(elements).forEach(element => {
        element.classList.remove('highlight', 'match', 'no-match');
    });
}

function highlightAllElements(viz1, viz2, className) {
    Array.from(viz1.getElementsByClassName('array-element')).forEach(element => {
        element.classList.add(className);
        element.classList.add('pulse');
    });
    Array.from(viz2.getElementsByClassName('array-element')).forEach(element => {
        element.classList.add(className);
        element.classList.add('pulse');
    });
} 