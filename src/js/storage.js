export function saveNotes() {
  const workspace = document.getElementById('workspace');
  const nodes = Array.from(workspace.getElementsByClassName('note-node'));

  const data = nodes.map(node => ({
    text: node.textContent,
    left: node.style.left,
    top: node.style.top
  }));

  localStorage.setItem('gimmenote_workspace', JSON.stringify(data));
  alert('Notes saved!');
}

export function loadNotes() {
  const workspace = document.getElementById('workspace');
  const data = JSON.parse(localStorage.getItem('gimmenote_workspace'));

  if (!data) return;

  workspace.innerHTML = ''; // Clear existing nodes

  data.forEach((note, index) => {
    const node = document.createElement('div');
    node.className = 'note-node';
    node.textContent = note.text;
    node.style.position = 'absolute';
    node.style.left = note.left;
    node.style.top = note.top;
    node.style.width = '120px';
    node.style.height = '80px';
    node.style.background = '#e0e0ff';
    node.style.border = '1px solid #999';
    node.style.padding = '10px';
    node.style.cursor = 'move';
    node.draggable = true;

    node.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', node.id);
    });

    workspace.appendChild(node);
  });
}