const RUN_TARGET = 10;
const modes = {
  ruler: {
    label: '目盛りを読む',
    hint: '大きな目盛りをcm、そこから小さい目盛りをmmで数えよう。',
  },
  'cm-to-mm': {
    label: 'cm → mm',
    hint: '1cmは10mm。cmの数に10をかけるとmmになるよ。',
  },
  'mm-to-cm': {
    label: 'mm → cm',
    hint: '10mmで1cm。10のまとまりをcmにして、あまりをmmで書こう。',
  },
};

const els = {
  guideRuler: document.querySelector('#guide-ruler'),
  problemRuler: document.querySelector('#problem-ruler'),
  conversionVisual: document.querySelector('#conversion-visual'),
  questionType: document.querySelector('#question-type'),
  questionText: document.querySelector('#question-text'),
  hintText: document.querySelector('#hint-text'),
  answerForm: document.querySelector('#answer-form'),
  rulerAnswerFields: document.querySelector('#ruler-answer-fields'),
  singleAnswerFields: document.querySelector('#single-answer-fields'),
  singleAnswerLabel: document.querySelector('#single-answer-label'),
  singleUnitLabel: document.querySelector('#single-unit-label'),
  cmInput: document.querySelector('#cm-input'),
  mmInput: document.querySelector('#mm-input'),
  singleInput: document.querySelector('#single-input'),
  feedback: document.querySelector('#feedback'),
  modeTabs: [...document.querySelectorAll('.mode-tab')],
  newProblemButton: document.querySelector('#new-problem-button'),
  showAnswerButton: document.querySelector('#show-answer-button'),
  correctCount: document.querySelector('#correct-count'),
  progressBar: document.querySelector('#progress-bar'),
  remainingMessage: document.querySelector('#remaining-message'),
  resetScoreButton: document.querySelector('#reset-score-button'),
};

const state = {
  mode: 'ruler',
  problem: null,
  correct: 0,
  hintLevel: 0,
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeTick(index, highlightValue = null) {
  const tick = document.createElement('div');
  tick.className = 'tick';
  tick.classList.add(index % 10 === 0 ? 'cm-tick' : index % 5 === 0 ? 'half-tick' : 'mm-tick');
  tick.style.left = `${index}%`;

  if (index % 10 === 0) {
    const label = document.createElement('span');
    label.className = 'tick-label';
    label.textContent = index / 10;
    tick.append(label);
  }

  if (highlightValue === index) {
    const marker = document.createElement('span');
    marker.className = 'marker';
    marker.textContent = '▼';
    tick.append(marker);
  }

  return tick;
}

function renderRuler(container, highlightValue = null) {
  container.innerHTML = '';
  const bar = document.createElement('div');
  bar.className = 'ruler-bar';
  for (let index = 0; index <= 100; index += 1) {
    bar.append(makeTick(index, highlightValue));
  }
  container.append(bar);
}

function createProblem(mode) {
  if (mode === 'ruler') {
    const totalMm = randomInt(7, 98);
    return {
      mode,
      totalMm,
      cm: Math.floor(totalMm / 10),
      mm: totalMm % 10,
    };
  }

  if (mode === 'cm-to-mm') {
    const cm = randomInt(1, 9);
    return { mode, cm, totalMm: cm * 10 };
  }

  const totalMm = randomInt(12, 98);
  return {
    mode,
    totalMm,
    cm: Math.floor(totalMm / 10),
    mm: totalMm % 10,
  };
}

function renderConversionVisual(problem) {
  els.conversionVisual.hidden = false;
  if (problem.mode === 'cm-to-mm') {
    els.conversionVisual.innerHTML = `
      <div class="conversion-number">${problem.cm}cm</div>
      <div class="conversion-sign">× 10</div>
      <div class="conversion-number answer-color">? mm</div>
    `;
    return;
  }

  els.conversionVisual.innerHTML = `
    <div class="bundle-wrap">
      <div class="conversion-number">${problem.totalMm}mm</div>
      <div class="bundle-note">10mmのまとまりを作って、あまりを見つけよう。</div>
      <div class="conversion-number answer-color">? cm ? mm</div>
    </div>
  `;
}

function renderProblem() {
  const problem = state.problem;
  const mode = modes[state.mode];
  els.questionType.textContent = mode.label;
  els.hintText.textContent = mode.hint;
  els.feedback.textContent = 'こたえを入れて「こたえる」を押そう。';
  els.feedback.className = 'feedback';
  els.cmInput.value = '';
  els.mmInput.value = '';
  els.singleInput.value = '';
  els.conversionVisual.hidden = true;
  els.conversionVisual.innerHTML = '';

  if (problem.mode === 'ruler') {
    els.questionText.textContent = '赤いしるしは何cm何mmかな？ mmだけで表すと何mmかな？';
    els.rulerAnswerFields.hidden = false;
    els.singleAnswerFields.hidden = true;
    renderRuler(els.problemRuler, problem.totalMm);
    els.problemRuler.hidden = false;
    els.cmInput.focus();
    return;
  }

  if (problem.mode === 'cm-to-mm') {
    els.questionText.textContent = `${problem.cm}cm は何mmかな？`;
    els.rulerAnswerFields.hidden = true;
    els.singleAnswerFields.hidden = false;
    els.singleAnswerLabel.textContent = 'mmでこたえよう';
    els.singleUnitLabel.textContent = 'mm';
    els.singleInput.min = '0';
    els.singleInput.max = '100';
    renderRuler(els.problemRuler, problem.totalMm);
    renderConversionVisual(problem);
    els.singleInput.focus();
    return;
  }

  els.questionText.textContent = `${problem.totalMm}mm は何cm何mmかな？`;
  els.rulerAnswerFields.hidden = false;
  els.singleAnswerFields.hidden = true;
  renderRuler(els.problemRuler, problem.totalMm);
  renderConversionVisual(problem);
  els.cmInput.focus();
}

function nextProblem() {
  state.hintLevel = 0;
  state.problem = createProblem(state.mode);
  renderProblem();
}

function setMode(mode) {
  state.mode = mode;
  els.modeTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.mode === mode);
  });
  nextProblem();
}

