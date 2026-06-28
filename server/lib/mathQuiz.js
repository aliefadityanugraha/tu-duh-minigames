/**
 * Generator soal matematika sederhana untuk:
 * - Mini-game sabotase Provokator (perkalian/pembagian/penjumlahan/pengurangan)
 * Soal ini terpisah dari bank soal Pancasila.
 */

function _shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const OPS = ['+', '-', '*', '/'];

/**
 * Menghasilkan satu soal math acak beserta 4 pilihan jawaban.
 * @returns {{ question: string, options: string[], answer: number }}
 */
function generateMathQuiz() {
  const op = OPS[Math.floor(Math.random() * OPS.length)];
  let a, b, correct;

  switch (op) {
    case '+':
      a = _rand(10, 50); b = _rand(10, 50);
      correct = a + b;
      break;
    case '-':
      a = _rand(20, 80); b = _rand(5, a); // pastikan hasil positif
      correct = a - b;
      break;
    case '*':
      a = _rand(2, 12); b = _rand(2, 12);
      correct = a * b;
      break;
    case '/':
      b = _rand(2, 10);
      correct = _rand(2, 12);
      a = b * correct; // pastikan hasil bulat
      break;
  }

  const opLabel = op === '*' ? '×' : op === '/' ? '÷' : op;
  const question = `Berapa hasil dari ${a} ${opLabel} ${b}?`;

  // Buat 3 pilihan salah yang dekat dengan jawaban benar
  const wrongSet = new Set();
  while (wrongSet.size < 3) {
    const offset = _rand(1, 10) * (Math.random() < 0.5 ? 1 : -1);
    const wrong  = correct + offset;
    if (wrong !== correct && wrong > 0) wrongSet.add(wrong);
  }

  // Acak posisi jawaban benar di antara 4 opsi (Fisher-Yates)
  const allOptions = _shuffle([correct, ...wrongSet]);
  const answerIndex = allOptions.indexOf(correct);

  return {
    id:       `math_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type:     'math',
    question,
    options:  allOptions.map(String),
    answer:   answerIndex,
  };
}

function _rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = { generateMathQuiz };
