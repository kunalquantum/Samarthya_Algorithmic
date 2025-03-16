// DOM Elements
const treeInput = document.getElementById('treeInput');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const visualizeBtn = document.getElementById('visualizeBtn');
const resetBtn = document.getElementById('resetBtn');
const treeDisplay = document.getElementById('treeDisplay');
const currentNodeInfo = document.getElementById('currentNodeInfo');
const traversalStatus = document.getElementById('traversalStatus');
const traversalNodes = document.getElementById('traversalNodes');
const currentOperation = document.getElementById('currentOperation');
const currentStep = document.getElementById('currentStep');
const stepsContainer = document.getElementById('stepsContainer');
const result = document.getElementById('result');

// Global Variables
let isVisualizing = false;
let animationSpeed = 1000;
let nodePositions = new Map();
let traversalResult = [];
let currentTraversalType = 'inorder';
let traversalIndex = 0;

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
    
    // Set default traversal type
    const traversalRadios = document.querySelectorAll('input[name="traversalType"]');
    traversalRadios.forEach(radio => {
        if (radio.checked) {
            currentTraversalType = radio.value;
        }
        
        radio.addEventListener('change', () => {
            if (radio.checked) {
                currentTraversalType = radio.value;
                resetVisualization();
                
                // Update UI to reflect selected traversal type
                updateTraversalTypeUI(radio.value);
            }
        });
    });
    
    // Initial UI update
    updateTraversalTypeUI(currentTraversalType);
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
    document.querySelectorAll('input[name="traversalType"]').forEach(radio => {
        radio.disabled = disabled;
    });
    isVisualizing = disabled;
}

function addStep(step, type = 'normal') {
    const stepElement = document.createElement('div');
    stepElement.className = 'step';
    
    if (type !== 'normal') {
        stepElement.classList.add(`step-${type}`);
    }
    
    stepElement.textContent = step;
    stepsContainer.appendChild(stepElement);
    stepsContainer.scrollTop = stepsContainer.scrollHeight;
}

function updateCurrentStep(step, type = 'normal') {
    currentStep.textContent = step;
    currentStep.className = 'current-step';
    
    if (type !== 'normal') {
        currentStep.classList.add(`step-${type}`);
    }
}

function updateNodeInfo(nodeVal) {
    const nodeValueSpan = currentNodeInfo.querySelector('.node-value span');
    nodeValueSpan.textContent = nodeVal === null ? 'null' : nodeVal;
    
    // Add animation to highlight the change
    nodeValueSpan.classList.remove('highlight-change');
    void nodeValueSpan.offsetWidth; // Trigger reflow
    nodeValueSpan.classList.add('highlight-change');
}

function updateTraversalStatus(status, text) {
    traversalStatus.className = 'traversal-status';
    if (status) {
        traversalStatus.classList.add(status);
    }
    const statusText = traversalStatus.querySelector('.status-text');
    statusText.textContent = text;
    
    // Add animation to highlight the change
    statusText.classList.remove('highlight-change');
    void statusText.offsetWidth; // Trigger reflow
    statusText.classList.add('highlight-change');
}

function updateTraversalTypeUI(type) {
    // Update colors and styles based on selected traversal type
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue(`--${type}-color`);
    
    // Update current operation background
    currentOperation.style.borderColor = primaryColor;
    
    // Update step highlights
    document.querySelectorAll('.step').forEach(step => {
        step.style.borderLeftColor = primaryColor;
    });
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
    
    // Add tooltip with node value
    node.setAttribute('title', `Node value: ${value}`);
    
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
    
    // Add a legend for the tree
    addTreeLegend();
}

function addTreeLegend() {
    const legend = document.createElement('div');
    legend.className = 'tree-legend';
    
    const legendItems = [
        { class: 'current', label: 'Current Node' },
        { class: 'processing-left', label: 'Processing Left' },
        { class: 'processing-right', label: 'Processing Right' },
        { class: 'visited', label: 'Visited Node' }
    ];
    
    legendItems.forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        
        const legendColor = document.createElement('span');
        legendColor.className = `legend-color ${item.class}`;
        
        const legendLabel = document.createElement('span');
        legendLabel.className = 'legend-label';
        legendLabel.textContent = item.label;
        
        legendItem.appendChild(legendColor);
        legendItem.appendChild(legendLabel);
        legend.appendChild(legendItem);
    });
    
    treeDisplay.appendChild(legend);
}

async function highlightNode(node, type) {
    if (!node) return;
    
    const pos = nodePositions.get(node);
    if (!pos) return;
    
    const nodeElement = document.querySelector(`.tree-node[data-value="${node.val}"]`);
    
    if (nodeElement) {
        // Remove existing highlight classes
        nodeElement.classList.remove('inorder-current', 'preorder-current', 'postorder-current', 'processing-left', 'processing-right', 'visited');
        
        // Add new highlight class
        nodeElement.classList.add(type);
        
        // Scroll to ensure the node is visible
        nodeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        await sleep(animationSpeed / 2);
    }
}

