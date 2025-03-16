document.addEventListener('DOMContentLoaded', function() {
    const string1Input = document.getElementById('string1');
    const string2Input = document.getElementById('string2');
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
    
    // Get input strings
    const string1 = document.getElementById('string1').value;
    const string2 = document.getElementById('string2').value;
    const speed = parseInt(document.getElementById('speedSlider').value);
    
    // Validate input
    if (!string1 || !string2) {
        alert('Please enter both strings');
        setControlsState(true);
        return;
    }
    
    // Clear previous visualization
    resetVisualization();
    
    // Display strings
    displayStrings(string1, string2);
    await sleep(speed);
    
    // Initialize DP table
    const dp = await initializeDPTable(string1, string2, speed);
    
    // Fill DP table
    await fillDPTable(string1, string2, dp, speed);
    
    // Construct transformation sequence
    await constructTransformation(string1, string2, dp, speed);
    
    // Enable controls
    setControlsState(true);
}

function displayStrings(string1, string2) {
    const string1Display = document.getElementById('string1Display');
    const string2Display = document.getElementById('string2Display');
    
    string1Display.innerHTML = '';
    string2Display.innerHTML = '';
    
    [...string1].forEach(char => {
        const element = document.createElement('div');
        element.className = 'character';
        element.textContent = char;
        string1Display.appendChild(element);
    });
    
    [...string2].forEach(char => {
        const element = document.createElement('div');
        element.className = 'character';
        element.textContent = char;
        string2Display.appendChild(element);
    });
}

async function initializeDPTable(string1, string2, speed) {
    const dpTable = document.getElementById('dpTable');
    dpTable.innerHTML = '';
    
    // Create DP array
    const m = string1.length;
    const n = string2.length;
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
    
    // Create header row
    const headerRow = document.createElement('div');
    headerRow.className = 'dp-row';
    
    // Empty corner cell
    const cornerCell = document.createElement('div');
    cornerCell.className = 'dp-cell header';
    cornerCell.textContent = '';
    headerRow.appendChild(cornerCell);
    
    // String2 characters
    ['', ...string2].forEach(char => {
        const cell = document.createElement('div');
        cell.className = 'dp-cell header';
        cell.textContent = char;
        headerRow.appendChild(cell);
    });
    
    dpTable.appendChild(headerRow);
    
    // Create rows for string1
    for (let i = 0; i <= m; i++) {
        const row = document.createElement('div');
        row.className = 'dp-row';
        
        // Add string1 character as header
        const headerCell = document.createElement('div');
        headerCell.className = 'dp-cell header';
        headerCell.textContent = i === 0 ? '' : string1[i - 1];
        row.appendChild(headerCell);
        
        // Add cells for DP values
        for (let j = 0; j <= n; j++) {
            const cell = document.createElement('div');
            cell.className = 'dp-cell';
            cell.setAttribute('data-i', i);
            cell.setAttribute('data-j', j);
            
            // Initialize first row and column
            if (i === 0) {
                dp[i][j] = j;
                updateCurrentStep(`Initializing first row: cost of inserting ${j} characters`);
            } else if (j === 0) {
                dp[i][j] = i;
                updateCurrentStep(`Initializing first column: cost of deleting ${i} characters`);
            }
            
            cell.textContent = dp[i][j];
            row.appendChild(cell);
            
            if (i === 0 || j === 0) {
                cell.classList.add('calculated');
                await sleep(speed / 4);
            }
        }
        
        dpTable.appendChild(row);
    }
    
    return dp;
}

async function fillDPTable(string1, string2, dp, speed) {
    const m = string1.length;
    const n = string2.length;
    
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            // Highlight current cells being compared
            highlightCurrentComparison(i, j, string1, string2);
            updateCurrentStep(`Comparing '${string1[i-1]}' with '${string2[j-1]}'`);
            await sleep(speed);
            
            const insertCost = dp[i][j-1] + 1;
            const deleteCost = dp[i-1][j] + 1;
            const replaceCost = dp[i-1][j-1] + (string1[i-1] === string2[j-1] ? 0 : 1);
            
            // Show costs
            updateCurrentOperationInfo(insertCost, deleteCost, replaceCost, string1[i-1] === string2[j-1]);
            await sleep(speed);
            
            // Calculate minimum cost
            dp[i][j] = Math.min(insertCost, deleteCost, replaceCost);
            
            // Update cell value with animation
            updateDPCell(i, j, dp[i][j]);
            await sleep(speed);
        }
    }
}

