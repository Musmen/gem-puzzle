export function initArray(fieldSize) {
  const field = new Array(fieldSize).fill('x');
  return field.map((item, index) => !index ? item : `${index}`);
}

export function shuffleArray(array) {
  const result = array.slice();

  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
