document.addEventListener('DOMContentLoaded', function() {
    const sequence1Input = document.getElementById('sequence1');
    const sequence2Input = document.getElementById('sequence2');
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
    
    // Get input sequences
    const sequence1 = document.getElementById('sequence1').value;
    const sequence2 = document.getElementById('sequence2').value;
    const speed = parseInt(document.getElementById('speedSlider').value);
    
    // Validate input
    if (!sequence1 || !sequence2) {
        alert('Please enter both sequences');
        setControlsState(true);
        return;
    }
    
    // Clear previous visualization
    resetVisualization();
    
    // Display sequences
    displaySequences(sequence1, sequence2);
    await sleep(speed);
    
    // Initialize DP table
    const dp = await initializeDPTable(sequence1, sequence2, speed);
    
    // Fill DP table
    await fillDPTable(sequence1, sequence2, dp, speed);
    
    // Construct LCS
    await constructLCS(sequence1, sequence2, dp, speed);
    
    // Enable controls
    setControlsState(true);
}

function displaySequences(sequence1, sequence2) {
    const sequence1Display = document.getElementById('sequence1Display');
    const sequence2Display = document.getElementById('sequence2Display');
    
    sequence1Display.innerHTML = '';
    sequence2Display.innerHTML = '';
    
    [...sequence1].forEach(char => {
        const element = document.createElement('div');
        element.className = 'character';
        element.textContent = char;
        sequence1Display.appendChild(element);
    });
    
    [...sequence2].forEach(char => {
        const element = document.createElement('div');
        element.className = 'character';
        element.textContent = char;
        sequence2Display.appendChild(element);
    });
}

async function initializeDPTable(sequence1, sequence2, speed) {
    const dpTable = document.getElementById('dpTable');
    dpTable.innerHTML = '';
    
    // Create DP array
    const m = sequence1.length;
    const n = sequence2.length;
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
    
    // Create header row
    const headerRow = document.createElement('div');
    headerRow.className = 'dp-row';
    
    // Empty corner cell
    const cornerCell = document.createElement('div');
    cornerCell.className = 'dp-cell header';
    cornerCell.textContent = '';
    headerRow.appendChild(cornerCell);
    
    // Sequence2 characters
    ['', ...sequence2].forEach(char => {
        const cell = document.createElement('div');
        cell.className = 'dp-cell header';
        cell.textContent = char;
        headerRow.appendChild(cell);
    });
    
    dpTable.appendChild(headerRow);
    
    // Create rows for sequence1
    for (let i = 0; i <= m; i++) {
        const row = document.createElement('div');
        row.className = 'dp-row';
        
        // Add sequence1 character as header
        const headerCell = document.createElement('div');
        headerCell.className = 'dp-cell header';
        headerCell.textContent = i === 0 ? '' : sequence1[i - 1];
        row.appendChild(headerCell);
        
        // Add cells for DP values
        for (let j = 0; j <= n; j++) {
            const cell = document.createElement('div');
            cell.className = 'dp-cell';
            cell.textContent = '0';
            cell.setAttribute('data-i', i);
            cell.setAttribute('data-j', j);
            row.appendChild(cell);
            
            await sleep(speed / 10);
        }
        
        dpTable.appendChild(row);
    }
    
    return dp;
}

async function fillDPTable(sequence1, sequence2, dp, speed) {
    const m = sequence1.length;
    const n = sequence2.length;
    
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            // Highlight current cells being compared
            highlightCurrentComparison(i, j, sequence1, sequence2);
            updateCurrentStep(`Comparing '${sequence1[i-1]}' with '${sequence2[j-1]}'`);
            await sleep(speed);
            
            if (sequence1[i-1] === sequence2[j-1]) {
                dp[i][j] = dp[i-1][j-1] + 1;
                updateCurrentStep(`Match found! Adding 1 to diagonal value (${dp[i-1][j-1]} + 1)`);
            } else {
                dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
                updateCurrentStep(`No match. Taking maximum of top (${dp[i-1][j]}) and left (${dp[i][j-1]}) values`);
            }
            
            // Update cell value with animation
            updateDPCell(i, j, dp[i][j]);
            await sleep(speed);
        }
    }
}

