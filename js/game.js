import {
  DEFAULT,
  DEBOUNCING_COORDINATE_DELTA,
  THROTTLING_DELAY,
  ANIMATION_DELAY,
  ONE_SECOND,
  TIME_BUTTON_TEXT,
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
    this.time = {
      game: 0,
      start: null,
      now: null,
    };
    this.clockID = null;

    this.targetCell = null;
    this.belowElement = null;
    this.cloneCell = null;
    this.coordinates = null;

    this.isDropAble = false;
    this.isDragging = false;
    this.isAnimation = false;
    this.isPaused = false;

    this.sizeOutputElement = null;
    this.turnOutputElement = null;
    this.timeOutputElement = {
      seconds: null,
      minutes: null,
    };
    this.fieldElement = null;
    this.timeButton = null;
  }

  setTurn(value) {
    this.turn = value;
    this.renderTurn();
  }

  getTurn() {
    return this.turn;
  }

  renderTurn() {
    this.turnOutputElement.innerText = this.getTurn();
  }

  renderTime() {
    this.time.now = new Date();

    const gameTime = new Date(this.time.now - this.time.start + this.time.game);
    const minutes = `0${gameTime.getMinutes()}`.slice(-2);
    const seconds = `0${gameTime.getSeconds()}`.slice(-2);

    this.timeOutputElement.seconds.innerText = seconds;
    this.timeOutputElement.minutes.innerText = minutes;
  }

  startClock() {
    this.isPaused = false;
    if (this.clockID) clearInterval(this.clockID);

    this.time.start = new Date();
    this.renderTime();

    this.clockID = setInterval(() => {
      this.renderTime();
    }, ONE_SECOND);
  }

  pauseClock() {
    if (this.clockID) clearInterval(this.clockID);
    this.time.game = this.time.now - this.time.start + this.time.game;
    this.isPaused = true;
  }

  clearClock() {
    this.time = {
      game: 0,
      start: 0,
      now: 0,
    };
  }

  timeButtonHandler() {
    const button = this.timeButton;

    if (button.innerText.toLowerCase() === TIME_BUTTON_TEXT.STOP) {
      button.innerText = TIME_BUTTON_TEXT.RESUME;
      this.pauseClock();
      return;
    }

    button.innerText = TIME_BUTTON_TEXT.STOP;
    this.startClock();
  }

  renderSizeOutput(cells) {
    const size = Math.sqrt(cells);
    this.sizeOutputElement.innerText = `${size}x${size}`;
  }

  setFieldSize(size) {
    this.size = size;
  }

  setSize(size) {
    this.setFieldSize(size);
    this.renderSizeOutput(size);
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
    this.setTurn(0);
    this.clearClock();
    this.startClock();
  }

  startButtonHandler() {
    this.field = shuffleField(this.field);
    clearFieldElement(this.fieldElement);
    renderField(this.fieldElement, this.field);
    this.setTurn(0);
    this.clearClock();
    this.startClock();
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
    } = this.coordinates;

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
    this.setTurn(this.turn + 1);
  }

  onFieldMouseDownHandler(event) {
    if (!isNeighbor(this.field, this.size, event.target) || this.isAnimation) return;
    if (!this.clockID) this.startClock();
    if (this.isPaused) this.timeButtonHandler();
    this.targetCell = event.target;
    this.targetCell.ondragstart = () => false;

    this.belowElement = null;

    this.coordinates = {
      startX: event.pageX,
      startY: event.pageY,
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
      this.coordinates.startX,
      this.coordinates.startY,
      this.coordinates.shiftX,
      this.coordinates.shiftY,
    );

    document.addEventListener('mousemove', this.onCloneCellMouseMoveHandler);
    document.addEventListener('mouseup', this.onCloneCellMouseUpHandler);
  }

  init() {
    this.fieldElement = document.querySelector('#gameField');
    this.sizeOutputElement = document.querySelector('.size__output');
    this.turnOutputElement = document.querySelector('.game__turn');
    this.timeOutputElement.seconds = document.querySelector('.time__seconds');
    this.timeOutputElement.minutes = document.querySelector('.time__minutes');
    this.timeButton = document.querySelector('#timeButton');
    this.changeFieldSize(DEFAULT.FIELD_SIZE);

    const sizeSelect = document.querySelector('#sizeSelect');
    sizeSelect.addEventListener('change', this.sizeChangeHandler.bind(this));

    const startButton = document.querySelector('#startButton');
    startButton.addEventListener('click', this.startButtonHandler.bind(this));

    this.timeButton.addEventListener('click', this.timeButtonHandler.bind(this));

    this.onFieldMouseDownHandler = this.onFieldMouseDownHandler.bind(this);
    this.onCloneCellMouseMoveHandler = throttle(this.onCloneCellMouseMoveHandler,
      THROTTLING_DELAY).bind(this);
    this.onCloneCellMouseUpHandler = this.onCloneCellMouseUpHandler.bind(this);

    this.fieldElement.addEventListener('mousedown', this.onFieldMouseDownHandler);
  }
}
