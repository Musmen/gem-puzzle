import { DEFAULT, EMPTY_ELEMENT, THROTTLING_DELAY } from './helper.js';
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

    this.targetCell = null;
    this.belowElement = null;
    this.draggingCell = null;
    this.startCoordinates = null;

    this.isDropAble = false;

    this.sizeOutputElement = null;
    this.fieldElement = null;
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
  }

  startButtonHandler() {
    this.field = shuffleField(this.field);
    clearFieldElement(this.fieldElement);
    renderField(this.fieldElement, this.field);
  }

  swapCells(firstValue, secondValue) {
    const { field } = this;

    const firstIndex = field.indexOf(firstValue);
    const secondIndex = field.indexOf(secondValue);

    [field[firstIndex], field[secondIndex]] = [field[secondIndex], field[firstIndex]];
  }

  onDraggingCellMouseMoveHandler(evt) {
    const {
      startX, startY,
      shiftX, shiftY,
    } = this.startCoordinates;


    if (!this.draggingCell) {
      const moveX = evt.pageX;
      const moveY = evt.pageY;
      const deltaX = Math.abs(moveX - startX);
      const deltaY = Math.abs(moveY - startY);
      if (deltaX < DEFAULT.DEBOUNCING_COORDINATE_DELTA
        && deltaY < DEFAULT.DEBOUNCING_COORDINATE_DELTA) return;

      const clone = this.targetCell.cloneNode(true);
      this.targetCell.classList.add('hidden');
      clone.classList.add('moveable');
      document.body.append(clone);
      this.draggingCell = document.body.querySelector('.moveable');
    }

    moveAt(this.draggingCell, evt.pageX, evt.pageY, shiftX, shiftY);

    this.draggingCell.classList.add('hidden');
    const belowElement = document.elementFromPoint(evt.clientX, evt.clientY);
    this.draggingCell.classList.remove('hidden');

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

  onDraggingCellMouseUpHandler() {
    document.removeEventListener('mousemove', this.onDraggingCellMouseMoveHandler);
    document.removeEventListener('mouseup', this.onDraggingCellMouseUpHandler);

    this.targetCell.classList.remove('hidden');
    if (!this.isDropAble && this.draggingCell) {
      this.draggingCell.remove();
      this.draggingCell = null;
      return;
    }

    this.isDropAble = false;
    if (this.draggingCell) {
      this.draggingCell.remove();
      this.draggingCell = null;
    }

    this.swapCells(EMPTY_ELEMENT, this.targetCell.innerText);
    clearFieldElement(this.fieldElement);
    renderField(this.fieldElement, this.field);
  }

  onFieldMouseDownHandler(event) {
    if (!isNeighbor(this.field, this.size, event.target)) return;
    this.targetCell = event.target;
    this.belowElement = null;

    this.startCoordinates = {
      x: event.pageX,
      y: event.pageY,
      shiftX: event.clientX - this.targetCell.getBoundingClientRect().left,
      shiftY: event.clientY - this.targetCell.getBoundingClientRect().top,
    };

    document.addEventListener('mousemove', this.onDraggingCellMouseMoveHandler);
    document.addEventListener('mouseup', this.onDraggingCellMouseUpHandler);
  }

  init() {
    this.fieldElement = document.querySelector('#gameField');
    this.sizeOutputElement = document.querySelector('.size__output');
    this.changeFieldSize(DEFAULT.FIELD_SIZE);

    const sizeSelect = document.querySelector('#sizeSelect');
    sizeSelect.addEventListener('change', this.sizeChangeHandler.bind(this));

    const startButton = document.querySelector('#startButton');
    startButton.addEventListener('click', this.startButtonHandler.bind(this));

    this.onFieldMouseDownHandler = this.onFieldMouseDownHandler.bind(this);
    this.onDraggingCellMouseMoveHandler = throttle(this.onDraggingCellMouseMoveHandler,
      THROTTLING_DELAY).bind(this);
    this.onDraggingCellMouseUpHandler = this.onDraggingCellMouseUpHandler.bind(this);

    this.fieldElement.addEventListener('mousedown', this.onFieldMouseDownHandler);
  }
}