function updateScore() {
  els.correctCount.textContent = state.correct;
  els.progressBar.style.width = `${Math.min(state.correct, RUN_TARGET) / RUN_TARGET * 100}%`;
  const remaining = Math.max(RUN_TARGET - state.correct, 0);
  els.remainingMessage.textContent = remaining === 0
    ? 'すごい！ながさスター達成！'
    : `あと${remaining}もんで、ながさスター！`;
}

function checkAnswer() {
  const problem = state.problem;
  if (problem.mode === 'cm-to-mm') {
    return Number(els.singleInput.value) === problem.totalMm;
  }
  return Number(els.cmInput.value) === problem.cm && Number(els.mmInput.value) === problem.mm;
}

function answerText(problem) {
  if (problem.mode === 'cm-to-mm') return `${problem.totalMm}mm`;
  return `${problem.cm}cm ${problem.mm}mm（mmだけなら${problem.totalMm}mm）`;
}

function handleAnswer(event) {
  event.preventDefault();
  if (checkAnswer()) {
    state.correct += 1;
    updateScore();
    els.feedback.textContent = `正かい！ ${answerText(state.problem)} だね。つぎのもんだいへいこう。`;
    els.feedback.className = 'feedback success';
    window.setTimeout(nextProblem, 850);
    return;
  }

  els.feedback.textContent = 'もう一度見てみよう。10mmで1cmになることを思い出してね。';
  els.feedback.className = 'feedback error';
}

function showMoreHint() {
  state.hintLevel += 1;
  const problem = state.problem;
  if (state.hintLevel === 1) {
    els.hintText.textContent = problem.mode === 'cm-to-mm'
      ? `${problem.cm}cm は 10mm のまとまりが ${problem.cm}こあるよ。`
      : `${problem.totalMm}mm は、10mmのまとまりを先に数えるよ。`;
    return;
  }
  els.hintText.textContent = `こたえは ${answerText(problem)}。目盛りとくらべてたしかめよう。`;
}

els.answerForm.addEventListener('submit', handleAnswer);
els.newProblemButton.addEventListener('click', nextProblem);
els.showAnswerButton.addEventListener('click', showMoreHint);
els.resetScoreButton.addEventListener('click', () => {
  state.correct = 0;
  updateScore();
  els.feedback.textContent = 'スコアをリセットしたよ。もう一度チャレンジしよう。';
  els.feedback.className = 'feedback';
});
els.modeTabs.forEach((tab) => {
  tab.addEventListener('click', () => setMode(tab.dataset.mode));
});

renderRuler(els.guideRuler);
updateScore();
nextProblem();
