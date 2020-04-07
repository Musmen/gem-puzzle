import '../scss/style.scss';

import renderHTML from './renderHTML';
import Game from './game';

window.onload = () => {
  renderHTML();
  const game = new Game();
  game.init();
};
