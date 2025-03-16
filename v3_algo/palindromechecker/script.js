document.addEventListener('DOMContentLoaded', function() {
    const checkButton = document.getElementById('checkButton');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');

    // Update speed value display
    speedSlider.addEventListener('input', function() {
        speedValue.textContent = `${this.value} ms`;
    });

    checkButton.addEventListener('click', startPalindromeCheck);
});

function startPalindromeCheck() {
    // Get input and options
    const input = document.getElementById('palindromeInput').value;
    const ignoreCase = document.getElementById('ignoreCase').checked;
    const ignoreSpaces = document.getElementById('ignoreSpaces').checked;
    const ignoreSpecialChars = document.getElementById('ignoreSpecialChars').checked;
    const animationSpeed = parseInt(document.getElementById('speedSlider').value);

    // Clear previous results
    clearVisualizations();

    // Display original string
    displayOriginalString(input);

    // Process string based on options
    const processedString = processString(input, ignoreCase, ignoreSpaces, ignoreSpecialChars);
    
    // Display processed string with animation
    setTimeout(() => {
        displayProcessedString(processedString);
        
        // Start palindrome check animation
        setTimeout(() => {
            animatePalindromeCheck(processedString, animationSpeed);
        }, 1000);
    }, 1000);
}

function processString(str, ignoreCase, ignoreSpaces, ignoreSpecialChars) {
    let processed = str;
    
    if (ignoreCase) {
        processed = processed.toLowerCase();
    }
    
    if (ignoreSpaces) {
        processed = processed.replace(/\s/g, '');
    }
    
    if (ignoreSpecialChars) {
        processed = processed.replace(/[^a-zA-Z0-9]/g, '');
    }
    
    return processed;
}

function displayOriginalString(str) {
    const container = document.querySelector('#originalString .characters');
    container.innerHTML = '';
    
    str.split('').forEach((char, index) => {
        const element = createCharacterElement(char, index);
        setTimeout(() => {
            container.appendChild(element);
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function displayProcessedString(str) {
    const container = document.querySelector('#processedString .characters');
    container.innerHTML = '';
    
    str.split('').forEach((char, index) => {
        const element = createCharacterElement(char, index);
        setTimeout(() => {
            container.appendChild(element);
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function createCharacterElement(char, index) {
    const element = document.createElement('div');
    element.className = 'character';
    element.textContent = char;
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'all 0.5s ease';
    return element;
}

function animatePalindromeCheck(str, speed) {
    const container = document.querySelector('#palindromeCheck .characters');
    const stepsContainer = document.getElementById('steps');
    const currentStepDisplay = document.getElementById('currentStep');
    const resultContent = document.querySelector('.result-content');
    const leftPointer = document.querySelector('.left-pointer');
    const rightPointer = document.querySelector('.right-pointer');
    
    container.innerHTML = '';
    stepsContainer.innerHTML = '';
    
    // Display characters for checking
    str.split('').forEach(char => {
        const element = createCharacterElement(char);
        container.appendChild(element);
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    });

    const characters = container.getElementsByClassName('character');
    let left = 0;
    let right = str.length - 1;
    let isPalindrome = true;

    function checkStep() {
        if (left >= right) {
            // Checking complete
            showResult(isPalindrome, str);
            return;
        }

        // Reset previous highlights
        Array.from(characters).forEach(char => {
            char.className = 'character';
        });

        // Update pointers
        leftPointer.style.left = `${(left * 50) + 25}px`;
        rightPointer.style.left = `${(right * 50) + 25}px`;
        leftPointer.classList.add('active');
        rightPointer.classList.add('active');

        // Highlight current characters
        characters[left].classList.add('highlight');
        characters[right].classList.add('highlight');

        // Update current step display
        currentStepDisplay.textContent = `Comparing '${str[left]}' with '${str[right]}'`;

        // Check if characters match
        if (str[left] === str[right]) {
            characters[left].classList.add('match');
            characters[right].classList.add('match');
            stepsContainer.innerHTML += `
                <div>✓ Characters match: '${str[left]}' = '${str[right]}'</div>
            `;
        } else {
            characters[left].classList.add('mismatch');
            characters[right].classList.add('mismatch');
            stepsContainer.innerHTML += `
                <div>❌ Characters don't match: '${str[left]}' ≠ '${str[right]}'</div>
            `;
            isPalindrome = false;
        }

        left++;
        right--;
        setTimeout(checkStep, speed);
    }

    setTimeout(checkStep, speed);
}

function showResult(isPalindrome, str) {
    const resultContent = document.querySelector('.result-content');
    resultContent.textContent = isPalindrome ? 
        `✨ "${str}" is a palindrome! ✨` : 
        `"${str}" is not a palindrome.`;
    resultContent.className = `result-content show ${isPalindrome ? 'success' : 'failure'}`;
}

function clearVisualizations() {
    document.querySelector('#originalString .characters').innerHTML = '';
    document.querySelector('#processedString .characters').innerHTML = '';
    document.querySelector('#palindromeCheck .characters').innerHTML = '';
    document.getElementById('steps').innerHTML = '';
    document.getElementById('currentStep').textContent = '';
    document.querySelector('.result-content').className = 'result-content';
    document.querySelector('.left-pointer').classList.remove('active');
    document.querySelector('.right-pointer').classList.remove('active');
} 