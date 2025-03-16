// DOM Elements
const treeInput = document.getElementById('treeInput');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const visualizeBtn = document.getElementById('visualizeBtn');
const resetBtn = document.getElementById('resetBtn');
const treeDisplay = document.getElementById('treeDisplay');
const currentNodeInfo = document.getElementById('currentNodeInfo');
const depthCalculation = document.getElementById('depthCalculation');
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

function calculateNodePositions(node, level = 0, offset = 0, positions = new Map()) {
    if (!node) return { width: 0 };

    // Calculate positions for subtrees
    const leftResult = calculateNodePositions(node.left, level + 1, offset, positions);
    const rightResult = calculateNodePositions(node.right, level + 1, offset + leftResult.width + 1, positions);

    // Calculate node's position
    const x = (offset + leftResult.width) * 80; // Node spacing
    const y = level * 100; // Level spacing increased for better visibility
    
    positions.set(node, { x, y });

    // Return total width of this subtree
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
    
    // Calculate length and angle
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    
    edge.style.width = `${length}px`;
    edge.style.left = `${x1 + 20}px`;
    edge.style.top = `${y1 + 20}px`;
    edge.style.transform = `rotate(${angle}deg)`;
    
    return edge;
}

function displayTree() {
    // Clear previous display
    treeDisplay.innerHTML = '';
    
    // Parse input and build tree
    const values = treeInput.value.split(',').map(val => {
        const trimmed = val.trim();
        return trimmed === 'null' ? null : parseInt(trimmed);
    });
    
    const root = buildTree(values);
    if (!root) return;
    
    // Calculate node positions with new algorithm
    nodePositions = new Map();
    calculateNodePositions(root, 0, 0, nodePositions);
    
    // Find min and max X coordinates
    let minX = Infinity, maxX = -Infinity;
    nodePositions.forEach(pos => {
        minX = Math.min(minX, pos.x);
        maxX = Math.max(maxX, pos.x);
    });
    
    // Calculate centering offset
    const treeWidth = maxX - minX;
    const containerWidth = treeDisplay.clientWidth;
    const offset = (containerWidth - treeWidth) / 2 - minX;
    
    // Create and position nodes and edges
    const fragment = document.createDocumentFragment();
    
    // Add edges first (so they appear behind nodes)
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
    
    // Add nodes with enhanced styling
    nodePositions.forEach((pos, node) => {
        const nodeElement = createNodeElement(node.val, pos.x + offset, pos.y);
        nodeElement.setAttribute('data-value', node.val);
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
        // Remove any existing highlight classes
        nodeElement.classList.remove('current', 'visited', 'max-path');
        
        // Add new highlight class with animation
        nodeElement.classList.add(type);
        nodeElement.style.animation = type === 'current' ? 'pulse 1s infinite' : 'none';
        
        await sleep(animationSpeed);
        
        if (type === 'current') {
            nodeElement.classList.remove(type);
            nodeElement.style.animation = 'none';
        }
    }
}

async function highlightEdge(parent, child, type) {
    if (!parent || !child) return;
    
    const edge = document.querySelector(`.tree-edge[data-parent="${parent.val}"][data-child="${child.val}"]`);
    
    if (edge) {
        // Remove any existing highlight classes
        edge.classList.remove('active', 'max-path');
        
        // Add new highlight class with animation
        edge.classList.add(type);
        edge.style.animation = type === 'active' ? 'glow 1s infinite alternate' : 'none';
        
        await sleep(animationSpeed);
        
        if (type === 'active') {
            edge.classList.remove(type);
            edge.style.animation = 'none';
        }
    }
}

function showResult(maxDepth) {
    result.textContent = `Maximum Depth of Binary Tree: ${maxDepth}`;
    result.classList.add('show');
}

function resetVisualization() {
    // Reset all displays
    treeDisplay.innerHTML = '';
    currentNodeInfo.textContent = '';
    depthCalculation.textContent = '';
    currentOperation.textContent = '';
    currentStep.textContent = '';
    stepsContainer.innerHTML = '';
    result.textContent = '';
    result.classList.remove('show');
    
    // Reset controls
    setControlsState(false);
    
    // Redisplay tree
    displayTree();
}

// Main Visualization Function
async function startVisualization() {
    console.log('Starting visualization...');
    
    // Input validation
    const values = treeInput.value.split(',').map(val => {
        const trimmed = val.trim();
        return trimmed === 'null' ? null : parseInt(trimmed);
    });
    
    console.log('Input values:', values);
    
    if (values.length === 0 || values[0] === null) {
        alert('Please enter valid tree values');
        return;
    }
    
    // Reset and setup
    resetVisualization();
    setControlsState(true);
    
    const root = buildTree(values);
    console.log('Built tree:', root);
    
    // Display initial tree
    displayTree();
    
    updateCurrentStep('Starting visualization...');
    addStep('Building tree from input values');
    
    try {
        // Start recursive visualization
        const maxDepth = await visualizeMaxDepth(root);
        console.log('Visualization complete. Max depth:', maxDepth);
        
        // Show final result
        updateCurrentStep('Visualization complete!');
        addStep(`Final maximum depth: ${maxDepth}`);
        showResult(maxDepth);
    } catch (error) {
        console.error('Error during visualization:', error);
    } finally {
        setControlsState(false);
    }
}

async function visualizeMaxDepth(node, depth = 0, maxPath = new Set()) {
    if (!node) {
        updateCurrentStep('Reached null node');
        addStep(`Returning depth 0 for null node`);
        return { depth: 0, isMaxPath: false };
    }
    
    // Highlight current node
    await highlightNode(node, 'current');
    updateCurrentStep(`Visiting node with value ${node.val} at depth ${depth}`);
    addStep(`Processing node ${node.val}`);
    currentNodeInfo.textContent = `Current Node: ${node.val} (Depth: ${depth})`;
    
    await sleep(animationSpeed);
    
    // Process left subtree
    let leftResult = { depth: 0, isMaxPath: false };
    if (node.left) {
        updateCurrentStep(`Exploring left subtree of node ${node.val}`);
        addStep(`Going to left child of ${node.val}`);
        await highlightEdge(node, node.left, 'active');
        leftResult = await visualizeMaxDepth(node.left, depth + 1, maxPath);
    }
    
    // Process right subtree
    let rightResult = { depth: 0, isMaxPath: false };
    if (node.right) {
        updateCurrentStep(`Exploring right subtree of node ${node.val}`);
        addStep(`Going to right child of ${node.val}`);
        await highlightEdge(node, node.right, 'active');
        rightResult = await visualizeMaxDepth(node.right, depth + 1, maxPath);
    }
    
    // Calculate max depth for current node
    const maxChildDepth = Math.max(leftResult.depth, rightResult.depth);
    const currentDepth = maxChildDepth + 1;
    
    depthCalculation.textContent = `
Max Depth Calculation for node ${node.val}:
Left subtree depth: ${leftResult.depth}
Right subtree depth: ${rightResult.depth}
Current node depth: max(${leftResult.depth}, ${rightResult.depth}) + 1 = ${currentDepth}
    `;
    
    // Determine if this node is part of the maximum depth path
    const isMaxPath = currentDepth === await findMaxDepth(buildTree(treeInput.value.split(',').map(v => v.trim() === 'null' ? null : parseInt(v))));
    
    if (isMaxPath) {
        await highlightNode(node, 'max-path');
        if (node.left && leftResult.isMaxPath) {
            await highlightEdge(node, node.left, 'max-path');
        }
        if (node.right && rightResult.isMaxPath) {
            await highlightEdge(node, node.right, 'max-path');
        }
    } else {
        await highlightNode(node, 'visited');
    }
    
    addStep(`Node ${node.val} has maximum depth ${currentDepth}`);
    await sleep(animationSpeed);
    
    return { depth: currentDepth, isMaxPath };
}

// Helper function to find max depth without visualization
async function findMaxDepth(node) {
    if (!node) return 0;
    const leftDepth = await findMaxDepth(node.left);
    const rightDepth = await findMaxDepth(node.right);
    return Math.max(leftDepth, rightDepth) + 1;
} 