async function highlightEdge(parent, child, type) {
    if (!parent || !child) return;
    
    const edge = document.querySelector(`.tree-edge[data-parent="${parent.val}"][data-child="${child.val}"]`);
    
    if (edge) {
        // Remove existing highlight classes
        edge.classList.remove('processing-left', 'processing-right', 'visited');
        
        // Add new highlight class
        edge.classList.add(type);
        
        await sleep(animationSpeed / 2);
    }
}

function addTraversalNode(value) {
    const nodeElement = document.createElement('div');
    nodeElement.className = `traversal-node ${currentTraversalType}`;
    nodeElement.textContent = value;
    
    // Add index number to show order
    const indexSpan = document.createElement('span');
    indexSpan.className = 'node-index';
    indexSpan.textContent = traversalIndex + 1;
    nodeElement.appendChild(indexSpan);
    
    traversalNodes.appendChild(nodeElement);
    
    // Trigger animation
    setTimeout(() => {
        nodeElement.classList.add('visible');
    }, 50);
    
    traversalResult.push(value);
    traversalIndex++;
    
    // Update current operation to show the traversal order
    currentOperation.textContent = `${currentTraversalType.charAt(0).toUpperCase() + currentTraversalType.slice(1)} Traversal Order: [${traversalResult.join(', ')}]`;
}

// Traversal Functions
async function inorderTraversal(node) {
    if (!node) return;
    
    // Process left subtree
    updateCurrentStep(`Going to left subtree of node ${node.val}`, 'left');
    addStep(`Processing left subtree of node ${node.val}`, 'left');
    updateTraversalStatus('processing-left', 'Processing Left Subtree');
    
    if (node.left) {
        await highlightNode(node, 'processing-left');
        await highlightEdge(node, node.left, 'processing-left');
        await inorderTraversal(node.left);
    } else {
        addStep(`Node ${node.val} has no left child`, 'info');
        await sleep(animationSpeed / 2);
    }
    
    // Process current node
    updateCurrentStep(`Visiting node ${node.val}`, 'visit');
    addStep(`Visiting node ${node.val} (Inorder position: ${traversalIndex + 1})`, 'visit');
    updateNodeInfo(node.val);
    updateTraversalStatus('visiting', 'Visiting Node');
    
    await highlightNode(node, 'inorder-current');
    addTraversalNode(node.val);
    await sleep(animationSpeed);
    
    // Mark node as visited
    await highlightNode(node, 'visited');
    
    // Process right subtree
    updateCurrentStep(`Going to right subtree of node ${node.val}`, 'right');
    addStep(`Processing right subtree of node ${node.val}`, 'right');
    updateTraversalStatus('processing-right', 'Processing Right Subtree');
    
    if (node.right) {
        await highlightNode(node, 'processing-right');
        await highlightEdge(node, node.right, 'processing-right');
        await inorderTraversal(node.right);
    } else {
        addStep(`Node ${node.val} has no right child`, 'info');
        await sleep(animationSpeed / 2);
    }
}

async function preorderTraversal(node) {
    if (!node) return;
    
    // Process current node first
    updateCurrentStep(`Visiting node ${node.val}`, 'visit');
    addStep(`Visiting node ${node.val} (Preorder position: ${traversalIndex + 1})`, 'visit');
    updateNodeInfo(node.val);
    updateTraversalStatus('visiting', 'Visiting Node');
    
    await highlightNode(node, 'preorder-current');
    addTraversalNode(node.val);
    await sleep(animationSpeed);
    
    // Mark node as visited
    await highlightNode(node, 'visited');
    
    // Process left subtree
    updateCurrentStep(`Going to left subtree of node ${node.val}`, 'left');
    addStep(`Processing left subtree of node ${node.val}`, 'left');
    updateTraversalStatus('processing-left', 'Processing Left Subtree');
    
    if (node.left) {
        await highlightNode(node, 'processing-left');
        await highlightEdge(node, node.left, 'processing-left');
        await preorderTraversal(node.left);
    } else {
        addStep(`Node ${node.val} has no left child`, 'info');
        await sleep(animationSpeed / 2);
    }
    
    // Process right subtree
    updateCurrentStep(`Going to right subtree of node ${node.val}`, 'right');
    addStep(`Processing right subtree of node ${node.val}`, 'right');
    updateTraversalStatus('processing-right', 'Processing Right Subtree');
    
    if (node.right) {
        await highlightNode(node, 'processing-right');
        await highlightEdge(node, node.right, 'processing-right');
        await preorderTraversal(node.right);
    } else {
        addStep(`Node ${node.val} has no right child`, 'info');
        await sleep(animationSpeed / 2);
    }
}

