import {
  DEFAULT,
  DEBOUNCING_COORDINATE_DELTA,
  THROTTLING_DELAY,
  ANIMATION_DELAY,
} from './helper.js';

import {
  shuffleField,
  generateField,
  renderField,
  clearFieldElement,
  changeFieldClass,
  isNeighbor,
  moveAt,
  throttle,
} from './utils.js';

export default class Game {
  constructor() {
    this.field = [];
    this.size = null;
    this.turn = null;

    this.targetCell = null;
    this.belowElement = null;
    this.cloneCell = null;
    this.startCoordinates = null;

    this.isDropAble = false;
    this.isDragging = false;
    this.isAnimation = false;

    this.sizeOutputElement = null;
    this.turnOutputElement = null;
    this.fieldElement = null;
  }

  clearTurn() {
    this.turn = 0;
    this.renderTurn();
  }

  addTurn() {
    this.turn += 1;
    this.renderTurn();
  }

  getTurn() {
    return this.turn;
  }

  renderTurn() {
    this.turnOutputElement.innerText = this.getTurn();
  }

  setSizeOutput(cells) {
    const size = Math.sqrt(cells);
    this.sizeOutputElement.innerText = `${size}x${size}`;
  }

  setFieldSize(size) {
    this.size = size;
  }

  setSize(size) {
    this.setFieldSize(size);
    this.setSizeOutput(size);
  }

  changeFieldSize(newSize) {
    this.setSize(newSize);
    this.field = generateField(newSize);
    clearFieldElement(this.fieldElement);
    changeFieldClass(this.fieldElement, newSize);
    renderField(this.fieldElement, this.field);
  }

  sizeChangeHandler(event) {
    const { target } = event;
    const newSize = +target.value;
    this.changeFieldSize(newSize);
    this.clearTurn();
  }

  startButtonHandler() {
    this.field = shuffleField(this.field);
    clearFieldElement(this.fieldElement);
    renderField(this.fieldElement, this.field);
    this.clearTurn();
  }

  swapCells(firstValue, secondValue) {
    const { field } = this;

    const firstIndex = field.indexOf(firstValue);
    const secondIndex = field.indexOf(secondValue);
    [field[firstIndex], field[secondIndex]] = [field[secondIndex], field[firstIndex]];
  }

  animatedSwapCells(firstElement, secondElement) {
    const animatedElement = secondElement;

    this.isAnimation = true;
    animatedElement.classList.add('animated');
    animatedElement.style.top = `${firstElement.offsetTop}px`;
    animatedElement.style.left = `${firstElement.offsetLeft}px`;

    setTimeout(() => {
      this.isAnimation = false;
      animatedElement.classList.remove('animated');
      this.isDropAble = false;
      this.isDragging = false;
      this.cloneCell.remove();
      this.cloneCell = null;

      const firstValue = firstElement.innerText;
      const secondValue = secondElement.innerText;
      this.swapCells(firstValue, secondValue);
      clearFieldElement(this.fieldElement);
      renderField(this.fieldElement, this.field);
    }, ANIMATION_DELAY);
  }

  onCloneCellMouseMoveHandler(evt) {
    const {
      startX, startY,
      shiftX, shiftY,
    } = this.startCoordinates;

    if (!this.isDragging) {
      const moveX = evt.pageX;
      const moveY = evt.pageY;
      const deltaX = Math.abs(moveX - startX);
      const deltaY = Math.abs(moveY - startY);
      if (deltaX < DEBOUNCING_COORDINATE_DELTA
        && deltaY < DEBOUNCING_COORDINATE_DELTA) return;
      this.isDragging = true;
    }

    moveAt(this.cloneCell, evt.pageX, evt.pageY, shiftX, shiftY);

    this.cloneCell.classList.add('hidden');
    const belowElement = document.elementFromPoint(evt.clientX, evt.clientY);
    this.cloneCell.classList.remove('hidden');

    const dropAbleBelow = belowElement.closest('.field__cell_empty');

    if (dropAbleBelow) {
      this.belowElement = dropAbleBelow;
      this.belowElement.classList.add('shadow');
      this.isDropAble = true;
    } else {
      if (this.belowElement) this.belowElement.classList.remove('shadow');
      this.isDropAble = false;
      this.belowElement = null;
    }
  }

  onCloneCellMouseUpHandler() {
    document.removeEventListener('mousemove', this.onCloneCellMouseMoveHandler);
    document.removeEventListener('mouseup', this.onCloneCellMouseUpHandler);

    const emptyElement = document.body.querySelector('.field__cell_empty');

    if (!this.isDropAble && this.isDragging) {
      this.targetCell.classList.remove('hidden');
      this.cloneCell.remove();
      this.cloneCell = null;
      this.isDragging = false;
      return;
    }

    this.animatedSwapCells(emptyElement, this.cloneCell);
    this.addTurn();
  }

  onFieldMouseDownHandler(event) {
    if (!isNeighbor(this.field, this.size, event.target) || this.isAnimation) return;

    this.targetCell = event.target;
    this.targetCell.ondragstart = () => false;

    this.belowElement = null;

    this.startCoordinates = {
      x: event.pageX,
      y: event.pageY,
      shiftX: event.clientX - this.targetCell.getBoundingClientRect().left,
      shiftY: event.clientY - this.targetCell.getBoundingClientRect().top,
    };

    const clone = this.targetCell.cloneNode(true);
    this.targetCell.classList.add('hidden');
    clone.classList.add('moveable');
    document.body.append(clone);
    this.cloneCell = document.body.querySelector('.moveable');
    moveAt(
      this.cloneCell,
      this.startCoordinates.x,
      this.startCoordinates.y,
      this.startCoordinates.shiftX,
      this.startCoordinates.shiftY,
    );

    document.addEventListener('mousemove', this.onCloneCellMouseMoveHandler);
    document.addEventListener('mouseup', this.onCloneCellMouseUpHandler);
  }

  init() {
    this.fieldElement = document.querySelector('#gameField');
    this.sizeOutputElement = document.querySelector('.size__output');
    this.turnOutputElement = document.querySelector('.game__turn');
    this.changeFieldSize(DEFAULT.FIELD_SIZE);

    const sizeSelect = document.querySelector('#sizeSelect');
    sizeSelect.addEventListener('change', this.sizeChangeHandler.bind(this));

    const startButton = document.querySelector('#startButton');
    startButton.addEventListener('click', this.startButtonHandler.bind(this));

    this.onFieldMouseDownHandler = this.onFieldMouseDownHandler.bind(this);
    this.onCloneCellMouseMoveHandler = throttle(this.onCloneCellMouseMoveHandler,
      THROTTLING_DELAY).bind(this);
    this.onCloneCellMouseUpHandler = this.onCloneCellMouseUpHandler.bind(this);

    this.fieldElement.addEventListener('mousedown', this.onFieldMouseDownHandler);
  }
}
