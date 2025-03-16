// DOM Elements
const treeInput = document.getElementById('treeInput');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const visualizeBtn = document.getElementById('visualizeBtn');
const resetBtn = document.getElementById('resetBtn');
const treeDisplay = document.getElementById('treeDisplay');
const currentNodeInfo = document.getElementById('currentNodeInfo');
const balanceStatus = document.getElementById('balanceStatus');
const currentOperation = document.getElementById('currentOperation');
const currentStep = document.getElementById('currentStep');
const stepsContainer = document.getElementById('stepsContainer');
const result = document.getElementById('result');

// Global Variables
let isVisualizing = false;
let animationSpeed = 1000;
let nodePositions = new Map();
let isTreeBalanced = true;
let unbalancedNodes = [];

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

function updateHeightInfo(leftHeight, rightHeight) {
    const leftHeightSpan = currentNodeInfo.querySelector('.left-height');
    const rightHeightSpan = currentNodeInfo.querySelector('.right-height');
    const heightDiffSpan = currentNodeInfo.querySelector('.height-diff');
    
    leftHeightSpan.textContent = leftHeight;
    rightHeightSpan.textContent = rightHeight;
    
    const diff = Math.abs(leftHeight - rightHeight);
    heightDiffSpan.textContent = diff;
    
    // Update balance status
    const statusText = balanceStatus.querySelector('.status-text');
    
    if (diff <= 1) {
        balanceStatus.classList.remove('unbalanced');
        balanceStatus.classList.add('balanced');
        statusText.textContent = 'Balanced';
    } else {
        balanceStatus.classList.remove('balanced');
        balanceStatus.classList.add('unbalanced');
        statusText.textContent = 'Unbalanced';
    }
}

