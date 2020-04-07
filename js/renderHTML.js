const renderer = () => {
  document.body.innerHTML = `
    <div class="centralizer">
    <header class="header">
      <nav class="navigation">
        <ul class="navigation__list list">
          <li class="navigation__item">
            <button id="startButton" class="navigation__button button">
              размешать и начать
            </button>
          </li>
          <li class="navigation__item">
            <button id="timeButton" class="navigation__button button">
              стоп
            </button>
          </li>
          <li class="navigation__item">
            <button id="saveButton" class="navigation__button button">
              сохранить
            </button>
          </li>
          <li class="navigation__item">
            <button id="resultsButton" class="navigation__button button">
              результаты
            </button>
          </li>
        </ul>
      </nav>
    </header>

    <main class="main">
      <div class="game">
        <div class="game__description">
          <p class="game__paragraph">Ходов: <span class="game__turn">0</span></p>
          <p class="game__paragraph">
            Время:
            <span class="game__time">
              <span id="minutes" class="time__minutes">00</span> :
              <span id="seconds" class="time__seconds">00</span>
            </span>
          </p>
        </div>

        <div class="size">
          <p class="size__description">
            Размер поля: <span id="sizeOutput" class="size__output">4x4</span>
          </p>
          <p>
            <label for="sizeSelect">Выбрать: </label>
            <select id="sizeSelect" class="size__select">
              <option value="9">3x3</option>
              <option value="16" selected>4x4</option>
              <option value="25">5x5</option>
              <option value="36">6x6</option>
              <option value="49">7x7</option>
              <option value="64">8x8</option>
            </select>
          </p>
        </div>

        <div id="gameField" class="game__field field-size_4x4">
        </div>
      </div>
    </main>

    <footer class="footer">
      <div class="footer__contacts">
        by @Musmen. RSSchool 2020 Q1
      </div>
    </footer>
  </div>

  <template id="popup__template">
    <div class="popup__layout" tabindex="0">
      <div class="popup__wrapper">
        <button class="popup__close-button">X</button>
        <p class="popup__description"></p>
        <p class="popup__message"></p>
      </div>
    </div>
  </template>`;
};

export default renderer;
