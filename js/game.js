import { DEFAULT } from './helper.js';
import { initArray, shuffleArray } from './utils.js';

export default class Game {
  constructor() {
    this.field = [];
    this.size = DEFAULT.FIELD_SIZE;
  }

  renderField(container, fieldArray) {
    const gameField = document.createDocumentFragment();

    fieldArray.forEach((item) => {
      const fieldCell = document.createElement('div');
      fieldCell.classList.add('field__cell');
      if (item === 'x') fieldCell.classList.add('field__cell_empty');
      fieldCell.innerText = item;
      gameField.append(fieldCell);
    });

    container.append(gameField);
  }

  getNeighbors(fieldArray, size) {
    const xIndex = fieldArray.indexOf('x');
    const neighbors = {
      top: xIndex - Math.sqrt(size),
      right: xIndex + 1,
      bottom: xIndex + Math.sqrt(size),
      left: xIndex - 1,
    }

    return Object.values(neighbors);
  }

  init() {
    let baseField = initArray(this.size);
    this.field = shuffleArray(baseField);
    // this.field = initArray(this.size);

    const gameField = document.querySelector('#gameField');
    this.renderField(gameField, this.field);

    const sizeSelect = document.querySelector('#sizeSelect');
    const sizeOutput = document.querySelector('.size__output');
    sizeSelect.addEventListener('change', (event) => {
      sizeOutput.innerText = event.target.selectedOptions[0].innerText;
      this.size = +event.target.value;
      baseField = initArray(this.size);
      this.field = shuffleArray(baseField);
      // this.field = initArray(this.size);
      gameField.innerHTML = '';
      gameField.className = `game__field field-size_${event.target.selectedOptions[0].innerText}`;
      this.renderField(gameField, this.field);
    });

    const startButton = document.querySelector('#startButton');
    startButton.addEventListener('click', () => {
      this.field = shuffleArray(this.field);
      gameField.innerHTML = '';
      this.renderField(gameField, this.field);
    });

    gameField.addEventListener('click', (event) => {
      if (!this.getNeighbors(this.field, this.size).includes(this.field.indexOf(event.target.innerText))) return;
      // console.log('neighbor!');
      // debugger;

      const xIndex = this.field.indexOf('x');
      const clickCellIndex = this.field.indexOf(event.target.innerText);

      [this.field[clickCellIndex], this.field[xIndex]] = [this.field[xIndex], this.field[clickCellIndex]];
      gameField.innerHTML = '';
      this.renderField(gameField, this.field);
    });

    console.log(this.getNeighbors(this.field, this.size));
  }
}