function updateNodeInfo(nodeVal) {
    const nodeValueSpan = currentNodeInfo.querySelector('.node-value span');
    nodeValueSpan.textContent = nodeVal === null ? 'null' : nodeVal;
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

// Calculate node positions for tree visualization
function calculateNodePositions(node, level = 0, offset = 0, positions = new Map()) {
    if (!node) return { width: 0 };

    const leftResult = calculateNodePositions(node.left, level + 1, offset, positions);
    const rightResult = calculateNodePositions(node.right, level + 1, offset + leftResult.width + 1, positions);

    // Adjust horizontal spacing for better fit
    const x = (offset + leftResult.width) * 80;
    // Adjust vertical spacing
    const y = level * 80 + 60;
    
    positions.set(node, { x, y });

    return { width: leftResult.width + rightResult.width + 1 };
}

function createNodeElement(value, x, y) {
    const node = document.createElement('div');
    node.className = 'tree-node';
    node.textContent = value;
    // Center the node at the calculated position
    node.style.left = `${x - 20}px`;
    node.style.top = `${y - 20}px`;
    node.setAttribute('data-value', value);
    return node;
}

function createEdge(x1, y1, x2, y2) {
    const edge = document.createElement('div');
    edge.className = 'tree-edge';
    
    // Calculate length and angle from center of nodes
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    
    edge.style.width = `${length}px`;
    edge.style.left = `${x1}px`;
    edge.style.top = `${y1}px`;
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
    
    // Calculate node positions
    nodePositions = new Map();
    calculateNodePositions(root, 0, 0, nodePositions);
    
    // Find min and max X coordinates
    let minX = Infinity, maxX = -Infinity;
    nodePositions.forEach(pos => {
        minX = Math.min(minX, pos.x);
        maxX = Math.max(maxX, pos.x);
    });
    
    // Calculate centering offset with padding
    const treeWidth = maxX - minX;
    const containerWidth = treeDisplay.clientWidth || 600;
    const offset = Math.max(0, (containerWidth - treeWidth) / 2 - minX);
    
    const fragment = document.createDocumentFragment();
    
    // Add edges first
    nodePositions.forEach((pos, node) => {
        if (node.left) {
            const leftPos = nodePositions.get(node.left);
            if (leftPos) {
                const edge = createEdge(
                    pos.x + offset,
                    pos.y,
                    leftPos.x + offset,
                    leftPos.y
                );
                edge.setAttribute('data-parent', node.val);
                edge.setAttribute('data-child', node.left.val);
                edge.setAttribute('data-side', 'left');
                fragment.appendChild(edge);
            }
        }
        if (node.right) {
            const rightPos = nodePositions.get(node.right);
            if (rightPos) {
                const edge = createEdge(
                    pos.x + offset,
                    pos.y,
                    rightPos.x + offset,
                    rightPos.y
                );
                edge.setAttribute('data-parent', node.val);
                edge.setAttribute('data-child', node.right.val);
                edge.setAttribute('data-side', 'right');
                fragment.appendChild(edge);
            }
        }
    });
    
    // Add nodes
    nodePositions.forEach((pos, node) => {
        const nodeElement = createNodeElement(node.val, pos.x + offset, pos.y);
        fragment.appendChild(nodeElement);
    });
    
    treeDisplay.appendChild(fragment);
}

async function highlightNode(node, type) {
    if (!node) return;
    
    const pos = nodePositions.get(node);
    if (!pos) return;
    
    const nodeElement = document.querySelector(`.tree-node[data-value="${node.val}"]`);
    
    if (nodeElement) {
        // Remove existing highlight classes
        nodeElement.classList.remove('current', 'left-subtree', 'right-subtree', 'balanced', 'unbalanced');
        
        // Add new highlight class
        nodeElement.classList.add(type);
        
        await sleep(animationSpeed / 2);
    }
}

async function highlightEdge(parent, child, type) {
    if (!parent || !child) return;
    
    const edge = document.querySelector(`.tree-edge[data-parent="${parent.val}"][data-child="${child.val}"]`);
    
    if (edge) {
        // Remove existing highlight classes
        edge.classList.remove('left-subtree', 'right-subtree', 'unbalanced');
        
        // Add new highlight class
        edge.classList.add(type);
        
        await sleep(animationSpeed / 2);
    }
}

async function checkBalanced(node) {
    if (!node) {
        updateCurrentStep('Reached null node');
        addStep('Returning height 0 for null node (considered balanced)');
        return { height: 0, isBalanced: true };
    }
    
    // Highlight current node
    await highlightNode(node, 'current');
    updateCurrentStep(`Visiting node with value ${node.val}`);
    addStep(`Processing node ${node.val}`);
    updateNodeInfo(node.val);
    
    await sleep(animationSpeed);
    
    // Process left subtree
    updateCurrentStep(`Checking balance of left subtree of node ${node.val}`);
    addStep(`Going to left child of ${node.val}`);
    
    let leftResult = { height: 0, isBalanced: true };
    if (node.left) {
        await highlightEdge(node, node.left, 'left-subtree');
        leftResult = await checkBalanced(node.left);
    }
    
    // Process right subtree
    updateCurrentStep(`Checking balance of right subtree of node ${node.val}`);
    addStep(`Going to right child of ${node.val}`);
    
    let rightResult = { height: 0, isBalanced: true };
    if (node.right) {
        await highlightEdge(node, node.right, 'right-subtree');
        rightResult = await checkBalanced(node.right);
    }
    
    // Calculate heights and check balance
    const leftHeight = leftResult.height;
    const rightHeight = rightResult.height;
    const heightDiff = Math.abs(leftHeight - rightHeight);
    
    updateHeightInfo(leftHeight, rightHeight);
    updateCurrentStep(`Node ${node.val}: Left height = ${leftHeight}, Right height = ${rightHeight}, Difference = ${heightDiff}`);
    
    // Check if current node is balanced
    const isNodeBalanced = heightDiff <= 1 && leftResult.isBalanced && rightResult.isBalanced;
    
    if (isNodeBalanced) {
        addStep(`Node ${node.val} is balanced (height difference = ${heightDiff})`);
        await highlightNode(node, 'balanced');
    } else {
        isTreeBalanced = false;
        unbalancedNodes.push(node);
        
        if (heightDiff > 1) {
            addStep(`Node ${node.val} is unbalanced (height difference = ${heightDiff} > 1)`);
        } else {
            addStep(`Node ${node.val} is unbalanced (subtree is unbalanced)`);
        }
        
        await highlightNode(node, 'unbalanced');
    }
    
    // Calculate height of current node
    const currentHeight = Math.max(leftHeight, rightHeight) + 1;
    addStep(`Node ${node.val} has height ${currentHeight}`);
    
    await sleep(animationSpeed);
    
    return { 
        height: currentHeight,
        isBalanced: isNodeBalanced
    };
}

async function highlightUnbalancedNodes() {
    if (unbalancedNodes.length === 0) return;
    
    updateCurrentStep('Highlighting unbalanced nodes');
    addStep('Tree is not balanced');
    
    for (const node of unbalancedNodes) {
        await highlightNode(node, 'unbalanced');
        
        // Highlight edges to children if they exist
        if (node.left) {
            await highlightEdge(node, node.left, 'unbalanced');
        }
        if (node.right) {
            await highlightEdge(node, node.right, 'unbalanced');
        }
    }
}

function showResult() {
    if (isTreeBalanced) {
        result.textContent = 'The tree is balanced!';
        result.className = 'result-content balanced';
    } else {
        result.textContent = 'The tree is not balanced!';
        result.className = 'result-content unbalanced';
    }
}

function resetVisualization() {
    treeDisplay.innerHTML = '';
    currentNodeInfo.querySelector('.node-value span').textContent = '';
    currentNodeInfo.querySelector('.left-height').textContent = '0';
    currentNodeInfo.querySelector('.right-height').textContent = '0';
    currentNodeInfo.querySelector('.height-diff').textContent = '0';
    
    balanceStatus.classList.remove('balanced', 'unbalanced');
    balanceStatus.querySelector('.status-text').textContent = 'Balanced';
    
    currentOperation.textContent = '';
    currentStep.textContent = '';
    stepsContainer.innerHTML = '';
    result.textContent = '';
    result.className = 'result-content';
    
    isTreeBalanced = true;
    unbalancedNodes = [];
    
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
    
    // Display tree
    nodePositions = new Map();
    calculateNodePositions(root, 0, 0, nodePositions);
    displayTree();
    
    updateCurrentStep('Starting balance check...');
    addStep('Building tree from input values');
    
    try {
        // Reset global variables
        isTreeBalanced = true;
        unbalancedNodes = [];
        
        // Start recursive check
        const result = await checkBalanced(root);
        
        // Highlight unbalanced nodes if any
        if (!isTreeBalanced) {
            await highlightUnbalancedNodes();
        }
        
        updateCurrentStep(`Balance check complete! Tree is ${isTreeBalanced ? 'balanced' : 'not balanced'}`);
        addStep(`Final result: Tree is ${isTreeBalanced ? 'balanced' : 'not balanced'}`);
        showResult();
    } catch (error) {
        console.error('Error during visualization:', error);
    } finally {
        setControlsState(false);
    }
} 