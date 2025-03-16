// DOM Elements
const treeInput = document.getElementById('treeInput');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const visualizeBtn = document.getElementById('visualizeBtn');
const resetBtn = document.getElementById('resetBtn');
const treeDisplay = document.getElementById('treeDisplay');
const comparisonDisplay = document.getElementById('comparisonDisplay');
const currentOperation = document.getElementById('currentOperation');
const currentStep = document.getElementById('currentStep');
const stepsContainer = document.getElementById('stepsContainer');
const result = document.getElementById('result');

// Global Variables
let isVisualizing = false;
let animationSpeed = 1000;
let nodePositions = new Map();

// Tree Node Class
class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    updateSpeedValue();
    displayTree();
});

speedSlider.addEventListener('input', () => {
    updateSpeedValue();
});

visualizeBtn.addEventListener('click', async () => {
    if (!isVisualizing) {
        await startVisualization();
    }
});

resetBtn.addEventListener('click', () => {
    resetVisualization();
});

treeInput.addEventListener('input', () => {
    displayTree();
});

// Helper Functions
function updateSpeedValue() {
    animationSpeed = parseInt(speedSlider.value);
    speedValue.textContent = `${animationSpeed} ms`;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setControlsState(disabled) {
    treeInput.disabled = disabled;
    speedSlider.disabled = disabled;
    visualizeBtn.disabled = disabled;
    isVisualizing = disabled;
}

function addStep(step) {
    const stepElement = document.createElement('div');
    stepElement.className = 'step';
    stepElement.textContent = step;
    stepsContainer.appendChild(stepElement);
    stepsContainer.scrollTop = stepsContainer.scrollHeight;
}

function updateCurrentStep(step) {
    currentStep.textContent = step;
}

function updateComparisonDisplay(leftVal, rightVal) {
    const leftNode = comparisonDisplay.querySelector('.left-node span');
    const rightNode = comparisonDisplay.querySelector('.right-node span');
    leftNode.textContent = leftVal === null ? 'null' : leftVal;
    rightNode.textContent = rightVal === null ? 'null' : rightVal;
}

// Tree Construction and Display Functions
function buildTree(values) {
    if (!values || values.length === 0) return null;
    
    const root = new TreeNode(values[0]);
    const queue = [root];
    let i = 1;
    
    while (queue.length > 0 && i < values.length) {
        const node = queue.shift();
        
        // Left child
        if (i < values.length && values[i] !== null) {
            node.left = new TreeNode(values[i]);
            queue.push(node.left);
        }
        i++;
        
        // Right child
        if (i < values.length && values[i] !== null) {
            node.right = new TreeNode(values[i]);
            queue.push(node.right);
        }
        i++;
    }
    
    return root;
}

// Reuse the tree display functions from maxdepth visualizer
function calculateNodePositions(node, level = 0, offset = 0, positions = new Map()) {
    if (!node) return { width: 0 };

    const leftResult = calculateNodePositions(node.left, level + 1, offset, positions);
    const rightResult = calculateNodePositions(node.right, level + 1, offset + leftResult.width + 1, positions);

    const x = (offset + leftResult.width) * 80;
    const y = level * 100;
    
    positions.set(node, { x, y });

    return { width: leftResult.width + rightResult.width + 1 };
}

function createNodeElement(value, x, y) {
    const node = document.createElement('div');
    node.className = 'tree-node';
    node.textContent = value;
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    return node;
}

function createEdge(x1, y1, x2, y2) {
    const edge = document.createElement('div');
    edge.className = 'tree-edge';
    
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    
    edge.style.width = `${length}px`;
    edge.style.left = `${x1 + 20}px`;
    edge.style.top = `${y1 + 20}px`;
    edge.style.transform = `rotate(${angle}deg)`;
    
    return edge;
}

function displayTree() {
    treeDisplay.innerHTML = '';
    
    const values = treeInput.value.split(',').map(val => {
        const trimmed = val.trim();
        return trimmed === 'null' ? null : parseInt(trimmed);
    });
    
    const root = buildTree(values);
    if (!root) return;
    
    nodePositions = new Map();
    calculateNodePositions(root, 0, 0, nodePositions);
    
    let minX = Infinity, maxX = -Infinity;
    nodePositions.forEach(pos => {
        minX = Math.min(minX, pos.x);
        maxX = Math.max(maxX, pos.x);
    });
    
    const treeWidth = maxX - minX;
    const containerWidth = treeDisplay.clientWidth;
    const offset = (containerWidth - treeWidth) / 2 - minX;
    
    const fragment = document.createDocumentFragment();
    
    nodePositions.forEach((pos, node) => {
        if (node.left) {
            const leftPos = nodePositions.get(node.left);
            const edge = createEdge(
                pos.x + offset,
                pos.y,
                leftPos.x + offset,
                leftPos.y
            );
            edge.setAttribute('data-parent', node.val);
            edge.setAttribute('data-child', node.left.val);
            fragment.appendChild(edge);
        }
        if (node.right) {
            const rightPos = nodePositions.get(node.right);
            const edge = createEdge(
                pos.x + offset,
                pos.y,
                rightPos.x + offset,
                rightPos.y
            );
            edge.setAttribute('data-parent', node.val);
            edge.setAttribute('data-child', node.right.val);
            fragment.appendChild(edge);
        }
    });
    
    nodePositions.forEach((pos, node) => {
        const nodeElement = createNodeElement(node.val, pos.x + offset, pos.y);
        nodeElement.setAttribute('data-value', node.val);
        fragment.appendChild(nodeElement);
    });
    
    treeDisplay.appendChild(fragment);
}

async function highlightNodes(leftNode, rightNode, type) {
    if (!leftNode || !rightNode) return;
    
    const leftElement = document.querySelector(`.tree-node[data-value="${leftNode.val}"]`);
    const rightElement = document.querySelector(`.tree-node[data-value="${rightNode.val}"]`);
    
    if (leftElement && rightElement) {
        // Remove existing classes
        leftElement.classList.remove('comparing-left', 'match', 'mismatch');
        rightElement.classList.remove('comparing-right', 'match', 'mismatch');
        
        // Add new classes based on type
        if (type === 'comparing') {
            leftElement.classList.add('comparing-left');
            rightElement.classList.add('comparing-right');
        } else if (type === 'match') {
            leftElement.classList.add('match');
            rightElement.classList.add('match');
        } else if (type === 'mismatch') {
            leftElement.classList.add('mismatch');
            rightElement.classList.add('mismatch');
        }
        
        await sleep(animationSpeed);
        
        // Remove comparing classes after comparison
        if (type === 'comparing') {
            leftElement.classList.remove('comparing-left');
            rightElement.classList.remove('comparing-right');
        }
    }
}

async function checkSymmetric(left, right) {
    // Base cases
    if (!left && !right) {
        updateCurrentStep('Both nodes are null - symmetric');
        addStep('Comparing: null and null - Match');
        updateComparisonDisplay(null, null);
        return true;
    }
    
    if (!left || !right) {
        updateCurrentStep('One node is null, the other is not - not symmetric');
        addStep(`Comparing: ${left ? left.val : 'null'} and ${right ? right.val : 'null'} - Mismatch`);
        updateComparisonDisplay(left ? left.val : null, right ? right.val : null);
        await highlightNodes(left, right, 'mismatch');
        return false;
    }
    
    // Compare current nodes
    updateCurrentStep(`Comparing nodes: ${left.val} and ${right.val}`);
    addStep(`Comparing values: ${left.val} and ${right.val}`);
    updateComparisonDisplay(left.val, right.val);
    
    await highlightNodes(left, right, 'comparing');
    
    if (left.val !== right.val) {
        updateCurrentStep(`Values ${left.val} and ${right.val} don't match - not symmetric`);
        await highlightNodes(left, right, 'mismatch');
        return false;
    }
    
    await highlightNodes(left, right, 'match');
    
    // Recursively check outer and inner subtrees
    const outerSymmetric = await checkSymmetric(left.left, right.right);
    if (!outerSymmetric) return false;
    
    const innerSymmetric = await checkSymmetric(left.right, right.left);
    return innerSymmetric;
}

function showResult(isSymmetric) {
    result.textContent = isSymmetric ? 
        'The tree is symmetric! 🎉' : 
        'The tree is not symmetric ❌';
    result.className = `result-content ${isSymmetric ? 'symmetric' : 'not-symmetric'} show`;
}

function resetVisualization() {
    treeDisplay.innerHTML = '';
    comparisonDisplay.querySelector('.left-node span').textContent = '';
    comparisonDisplay.querySelector('.right-node span').textContent = '';
    currentOperation.textContent = '';
    currentStep.textContent = '';
    stepsContainer.innerHTML = '';
    result.textContent = '';
    result.className = 'result-content';
    
    setControlsState(false);
    displayTree();
}

async function startVisualization() {
    const values = treeInput.value.split(',').map(val => {
        const trimmed = val.trim();
        return trimmed === 'null' ? null : parseInt(trimmed);
    });
    
    if (values.length === 0 || values[0] === null) {
        alert('Please enter valid tree values');
        return;
    }
    
    resetVisualization();
    setControlsState(true);
    
    const root = buildTree(values);
    displayTree();
    
    updateCurrentStep('Starting symmetry check...');
    addStep('Building tree from input values');
    
    if (!root) {
        showResult(true); // Empty tree is symmetric
        setControlsState(false);
        return;
    }
    
    try {
        const isSymmetric = await checkSymmetric(root.left, root.right);
        updateCurrentStep(isSymmetric ? 'Tree is symmetric!' : 'Tree is not symmetric');
        showResult(isSymmetric);
    } catch (error) {
        console.error('Error during visualization:', error);
    } finally {
        setControlsState(false);
    }
} 