async function constructLCS(sequence1, sequence2, dp, speed) {
    const m = sequence1.length;
    const n = sequence2.length;
    let i = m;
    let j = n;
    const lcs = [];
    
    updateCurrentStep('Constructing LCS by backtracking through the DP table');
    await sleep(speed);
    
    while (i > 0 && j > 0) {
        highlightDPCell(i, j, 'path');
        
        if (sequence1[i-1] === sequence2[j-1]) {
            lcs.unshift(sequence1[i-1]);
            highlightCharacters(i-1, j-1);
            updateCurrentStep(`Found matching character '${sequence1[i-1]}' - adding to LCS`);
            await addToLCSConstruction(sequence1[i-1]);
            i--;
            j--;
        } else if (dp[i-1][j] > dp[i][j-1]) {
            updateCurrentStep('Moving up in the table');
            i--;
        } else {
            updateCurrentStep('Moving left in the table');
            j--;
        }
        
        await sleep(speed);
    }
    
    // Display final result
    displayResult(lcs.join(''));
}

function highlightCurrentComparison(i, j, sequence1, sequence2) {
    // Remove previous highlights
    document.querySelectorAll('.character').forEach(el => el.classList.remove('current'));
    document.querySelectorAll('.dp-cell').forEach(el => el.classList.remove('current'));
    
    // Highlight characters being compared
    const sequence1Chars = document.querySelectorAll('#sequence1Display .character');
    const sequence2Chars = document.querySelectorAll('#sequence2Display .character');
    
    if (sequence1Chars[i-1]) sequence1Chars[i-1].classList.add('current');
    if (sequence2Chars[j-1]) sequence2Chars[j-1].classList.add('current');
    
    // Highlight current DP cell
    const dpCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
    if (dpCell) dpCell.classList.add('current');
    
    // Update current cell info
    const currentCellInfo = document.getElementById('currentCellInfo');
    currentCellInfo.textContent = `Comparing ${sequence1[i-1]} with ${sequence2[j-1]}`;
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

function highlightCharacters(i, j) {
    const sequence1Chars = document.querySelectorAll('#sequence1Display .character');
    const sequence2Chars = document.querySelectorAll('#sequence2Display .character');
    
    if (sequence1Chars[i]) sequence1Chars[i].classList.add('match');
    if (sequence2Chars[j]) sequence2Chars[j].classList.add('match');
}

async function addToLCSConstruction(char) {
    const constructionSteps = document.getElementById('lcsConstruction');
    const charElement = document.createElement('div');
    charElement.className = 'lcs-char';
    charElement.textContent = char;
    constructionSteps.appendChild(charElement);
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

function displayResult(lcs) {
    const result = document.getElementById('result');
    result.className = 'result-content show';
    
    if (lcs.length === 0) {
        result.innerHTML = '<p>No common subsequence found.</p>';
    } else {
        result.innerHTML = `
            <p>Longest Common Subsequence:</p>
            <h2>${lcs}</h2>
            <p>Length: ${lcs.length}</p>
        `;
    }
}

function resetVisualization() {
    // Clear displays
    document.getElementById('sequence1Display').innerHTML = '';
    document.getElementById('sequence2Display').innerHTML = '';
    document.getElementById('dpTable').innerHTML = '';
    document.getElementById('currentCellInfo').textContent = '';
    document.getElementById('lcsConstruction').innerHTML = '';
    document.getElementById('currentStep').textContent = '';
    document.getElementById('stepsContainer').innerHTML = '';
    
    // Reset result
    const result = document.getElementById('result');
    result.className = 'result-content';
    result.textContent = '';
}

function setControlsState(enabled) {
    document.getElementById('sequence1').disabled = !enabled;
    document.getElementById('sequence2').disabled = !enabled;
    document.getElementById('speedSlider').disabled = !enabled;
    document.getElementById('visualizeBtn').disabled = !enabled;
    document.getElementById('resetBtn').disabled = !enabled;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
} 