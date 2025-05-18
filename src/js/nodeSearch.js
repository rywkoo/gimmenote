// src/js/nodeSearch.js

export const availableNodes = [
  { name: 'Note', color: '#e0e0ff' },
  { name: 'Text', color: '#ffe0e0' },
  { name: 'Image', color: '#e0ffe0' },
  { name: 'Logic', color: '#e0f7ff' },
  { name: 'Output', color: '#fff2e0' }
];

export function showNodeSearchPopup(x, y, onSelect) {
  const popup = document.getElementById('node-search-popup');
  const input = document.getElementById('node-search-input');
  const resultsContainer = document.getElementById('node-search-results');

  if (!popup || !input || !resultsContainer) {
    console.error("Popup DOM elements not found!");
    return;
  }

  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;
  popup.style.display = 'block';
  input.focus();

  let selectedIndex = 0;

  function populateResults(query = '') {
    resultsContainer.innerHTML = '';
    const filtered = availableNodes.filter(n =>
      n.name.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
      const noResult = document.createElement('div');
      noResult.textContent = 'No matching nodes';
      noResult.style.padding = '6px';
      noResult.style.color = '#999';
      resultsContainer.appendChild(noResult);
      return;
    }

    selectedIndex = 0;

    filtered.forEach((nodeDef, index) => {
      const item = document.createElement('div');
      item.className = 'node-search-result-item';
      item.textContent = nodeDef.name;
      item.dataset.index = index;

      item.addEventListener('click', () => {
        popup.style.display = 'none';
        onSelect(nodeDef);
      });

      resultsContainer.appendChild(item);
    });

    highlightResult(selectedIndex);
  }

  function highlightResult(index) {
    Array.from(resultsContainer.children).forEach((child, i) => {
      child.style.backgroundColor = i === index ? '#e0e0ff' : '';
    });
  }

  input.value = '';
  input.oninput = () => {
    populateResults(input.value);
  };

  input.onkeydown = (e) => {
    if (e.key === 'ArrowDown') {
      selectedIndex = Math.min(selectedIndex + 1, availableNodes.length - 1);
      highlightResult(selectedIndex);
    } else if (e.key === 'ArrowUp') {
      selectedIndex = Math.max(selectedIndex - 1, 0);
      highlightResult(selectedIndex);
    } else if (e.key === 'Enter') {
      const selected = resultsContainer.children[selectedIndex];
      if (selected) selected.click();
    } else if (e.key === 'Escape') {
      popup.style.display = 'none';
    }
  };

  populateResults();
}