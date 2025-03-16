// DOM Elements
const treeInput = document.getElementById('treeInput');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const visualizeBtn = document.getElementById('visualizeBtn');
const resetBtn = document.getElementById('resetBtn');
const treeDisplay = document.getElementById('treeDisplay');
const currentNodeInfo = document.getElementById('currentNodeInfo');
const currentOperation = document.getElementById('currentOperation');
const currentStep = document.getElementById('currentStep');
const stepsContainer = document.getElementById('stepsContainer');
const result = document.getElementById('result');

// Global Variables
let isVisualizing = false;
let animationSpeed = 1000;
let nodePositions = new Map();
let maxDiameter = 0;
let diameterPath = [];

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

function updateHeightInfo(leftHeight, rightHeight, totalPath) {
    const leftHeightSpan = currentNodeInfo.querySelector('.left-height');
    const rightHeightSpan = currentNodeInfo.querySelector('.right-height');
    const totalPathSpan = currentNodeInfo.querySelector('.total-path');
    
    leftHeightSpan.textContent = leftHeight;
    rightHeightSpan.textContent = rightHeight;
    totalPathSpan.textContent = totalPath;
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
        nodeElement.classList.remove('current', 'left-path', 'right-path', 'diameter-path');
        
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
        edge.classList.remove('left-path', 'right-path', 'diameter-path');
        
        // Add new highlight class
        edge.classList.add(type);
        
        await sleep(animationSpeed / 2);
    }
}

async function findDiameter(node) {
    if (!node) {
        updateCurrentStep('Reached null node');
        addStep('Returning height 0 for null node');
        return { height: 0, leftPath: [], rightPath: [] };
    }
    
    // Highlight current node
    await highlightNode(node, 'current');
    updateCurrentStep(`Visiting node with value ${node.val}`);
    addStep(`Processing node ${node.val}`);
    updateNodeInfo(node.val);
    
    await sleep(animationSpeed);
    
    // Process left subtree
    updateCurrentStep(`Calculating height of left subtree of node ${node.val}`);
    addStep(`Going to left child of ${node.val}`);
    
    let leftResult = { height: 0, leftPath: [], rightPath: [] };
    if (node.left) {
        await highlightEdge(node, node.left, 'left-path');
        leftResult = await findDiameter(node.left);
    }
    
    // Process right subtree
    updateCurrentStep(`Calculating height of right subtree of node ${node.val}`);
    addStep(`Going to right child of ${node.val}`);
    
    let rightResult = { height: 0, leftPath: [], rightPath: [] };
    if (node.right) {
        await highlightEdge(node, node.right, 'right-path');
        rightResult = await findDiameter(node.right);
    }
    
    // Calculate height and path through current node
    const leftHeight = leftResult.height;
    const rightHeight = rightResult.height;
    const pathThroughNode = leftHeight + rightHeight;
    
    updateHeightInfo(leftHeight, rightHeight, pathThroughNode);
    updateCurrentStep(`Node ${node.val}: Left height = ${leftHeight}, Right height = ${rightHeight}, Path = ${pathThroughNode}`);
    addStep(`Node ${node.val} has path length ${pathThroughNode} (left height ${leftHeight} + right height ${rightHeight})`);
    
    // Update max diameter if current path is longer
    if (pathThroughNode > maxDiameter) {
        maxDiameter = pathThroughNode;
        
        // Construct the diameter path
        const leftPath = leftResult.leftPath.length > leftResult.rightPath.length ? 
                        leftResult.leftPath : leftResult.rightPath;
        const rightPath = rightResult.leftPath.length > rightResult.rightPath.length ? 
                        rightResult.leftPath : rightResult.rightPath;
        
        diameterPath = [...leftPath.reverse(), node, ...rightPath];
        
        updateCurrentStep(`New maximum diameter found: ${maxDiameter} at node ${node.val}`);
        addStep(`Updated maximum diameter to ${maxDiameter}`);
    }
    
    // Determine which subtree has the greater height
    const maxChildHeight = Math.max(leftHeight, rightHeight);
    const currentHeight = maxChildHeight + 1;
    
    // Construct paths for this node
    let leftPath = [], rightPath = [];
    if (leftHeight > rightHeight) {
        leftPath = [node, ...leftResult.leftPath.length > leftResult.rightPath.length ? 
                    leftResult.leftPath : leftResult.rightPath];
    } else {
        rightPath = [node, ...rightResult.leftPath.length > rightResult.rightPath.length ? 
                    rightResult.leftPath : rightResult.rightPath];
    }
    
    addStep(`Node ${node.val} has height ${currentHeight}`);
    await sleep(animationSpeed);
    
    return { 
        height: currentHeight,
        leftPath,
        rightPath
    };
}

async function highlightDiameterPath() {
    updateCurrentStep(`Highlighting the diameter path with length ${maxDiameter}`);
    addStep(`Final diameter: ${maxDiameter}`);
    
    // Highlight all nodes in the diameter path
    for (let i = 0; i < diameterPath.length; i++) {
        await highlightNode(diameterPath[i], 'diameter-path');
        
        // Highlight edges between nodes in the path
        if (i < diameterPath.length - 1) {
            // Find if the next node is a left or right child
            const current = diameterPath[i];
            const next = diameterPath[i + 1];
            
            if (current.left === next || current.right === next) {
                await highlightEdge(current, next, 'diameter-path');
            } else if (next.left === current || next.right === current) {
                await highlightEdge(next, current, 'diameter-path');
            }
        }
    }
}

function showResult() {
    result.textContent = `The diameter of the tree is ${maxDiameter}`;
    result.className = 'result-content show';
}

function resetVisualization() {
    treeDisplay.innerHTML = '';
    currentNodeInfo.querySelector('.node-value span').textContent = '';
    currentNodeInfo.querySelector('.left-height').textContent = '0';
    currentNodeInfo.querySelector('.right-height').textContent = '0';
    currentNodeInfo.querySelector('.total-path').textContent = '0';
    currentOperation.textContent = '';
    currentStep.textContent = '';
    stepsContainer.innerHTML = '';
    result.textContent = '';
    result.className = 'result-content';
    
    maxDiameter = 0;
    diameterPath = [];
    
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
    displayTree(root, treeDisplay, nodePositions);
    
    updateCurrentStep('Starting diameter calculation...');
    addStep('Building tree from input values');
    
    try {
        // Reset global variables
        maxDiameter = 0;
        diameterPath = [];
        
        // Start recursive calculation
        await findDiameter(root);
        
        // Highlight the diameter path
        await highlightDiameterPath();
        
        updateCurrentStep(`Diameter calculation complete!`);
        addStep(`Final diameter of the tree: ${maxDiameter}`);
        showResult();
    } catch (error) {
        console.error('Error during visualization:', error);
    } finally {
        setControlsState(false);
    }
} 