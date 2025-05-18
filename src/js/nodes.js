// Store all active connections
export const connections = [];
export { setupPortListeners };
export function addNode() {
  const workspace = document.getElementById('workspace-content');

  const node = document.createElement('div');
  node.className = 'note-node';
  node.style.position = 'absolute';
  node.style.left = Math.random() * 500 + 'px';
  node.style.top = Math.random() * 300 + 'px';
  node.style.width = '160px';
  node.style.height = '80px';
  node.style.background = '#e0e0ff';
  node.style.border = '1px solid #999';
  node.style.padding = '10px';
  node.style.cursor = 'move';
  node.style.userSelect = 'none';
  node.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.1)';
  node.innerHTML += `
    <div class="resize-handle" style="
        position: absolute;
        right: 0;
        bottom: 0;
        width: 10px;
        height: 10px;
        background: #888;
        cursor: nwse-resize;
        z-index: 10;
    "></div>
    `;

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  // Drag logic
  node.addEventListener('mousedown', (e) => {
    if (e.target !== node && !e.target.classList.contains('node-content')) return;

    isDragging = true;
    offsetX = e.clientX - parseInt(node.style.left);
    offsetY = e.clientY - parseInt(node.style.top);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  function onMouseMove(e) {
    if (!isDragging) return;
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
  }

  function onMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  workspace.appendChild(node);

  setupPortListeners(node);
}

function setupPortListeners(node) {
  const ports = node.querySelectorAll('.port');
  let isDrawing = false;
  let drawingLine = null;
  let startX = 0, startY = 0;
  let sourcePort = null;

  ports.forEach(port => {
    port.addEventListener('mousedown', (e) => {
      e.stopPropagation(); // Prevent node drag

      const portRect = port.getBoundingClientRect();

      // Apply your custom Y offset (-148) and X offset (-17)
      startX = portRect.left - window.scrollX + portRect.width / 2 - 17;
      startY = portRect.top - window.scrollY + portRect.height / 2 - 148;

      drawingLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      drawingLine.setAttribute("x1", startX);
      drawingLine.setAttribute("y1", startY);
      drawingLine.setAttribute("x2", startX);
      drawingLine.setAttribute("y2", startY);
      drawingLine.setAttribute("stroke", port.style.backgroundColor); // Match line color to port
      drawingLine.setAttribute("stroke-width", "2");

      document.querySelector('svg').appendChild(drawingLine);

      isDrawing = true;
      sourcePort = port;

      document.addEventListener('mousemove', onDrawMouseMove);
      document.addEventListener('mouseup', onDrawMouseUp);
    });
  });

  function onDrawMouseMove(e) {
    if (!isDrawing || !drawingLine) return;

    const targetX = e.clientX - 17;     // Apply X offset
    const targetY = e.clientY - 148;    // Apply Y offset

    drawingLine.setAttribute("x2", targetX);
    drawingLine.setAttribute("y2", targetY);
  }

  function onDrawMouseUp(e) {
    if (!isDrawing || !drawingLine) return;

    isDrawing = false;
    document.removeEventListener('mousemove', onDrawMouseMove);
    document.removeEventListener('mouseup', onDrawMouseUp);

    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (target && target.classList.contains('port') && target !== sourcePort) {
      const targetPortRect = target.getBoundingClientRect();

      const endX = targetPortRect.left - window.scrollX + targetPortRect.width / 2 - 17;
      const endY = targetPortRect.top - window.scrollY + targetPortRect.height / 2 - 148;

      drawingLine.setAttribute("x2", endX);
      drawingLine.setAttribute("y2", endY);

      // Save connection metadata
      connections.push({
        line: drawingLine,
        source: sourcePort,
        target: target
      });

      // Update line when either node moves
      addMoveListenerForNode(sourcePort.closest('.note-node'), () => updateConnections(connections));
      addMoveListenerForNode(target.closest('.note-node'), () => updateConnections(connections));

    } else {
      drawingLine.remove();
    }
  }
}

// Helper to detect node movement and update lines
function addMoveListenerForNode(node, callback) {
  let lastLeft = node.style.left;
  let lastTop = node.style.top;

  const observer = new MutationObserver(() => {
    if (node.style.left !== lastLeft || node.style.top !== lastTop) {
      lastLeft = node.style.left;
      lastTop = node.style.top;
      callback();
    }
  });

  observer.observe(node, { attributes: true, attributeFilter: ['style'] });
}

// Update all connections' line positions
export function updateConnections(connectionsList) {
  connectionsList.forEach(conn => {
    const sourcePort = conn.source;
    const targetPort = conn.target;

    const sourceRect = sourcePort.getBoundingClientRect();
    const targetRect = targetPort.getBoundingClientRect();

    // Apply your custom offsets (-17, -148)
    const x1 = sourceRect.left - window.scrollX + sourceRect.width / 2 - 17;
    const y1 = sourceRect.top - window.scrollY + sourceRect.height / 2 - 148;

    const x2 = targetRect.left - window.scrollX + targetRect.width / 2 - 17;
    const y2 = targetRect.top - window.scrollY + targetRect.height / 2 - 148;

    conn.line.setAttribute("x1", x1);
    conn.line.setAttribute("y1", y1);
    conn.line.setAttribute("x2", x2);
    conn.line.setAttribute("y2", y2);
  });
}

export function initPanZoom(workspaceContentId = 'workspace-content', viewportId = 'viewport') {
  const viewport = document.getElementById(viewportId);
  const content = document.getElementById(workspaceContentId);

  let isPanning = false;
  let lastX = 0, lastY = 0;
  let scale = 1;
  let offsetX = 0, offsetY = 0;

  // Mouse Wheel Zoom
  viewport.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return; // Require Ctrl key for zoom
    e.preventDefault();

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    scale *= zoomFactor;

    // Limit zoom levels
    scale = Math.max(0.3, Math.min(scale, 3));

    // Apply transform
    content.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  });

  // Pan with mouse hold + drag
  viewport.addEventListener('mousedown', (e) => {
    // Only allow panning with middle/right click or Ctrl + left click
    if ((e.button === 1 || e.button === 0 && e.ctrlKey)) {
      isPanning = true;
      lastX = e.clientX;
      lastY = e.clientY;
      viewport.style.cursor = 'grabbing';
    }
  });

  viewport.addEventListener('mousemove', (e) => {
    if (!isPanning) return;

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    offsetX += dx;
    offsetY += dy;

    lastX = e.clientX;
    lastY = e.clientY;

    content.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  });

  viewport.addEventListener('mouseup', () => {
    isPanning = false;
    viewport.style.cursor = 'default';
  });

  viewport.addEventListener('mouseleave', () => {
    isPanning = false;
    viewport.style.cursor = 'default';
  });
}

const resizeHandle = node.querySelector('.resize-handle');

let isResizing = false;
let startX, startY, startWidth, startHeight;

resizeHandle.addEventListener('mousedown', (e) => {
  e.stopPropagation();
  isResizing = true;
  startX = e.clientX;
  startY = e.clientY;
  startWidth = parseInt(node.style.width);
  startHeight = parseInt(node.style.height);

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});

function onMouseMove(e) {
  if (!isResizing) return;
  const newWidth = startWidth + (e.clientX - startX);
  const newHeight = startHeight + (e.clientY - startY);
  if (newWidth > 50) node.style.width = `${newWidth}px`;
  if (newHeight > 30) node.style.height = `${newHeight}px`;
}

function onMouseUp() {
  isResizing = false;
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
}