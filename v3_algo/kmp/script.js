document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('textInput');
    const patternInput = document.getElementById('patternInput');
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
    
    // Get input text and pattern
    const text = document.getElementById('textInput').value;
    const pattern = document.getElementById('patternInput').value;
    const speed = parseInt(document.getElementById('speedSlider').value);
    
    // Validate input
    if (!text || !pattern) {
        alert('Please enter both text and pattern');
        setControlsState(true);
        return;
    }
    
    // Clear previous visualization
    resetVisualization();
    
    // Display text and pattern
    displayText(text);
    displayPattern(pattern);
    await sleep(speed);
    
    // First phase: Compute LPS array
    updateCurrentStep("Phase 1: Computing LPS (Longest Proper Prefix which is also Suffix) array");
    const lps = await computeLPSArray(pattern, speed);
    
    // Second phase: Pattern matching using KMP
    updateCurrentStep("Phase 2: Pattern matching using KMP algorithm");
    await performKMP(text, pattern, lps, speed);
    
    // Enable controls
    setControlsState(true);
}

async function computeLPSArray(pattern, speed) {
    const lps = new Array(pattern.length).fill(0);
    displayLPSArray(pattern, lps);
    await sleep(speed);
    
    let len = 0; // Length of previous longest prefix suffix
    let i = 1;
    
    while (i < pattern.length) {
        updateCurrentStep(`Computing LPS[${i}]: Comparing '${pattern[i]}' with '${pattern[len]}'`);
        highlightLPSComparison(i, len);
        await sleep(speed);
        
        if (pattern[i] === pattern[len]) {
            len++;
            lps[i] = len;
            updateLPSValue(i, len);
            updateCurrentStep(`Match found! LPS[${i}] = ${len}`);
            i++;
            await sleep(speed);
        } else {
            if (len !== 0) {
                len = lps[len - 1];
                updateCurrentStep(`Mismatch. Falling back to len = ${len}`);
                await sleep(speed);
            } else {
                lps[i] = 0;
                updateLPSValue(i, 0);
                updateCurrentStep(`No match. LPS[${i}] = 0`);
                i++;
                await sleep(speed);
            }
        }
    }
    
    return lps;
}

async function performKMP(text, pattern, lps, speed) {
    let i = 0; // Index for text
    let j = 0; // Index for pattern
    const foundIndices = [];
    
    while (i < text.length) {
        updatePointers(i, j);
        updateCurrentStep(`Comparing text[${i}]='${text[i]}' with pattern[${j}]='${pattern[j]}'`);
        updateComparison(text.substr(i - j, pattern.length), pattern, j);
        await sleep(speed);
        
        if (text[i] === pattern[j]) {
            highlightMatch(i, j);
            updateCurrentStep(`Match found at position ${i}`);
            i++;
            j++;
            await sleep(speed);
        } else {
            highlightMismatch(i, j);
            updateCurrentStep(`Mismatch at position ${i}`);
            await sleep(speed);
            
            if (j !== 0) {
                j = lps[j - 1];
                updateCurrentStep(`Using LPS array to shift pattern. New j = ${j}`);
            } else {
                i++;
                updateCurrentStep(`Moving to next character in text`);
            }
            await sleep(speed);
        }
        
        if (j === pattern.length) {
            const foundIndex = i - j;
            foundIndices.push(foundIndex);
            highlightFound(foundIndex, pattern.length);
            updateCurrentStep(`Pattern found at index ${foundIndex}`);
            j = lps[j - 1];
            await sleep(speed);
        }
    }
    
    // Display final result
    displayResult(foundIndices);
}

function displayText(text) {
    const container = document.getElementById('textVisualization');
    container.innerHTML = '';
    
    [...text].forEach((char, index) => {
        const element = document.createElement('div');
        element.className = 'character';
        element.textContent = char;
        element.setAttribute('data-index', index);
        container.appendChild(element);
    });
}

function displayPattern(pattern) {
    const container = document.getElementById('patternVisualization');
    container.innerHTML = '';
    
    [...pattern].forEach((char, index) => {
        const element = document.createElement('div');
        element.className = 'character';
        element.textContent = char;
        element.setAttribute('data-pattern-index', index);
        container.appendChild(element);
    });
}

function displayLPSArray(pattern, lps) {
    const container = document.getElementById('lpsVisualization');
    const patternDiv = container.querySelector('.lps-pattern');
    const valuesDiv = container.querySelector('.lps-values');
    
    patternDiv.innerHTML = '';
    valuesDiv.innerHTML = '';
    
    [...pattern].forEach((char, index) => {
        const charCell = document.createElement('div');
        charCell.className = 'lps-cell';
        charCell.textContent = char;
        patternDiv.appendChild(charCell);
        
        const valueCell = document.createElement('div');
        valueCell.className = 'lps-cell';
        valueCell.textContent = lps[index];
        valueCell.setAttribute('data-lps-index', index);
        valuesDiv.appendChild(valueCell);
    });
}