async function constructTransformation(string1, string2, dp, speed) {
    const m = string1.length;
    const n = string2.length;
    let i = m;
    let j = n;
    const transformations = [];
    
    updateCurrentStep('Constructing transformation sequence by backtracking through the DP table');
    await sleep(speed);
    
    while (i > 0 || j > 0) {
        highlightDPCell(i, j, 'path');
        
        if (i > 0 && j > 0 && string1[i-1] === string2[j-1]) {
            // Characters match, no operation needed
            highlightCharacters(i-1, j-1, 'match');
            updateCurrentStep(`Characters match: '${string1[i-1]}'`);
            i--;
            j--;
        } else {
            const insertCost = j > 0 ? dp[i][j-1] + 1 : Infinity;
            const deleteCost = i > 0 ? dp[i-1][j] + 1 : Infinity;
            const replaceCost = (i > 0 && j > 0) ? dp[i-1][j-1] + 1 : Infinity;
            
            if (i > 0 && j > 0 && replaceCost <= insertCost && replaceCost <= deleteCost) {
                // Replace operation
                transformations.unshift({
                    type: 'replace',
                    from: string1[i-1],
                    to: string2[j-1],
                    position: i-1
                });
                highlightCharacters(i-1, j-1, 'replace');
                updateCurrentStep(`Replace '${string1[i-1]}' with '${string2[j-1]}'`);
                await addTransformationStep('replace', string1[i-1], string2[j-1]);
                i--;
                j--;
            } else if (j > 0 && insertCost <= deleteCost) {
                // Insert operation
                transformations.unshift({
                    type: 'insert',
                    char: string2[j-1],
                    position: j-1
                });
                highlightCharacter(j-1, 'insert', false);
                updateCurrentStep(`Insert '${string2[j-1]}'`);
                await addTransformationStep('insert', null, string2[j-1]);
                j--;
            } else {
                // Delete operation
                transformations.unshift({
                    type: 'delete',
                    char: string1[i-1],
                    position: i-1
                });
                highlightCharacter(i-1, 'delete', true);
                updateCurrentStep(`Delete '${string1[i-1]}'`);
                await addTransformationStep('delete', string1[i-1]);
                i--;
            }
        }
        
        await sleep(speed);
    }
    
    // Display final result
    displayResult(transformations, dp[m][n]);
}

function highlightCurrentComparison(i, j, string1, string2) {
    // Remove previous highlights
    document.querySelectorAll('.character').forEach(el => el.classList.remove('current'));
    document.querySelectorAll('.dp-cell').forEach(el => el.classList.remove('current'));
    
    // Highlight characters being compared
    const string1Chars = document.querySelectorAll('#string1Display .character');
    const string2Chars = document.querySelectorAll('#string2Display .character');
    
    if (string1Chars[i-1]) string1Chars[i-1].classList.add('current');
    if (string2Chars[j-1]) string2Chars[j-1].classList.add('current');
    
    // Highlight current DP cell
    const dpCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
    if (dpCell) dpCell.classList.add('current');
}

function updateCurrentOperationInfo(insertCost, deleteCost, replaceCost, isMatch) {
    const currentOperationInfo = document.getElementById('currentOperationInfo');
    currentOperationInfo.innerHTML = `
        <div>Insert Cost: ${insertCost}</div>
        <div>Delete Cost: ${deleteCost}</div>
        <div>Replace Cost: ${replaceCost} ${isMatch ? '(Match)' : ''}</div>
        <div>Minimum Cost: ${Math.min(insertCost, deleteCost, replaceCost)}</div>
    `;
}

function updateDPCell(i, j, value) {
    const cell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
    if (cell) {
        cell.textContent = value;
        cell.classList.remove('current');
        cell.classList.add('calculated');
        setTimeout(() => cell.classList.remove('calculated'), 500);
    }
}

function highlightDPCell(i, j, className) {
    const cell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
    if (cell) {
        cell.classList.add(className);
    }
}

function highlightCharacters(i, j, className) {
    const string1Chars = document.querySelectorAll('#string1Display .character');
    const string2Chars = document.querySelectorAll('#string2Display .character');
    
    if (string1Chars[i]) string1Chars[i].classList.add(className);
    if (string2Chars[j]) string2Chars[j].classList.add(className);
}

function highlightCharacter(index, className, isSource) {
    const container = isSource ? '#string1Display' : '#string2Display';
    const chars = document.querySelectorAll(`${container} .character`);
    
    if (chars[index]) chars[index].classList.add(className);
}

async function addTransformationStep(type, fromChar, toChar) {
    const transformationSteps = document.getElementById('transformationSteps');
    const stepElement = document.createElement('div');
    stepElement.className = `step-item ${type}`;
    
    switch (type) {
        case 'replace':
            stepElement.textContent = `Replace '${fromChar}' with '${toChar}'`;
            break;
        case 'insert':
            stepElement.textContent = `Insert '${toChar}'`;
            break;
        case 'delete':
            stepElement.textContent = `Delete '${fromChar}'`;
            break;
    }
    
    transformationSteps.appendChild(stepElement);
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

function displayResult(transformations, distance) {
    const result = document.getElementById('result');
    result.className = 'result-content show';
    
    const transformationsList = transformations.map(t => {
        switch (t.type) {
            case 'replace':
                return `Replace '${t.from}' with '${t.to}'`;
            case 'insert':
                return `Insert '${t.char}'`;
            case 'delete':
                return `Delete '${t.char}'`;
        }
    }).join('<br>');
    
    result.innerHTML = `
        <p>Edit Distance: ${distance}</p>
        <h4>Transformation Sequence:</h4>
        <div class="transformations">${transformationsList}</div>
    `;
}

function resetVisualization() {
    // Clear displays
    document.getElementById('string1Display').innerHTML = '';
    document.getElementById('string2Display').innerHTML = '';
    document.getElementById('dpTable').innerHTML = '';
    document.getElementById('currentOperationInfo').textContent = '';
    document.getElementById('transformationSteps').innerHTML = '';
    document.getElementById('currentStep').textContent = '';
    document.getElementById('stepsContainer').innerHTML = '';
    
    // Reset result
    const result = document.getElementById('result');
    result.className = 'result-content';
    result.textContent = '';
}

function setControlsState(enabled) {
    document.getElementById('string1').disabled = !enabled;
    document.getElementById('string2').disabled = !enabled;
    document.getElementById('speedSlider').disabled = !enabled;
    document.getElementById('visualizeBtn').disabled = !enabled;
    document.getElementById('resetBtn').disabled = !enabled;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
} 