async function postorderTraversal(node) {
    if (!node) return;
    
    // Process left subtree first
    updateCurrentStep(`Going to left subtree of node ${node.val}`, 'left');
    addStep(`Processing left subtree of node ${node.val}`, 'left');
    updateTraversalStatus('processing-left', 'Processing Left Subtree');
    
    if (node.left) {
        await highlightNode(node, 'processing-left');
        await highlightEdge(node, node.left, 'processing-left');
        await postorderTraversal(node.left);
    } else {
        addStep(`Node ${node.val} has no left child`, 'info');
        await sleep(animationSpeed / 2);
    }
    
    // Process right subtree
    updateCurrentStep(`Going to right subtree of node ${node.val}`, 'right');
    addStep(`Processing right subtree of node ${node.val}`, 'right');
    updateTraversalStatus('processing-right', 'Processing Right Subtree');
    
    if (node.right) {
        await highlightNode(node, 'processing-right');
        await highlightEdge(node, node.right, 'processing-right');
        await postorderTraversal(node.right);
    } else {
        addStep(`Node ${node.val} has no right child`, 'info');
        await sleep(animationSpeed / 2);
    }
    
    // Process current node last
    updateCurrentStep(`Visiting node ${node.val}`, 'visit');
    addStep(`Visiting node ${node.val} (Postorder position: ${traversalIndex + 1})`, 'visit');
    updateNodeInfo(node.val);
    updateTraversalStatus('visiting', 'Visiting Node');
    
    await highlightNode(node, 'postorder-current');
    addTraversalNode(node.val);
    await sleep(animationSpeed);
    
    // Mark node as visited
    await highlightNode(node, 'visited');
}

function showResult() {
    result.textContent = `${currentTraversalType.charAt(0).toUpperCase() + currentTraversalType.slice(1)} Traversal Result: [${traversalResult.join(', ')}]`;
    result.className = 'result-content completed';
    
    // Highlight all nodes in the traversal order
    highlightTraversalPath();
}

async function highlightTraversalPath() {
    // Reset all node highlights
    document.querySelectorAll('.tree-node').forEach(node => {
        node.classList.remove('inorder-current', 'preorder-current', 'postorder-current', 'processing-left', 'processing-right', 'visited');
        node.classList.add('path-highlight');
        
        // Add order number to each node
        const nodeValue = node.getAttribute('data-value');
        const orderIndex = traversalResult.indexOf(parseInt(nodeValue));
        
        if (orderIndex !== -1) {
            const orderLabel = document.createElement('div');
            orderLabel.className = 'order-label';
            orderLabel.textContent = orderIndex + 1;
            node.appendChild(orderLabel);
            
            // Delay the appearance of each node based on its order
            setTimeout(() => {
                node.classList.add('highlight-order');
            }, orderIndex * 200);
        }
    });
}

function resetVisualization() {
    treeDisplay.innerHTML = '';
    traversalNodes.innerHTML = '';
    currentNodeInfo.querySelector('.node-value span').textContent = '';
    
    updateTraversalStatus('', 'Not Started');
    
    currentOperation.textContent = '';
    currentStep.textContent = '';
    stepsContainer.innerHTML = '';
    result.textContent = '';
    result.className = 'result-content';
    
    traversalResult = [];
    traversalIndex = 0;
    
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
    
    updateCurrentStep(`Starting ${currentTraversalType} traversal...`);
    addStep(`Building tree from input values`);
    addStep(`Starting ${currentTraversalType} traversal`);
    
    // Update current operation
    currentOperation.textContent = `${currentTraversalType.charAt(0).toUpperCase() + currentTraversalType.slice(1)} Traversal: Visualizing step by step`;
    
    try {
        // Reset traversal result
        traversalResult = [];
        traversalIndex = 0;
        
        // Start traversal based on selected type
        switch (currentTraversalType) {
            case 'inorder':
                await inorderTraversal(root);
                break;
            case 'preorder':
                await preorderTraversal(root);
                break;
            case 'postorder':
                await postorderTraversal(root);
                break;
        }
        
        updateCurrentStep(`${currentTraversalType.charAt(0).toUpperCase() + currentTraversalType.slice(1)} traversal complete!`, 'success');
        addStep(`${currentTraversalType.charAt(0).toUpperCase() + currentTraversalType.slice(1)} traversal complete: [${traversalResult.join(', ')}]`, 'success');
        updateTraversalStatus('completed', 'Traversal Completed');
        showResult();
    } catch (error) {
        console.error('Error during visualization:', error);
    } finally {
        setControlsState(false);
    }
} 