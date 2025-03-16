// DOM Elements
const treeInput = document.getElementById('treeInput');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const visualizeBtn = document.getElementById('visualizeBtn');
const resetBtn = document.getElementById('resetBtn');
const originalTreeDisplay = document.getElementById('originalTreeDisplay');
const invertedTreeDisplay = document.getElementById('invertedTreeDisplay');
const currentNodeInfo = document.getElementById('currentNodeInfo');
const currentOperation = document.getElementById('currentOperation');
const currentStep = document.getElementById('currentStep');
const stepsContainer = document.getElementById('stepsContainer');
const result = document.getElementById('result');

// Global Variables
let isVisualizing = false;
let animationSpeed = 1000;
let originalNodePositions = new Map();
let invertedNodePositions = new Map();

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
    displayTrees();
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
    displayTrees();
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

function updateNodeInfo(nodeVal, leftVal, rightVal) {
    const nodeValueSpan = currentNodeInfo.querySelector('.node-value span');
    const leftSpan = currentNodeInfo.querySelector('.swap-info .left');
    const rightSpan = currentNodeInfo.querySelector('.swap-info .right');
    
    nodeValueSpan.textContent = nodeVal === null ? 'null' : nodeVal;
    leftSpan.textContent = leftVal === null ? 'null' : leftVal;
    rightSpan.textContent = rightVal === null ? 'null' : rightVal;
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

// Deep clone a tree
function cloneTree(root) {
    if (!root) return null;
    
    const newRoot = new TreeNode(root.val);
    newRoot.left = cloneTree(root.left);
    newRoot.right = cloneTree(root.right);
    
    return newRoot;
}

// Calculate node positions for tree visualization
function calculateNodePositions(node, level = 0, offset = 0, positions = new Map()) {
    if (!node) return { width: 0 };

    const leftResult = calculateNodePositions(node.left, level + 1, offset, positions);
    const rightResult = calculateNodePositions(node.right, level + 1, offset + leftResult.width + 1, positions);

    // Adjust horizontal spacing for better fit in wider container
    const x = (offset + leftResult.width) * 80;
    // Less vertical space needed since trees are stacked
    const y = level * 80 + 60;
    
    positions.set(node, { x, y });

    return { width: leftResult.width + rightResult.width + 1 };
}

function createNodeElement(value, x, y, isInverted = false) {
    const node = document.createElement('div');
    node.className = 'tree-node';
    if (isInverted) node.classList.add('new');
    node.textContent = value;
    // Center the node at the calculated position with adjusted size
    node.style.left = `${x - 20}px`;
    node.style.top = `${y - 20}px`;
    node.setAttribute('data-value', value);
    return node;
}

function createEdge(x1, y1, x2, y2, isInverted = false) {
    const edge = document.createElement('div');
    edge.className = 'tree-edge';
    if (isInverted) edge.classList.add('new');
    
    // Calculate length and angle from center of nodes
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    
    edge.style.width = `${length}px`;
    edge.style.left = `${x1}px`;
    edge.style.top = `${y1}px`;
    edge.style.transform = `rotate(${angle}deg)`;
    
    return edge;
}

function displayTree(root, treeDisplay, positions, isInverted = false) {
    treeDisplay.innerHTML = '';
    
    if (!root) return;
    
    // Find min and max X coordinates
    let minX = Infinity, maxX = -Infinity;
    positions.forEach(pos => {
        minX = Math.min(minX, pos.x);
        maxX = Math.max(maxX, pos.x);
    });
    
    // Calculate centering offset with padding
    const treeWidth = maxX - minX;
    const containerWidth = treeDisplay.clientWidth || 500; // Reduced fallback width
    const offset = Math.max(0, (containerWidth - treeWidth) / 2 - minX);
    
    const fragment = document.createDocumentFragment();
    
    // Add edges first
    positions.forEach((pos, node) => {
        if (node.left) {
            const leftPos = positions.get(node.left);
            if (leftPos) {
                const edge = createEdge(
                    pos.x + offset,
                    pos.y,
                    leftPos.x + offset,
                    leftPos.y,
                    isInverted
                );
                edge.setAttribute('data-parent', node.val);
                edge.setAttribute('data-child', node.left.val);
                edge.setAttribute('data-side', 'left');
                fragment.appendChild(edge);
            }
        }
        if (node.right) {
            const rightPos = positions.get(node.right);
            if (rightPos) {
                const edge = createEdge(
                    pos.x + offset,
                    pos.y,
                    rightPos.x + offset,
                    rightPos.y,
                    isInverted
                );
                edge.setAttribute('data-parent', node.val);
                edge.setAttribute('data-child', node.right.val);
                edge.setAttribute('data-side', 'right');
                fragment.appendChild(edge);
            }
        }
    });
    
    // Add nodes
    positions.forEach((pos, node) => {
        const nodeElement = createNodeElement(node.val, pos.x + offset, pos.y, isInverted);
        fragment.appendChild(nodeElement);
    });
    
    treeDisplay.appendChild(fragment);
}

function displayTrees() {
    const values = treeInput.value.split(',').map(val => {
        const trimmed = val.trim();
        return trimmed === 'null' ? null : parseInt(trimmed);
    });
    
    const originalRoot = buildTree(values);
    if (!originalRoot) return;
    
    // Calculate positions for original tree
    originalNodePositions = new Map();
    calculateNodePositions(originalRoot, 0, 0, originalNodePositions);
    
    // Display original tree
    displayTree(originalRoot, originalTreeDisplay, originalNodePositions);
    
    // Clear inverted tree display
    invertedTreeDisplay.innerHTML = '';
}

async function highlightNode(node, treeDisplay, positions, type) {
    if (!node) return;
    
    const pos = positions.get(node);
    if (!pos) return;
    
    const nodeElement = treeDisplay.querySelector(`.tree-node[data-value="${node.val}"]`);
    
    if (nodeElement) {
        // Remove existing highlight classes
        nodeElement.classList.remove('current', 'swapping-left', 'swapping-right', 'inverted');
        
        // Add new highlight class
        nodeElement.classList.add(type);
        
        await sleep(animationSpeed / 2);
    }
}

async function invertTree(node, originalNode) {
    if (!node) {
        updateCurrentStep('Reached null node, nothing to invert');
        addStep('Returning null node');
        return null;
    }
    
    // Highlight current node
    await highlightNode(originalNode, originalTreeDisplay, originalNodePositions, 'current');
    updateCurrentStep(`Visiting node with value ${node.val}`);
    addStep(`Processing node ${node.val}`);
    
    // Update node info
    const leftVal = node.left ? node.left.val : null;
    const rightVal = node.right ? node.right.val : null;
    updateNodeInfo(node.val, leftVal, rightVal);
    
    await sleep(animationSpeed);
    
    // Recursively invert left subtree
    updateCurrentStep(`Inverting left subtree of node ${node.val}`);
    addStep(`Going to left child of ${node.val}`);
    const invertedRight = await invertTree(node.left, originalNode.left);
    
    // Recursively invert right subtree
    updateCurrentStep(`Inverting right subtree of node ${node.val}`);
    addStep(`Going to right child of ${node.val}`);
    const invertedLeft = await invertTree(node.right, originalNode.right);
    
    // Swap left and right children
    updateCurrentStep(`Swapping left and right children of node ${node.val}`);
    addStep(`Swapping: ${leftVal === null ? 'null' : leftVal} ↔ ${rightVal === null ? 'null' : rightVal}`);
    
    // Highlight swapping nodes in original tree
    if (originalNode.left) {
        await highlightNode(originalNode.left, originalTreeDisplay, originalNodePositions, 'swapping-left');
    }
    if (originalNode.right) {
        await highlightNode(originalNode.right, originalTreeDisplay, originalNodePositions, 'swapping-right');
    }
    
    await sleep(animationSpeed);
    
    // Create inverted node
    const invertedNode = new TreeNode(node.val);
    invertedNode.left = invertedLeft;
    invertedNode.right = invertedRight;
    
    // Mark original node as inverted
    await highlightNode(originalNode, originalTreeDisplay, originalNodePositions, 'inverted');
    
    return invertedNode;
}

function showResult() {
    result.textContent = 'Tree successfully inverted! 🎉';
    result.className = 'result-content show';
}

function resetVisualization() {
    originalTreeDisplay.innerHTML = '';
    invertedTreeDisplay.innerHTML = '';
    currentNodeInfo.querySelector('.node-value span').textContent = '';
    currentNodeInfo.querySelector('.swap-info .left').textContent = '';
    currentNodeInfo.querySelector('.swap-info .right').textContent = '';
    currentOperation.textContent = '';
    currentStep.textContent = '';
    stepsContainer.innerHTML = '';
    result.textContent = '';
    result.className = 'result-content';
    
    setControlsState(false);
    displayTrees();
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
    
    const originalRoot = buildTree(values);
    const workingRoot = cloneTree(originalRoot);
    
    // Display original tree
    originalNodePositions = new Map();
    calculateNodePositions(originalRoot, 0, 0, originalNodePositions);
    displayTree(originalRoot, originalTreeDisplay, originalNodePositions);
    
    updateCurrentStep('Starting tree inversion...');
    addStep('Building tree from input values');
    
    try {
        // Start recursive inversion
        const invertedRoot = await invertTree(workingRoot, originalRoot);
        
        // Calculate positions for inverted tree
        invertedNodePositions = new Map();
        calculateNodePositions(invertedRoot, 0, 0, invertedNodePositions);
        
        // Display inverted tree
        displayTree(invertedRoot, invertedTreeDisplay, invertedNodePositions, true);
        
        updateCurrentStep('Tree inversion complete!');
        addStep('Tree successfully inverted');
        showResult();
    } catch (error) {
        console.error('Error during visualization:', error);
    } finally {
        setControlsState(false);
    }
} 