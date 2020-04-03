import { EMPTY_ELEMENT } from './helper.js';

export function initField(fieldSize) {
  const field = new Array(fieldSize).fill(EMPTY_ELEMENT);
  return field.map((item, index) => {
    if (index === 0) return item;
    return `${index}`;
  });
}

export function shuffleField(array) {
  const result = array.slice();

  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export function generateField(size) {
  const baseField = initField(size);
  return shuffleField(baseField);
}

export function renderField(container, fieldArray) {
  const gameField = document.createDocumentFragment();

  fieldArray.forEach((item) => {
    const fieldCell = document.createElement('div');
    fieldCell.classList.add('field__cell');
    if (item === EMPTY_ELEMENT) fieldCell.classList.add('field__cell_empty');
    fieldCell.innerText = item;
    gameField.append(fieldCell);
  });

  container.append(gameField);
}

export function clearFieldElement(container) {
  const gameField = container;

  gameField.innerHTML = '';
}

export function changeFieldClass(container, cells) {
  const gameField = container;
  const size = Math.sqrt(cells);

  gameField.className = `game__field field-size_${size}x${size}`;
}

export function getNeighbors(fieldArray, size) {
  const xIndex = fieldArray.indexOf(EMPTY_ELEMENT);
  const neighbors = {
    top: xIndex - Math.sqrt(size),
    right: xIndex + 1,
    bottom: xIndex + Math.sqrt(size),
    left: xIndex - 1,
  };

  return Object.values(neighbors);
}

export function isNeighbor(fieldArray, size, targetCell) {
  return getNeighbors(fieldArray, size).includes(fieldArray.indexOf(targetCell.innerText));
}

export function moveAt(element, newX, newY, shiftX, shiftY) {
  const movedElement = element;

  movedElement.style.left = `${newX - shiftX}px`;
  movedElement.style.top = `${newY - shiftY}px`;
}

export function throttle(callback, interval) {
  let enableCall = true;

  return function applyThrottle(...args) {
    if (!enableCall) return;

    enableCall = false;
    callback.apply(this, args);
    setTimeout(() => { enableCall = true; }, interval);
  };
}
