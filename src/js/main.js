// Import core functions
import { addNode } from './nodes.js';
import { saveNotes, loadNotes } from './storage.js';
import { initPanZoom } from './panzoom.js';

// Import port connection logic
import { setupPortListeners } from './nodes.js';

// Import node definitions and popup logic
import { availableNodes, showNodeSearchPopup } from './nodeSearch.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize pan/zoom
  initPanZoom();

  // Setup event listeners
  const addBtn = document.getElementById('add-node-btn');
  const saveBtn = document.getElementById('save-btn');
  const loadBtn = document.getElementById('load-btn');

  if (addBtn) addBtn.addEventListener('click', addNode);
  if (saveBtn) saveBtn.addEventListener('click', saveNotes);
  if (loadBtn) loadBtn.addEventListener('click', loadNotes);

  // Double-click to open node search popup
  const viewport = document.getElementById('viewport');
  if (viewport) {
    viewport.addEventListener('dblclick', (e) => {
      const rect = viewport.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      showNodeSearchPopup(clickX, clickY, (selectedNode) => {
        if (selectedNode) {
          addNodeAtPosition(selectedNode, clickX, clickY);
        }
      });
    });
  } else {
    console.warn("Viewport element not found!");
  }
});

function addNodeAtPosition(nodeDef, x, y) {
  const workspace = document.getElementById('workspace-content');

  const node = document.createElement('div');
  node.className = 'note-node';
  node.style.position = 'absolute';
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  node.style.width = '160px';
  node.style.height = '80px';
  node.style.background = nodeDef.color;
  node.style.border = '1px solid #999';
  node.style.padding = '10px';
  node.style.cursor = 'move';
  node.style.userSelect = 'none';
  node.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.1)';
  node.innerHTML = `
    <div class="node-content" style="position: relative; z-index: 2;">
      ${nodeDef.name}
    </div>
    <div class="port input-port" data-type="input" style="position: absolute; left: -6px; top: 35px; width: 12px; height: 12px; background: #444; border-radius: 50%; cursor: crosshair;"></div>
    <div class="port output-port" data-type="output" style="position: absolute; right: -6px; top: 35px; width: 12px; height: 12px; background: #444; border-radius: 50%; cursor: crosshair;"></div>
  `;

  workspace.appendChild(node);
  setupPortListeners(node);
}