function updateLPSValue(index, value) {
    const cell = document.querySelector(`[data-lps-index="${index}"]`);
    if (cell) {
        cell.textContent = value;
        cell.classList.add('current');
        setTimeout(() => cell.classList.remove('current'), 500);
    }
}

function highlightLPSComparison(i, len) {
    const patternChars = document.querySelectorAll('.lps-pattern .lps-cell');
    patternChars.forEach(cell => cell.classList.remove('current', 'match', 'mismatch'));
    
    if (i < patternChars.length && len < patternChars.length) {
        patternChars[i].classList.add('current');
        patternChars[len].classList.add('current');
    }
}

function updatePointers(textIndex, patternIndex) {
    const textPointer = document.getElementById('textPointer');
    const patternPointer = document.getElementById('patternPointer');
    
    const textChar = document.querySelector(`[data-index="${textIndex}"]`);
    const patternChar = document.querySelector(`[data-pattern-index="${patternIndex}"]`);
    
    if (textChar) {
        const textRect = textChar.getBoundingClientRect();
        const containerRect = textChar.parentElement.getBoundingClientRect();
        textPointer.style.left = `${textChar.offsetLeft + textChar.offsetWidth/2}px`;
    }
    
    if (patternChar) {
        const patternRect = patternChar.getBoundingClientRect();
        const containerRect = patternChar.parentElement.getBoundingClientRect();
        patternPointer.style.left = `${patternChar.offsetLeft + patternChar.offsetWidth/2}px`;
    }
}

function updateComparison(textSegment, pattern, currentIndex) {
    const textContainer = document.querySelector('.text-segment');
    const patternContainer = document.querySelector('.pattern-segment');
    
    textContainer.innerHTML = '';
    patternContainer.innerHTML = '';
    
    [...textSegment].forEach((char, index) => {
        const element = document.createElement('div');
        element.className = 'character';
        element.textContent = char;
        textContainer.appendChild(element);
    });
    
    [...pattern].forEach((char, index) => {
        const element = document.createElement('div');
        element.className = 'character';
        element.textContent = char;
        if (index === currentIndex) {
            element.classList.add('current');
        }
        patternContainer.appendChild(element);
    });
}

function highlightMatch(textIndex, patternIndex) {
    const textChar = document.querySelector(`[data-index="${textIndex}"]`);
    const patternChar = document.querySelector(`[data-pattern-index="${patternIndex}"]`);
    
    if (textChar) textChar.classList.add('match');
    if (patternChar) patternChar.classList.add('match');
}

function highlightMismatch(textIndex, patternIndex) {
    const textChar = document.querySelector(`[data-index="${textIndex}"]`);
    const patternChar = document.querySelector(`[data-pattern-index="${patternIndex}"]`);
    
    if (textChar) textChar.classList.add('mismatch');
    if (patternChar) patternChar.classList.add('mismatch');
    
    setTimeout(() => {
        if (textChar) textChar.classList.remove('mismatch');
        if (patternChar) patternChar.classList.remove('mismatch');
    }, 1000);
}

function highlightFound(startIndex, length) {
    for (let i = startIndex; i < startIndex + length; i++) {
        const element = document.querySelector(`[data-index="${i}"]`);
        if (element) {
            element.classList.add('found');
        }
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

function displayResult(foundIndices) {
    const result = document.getElementById('result');
    result.className = 'result-content show';
    
    if (foundIndices.length === 0) {
        result.innerHTML = '<p>Pattern not found in the text.</p>';
    } else {
        const indicesStr = foundIndices.join(', ');
        result.innerHTML = `
            <p>Pattern found at ${foundIndices.length} position${foundIndices.length > 1 ? 's' : ''}:</p>
            <p>Indices: ${indicesStr}</p>
        `;
    }
}

function resetVisualization() {
    // Clear visualizations
    document.getElementById('textVisualization').innerHTML = '';
    document.getElementById('patternVisualization').innerHTML = '';
    document.getElementById('lpsVisualization').querySelector('.lps-pattern').innerHTML = '';
    document.getElementById('lpsVisualization').querySelector('.lps-values').innerHTML = '';
    document.getElementById('currentStep').textContent = '';
    document.getElementById('stepsContainer').innerHTML = '';
    
    // Reset pointers
    const textPointer = document.getElementById('textPointer');
    const patternPointer = document.getElementById('patternPointer');
    textPointer.style.left = '0';
    patternPointer.style.left = '0';
    
    // Clear comparison display
    document.querySelector('.text-segment').innerHTML = '';
    document.querySelector('.pattern-segment').innerHTML = '';
    
    // Reset result
    const result = document.getElementById('result');
    result.className = 'result-content';
    result.textContent = '';
}

function setControlsState(enabled) {
    document.getElementById('textInput').disabled = !enabled;
    document.getElementById('patternInput').disabled = !enabled;
    document.getElementById('speedSlider').disabled = !enabled;
    document.getElementById('visualizeBtn').disabled = !enabled;
    document.getElementById('resetBtn').disabled = !enabled;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
} 