import { DEFAULT } from './helper.js';
import { initArray, shuffleArray } from './utils.js';

export default class Game {
  constructor() {
    this.field = [];
    this.size = DEFAULT.FIELD_SIZE;
  }

  init() {
    let baseField = initArray(this.size);
    this.field = shuffleArray(baseField);

    const gameField = document.querySelector('#gameField');
    gameField.innerHTML = this.field;

    const sizeSelect = document.querySelector('#sizeSelect');
    const sizeOutput = document.querySelector('.size__output');
    sizeSelect.addEventListener('change', (event) => {
      this.size = +event.target.value;
      baseField = initArray(this.size);
      this.field = shuffleArray(baseField);
      gameField.innerText = this.field;
      sizeOutput.innerText = event.target.selectedOptions[0].innerText;
    });
  }
}