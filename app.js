const RUN_TARGET = 10;
const CALIBRATION_STORAGE_KEY = "lengthWorkMeasureScale";
const DEFAULT_PX_PER_MM = 96 / 25.4;
const CALIBRATION_MM = 50;
const MEASURE_TOLERANCE_MM = 1;

const modes = {
  ruler: {
    label: "目盛りを読む",
    hint: "大きな目盛りをcm、そこから小さい目盛りをmmで数えよう。",
  },
  "cm-to-mm": {
    label: "cm → mm",
    hint: "1cmは10mm。cmの数に10をかけるとmmになるよ。",
  },
  "mm-to-cm": {
    label: "mm → cm",
    hint: "10mmで1cm。10のまとまりをcmにして、あまりをmmで書こう。",
  },
  "measure-real": {
    label: "じっさいにはかる",
    hint: "画面の目盛りではなく、本物のものさしを使って、0にそろえてはかろう。",
  },
};

const measureTargets = [
  {
    item: "青い線",
    icon: "━",
    shape: "line",
    color: "#3b82f6",
    tip: "線の左はしを0に合わせて、右はしまでをまっすぐはかろう。",
  },
  {
    item: "オレンジの棒",
    icon: "▰",
    shape: "bar",
    color: "#f97316",
    tip: "棒の左はしから右はしまでの長さをはかろう。",
  },
  {
    item: "みどりの長方形の横",
    icon: "▭",
    shape: "rectangle-width",
    color: "#16a34a",
    tip: "長方形の横の長さを、ものさしをななめにしないようにはかろう。",
  },
  {
    item: "むらさきの長方形のたて",
    icon: "▯",
    shape: "rectangle-height",
    color: "#8b5cf6",
    tip: "長方形のたての長さを、上から下までまっすぐはかろう。",
  },
];

const els = {
  guideRuler: document.querySelector("#guide-ruler"),
  problemRuler: document.querySelector("#problem-ruler"),
  conversionVisual: document.querySelector("#conversion-visual"),
  measureCard: document.querySelector("#measure-card"),
  questionType: document.querySelector("#question-type"),
  questionText: document.querySelector("#question-text"),
  hintText: document.querySelector("#hint-text"),
  answerForm: document.querySelector("#answer-form"),
  rulerAnswerFields: document.querySelector("#ruler-answer-fields"),
  singleAnswerFields: document.querySelector("#single-answer-fields"),
  singleAnswerLabel: document.querySelector("#single-answer-label"),
  singleUnitLabel: document.querySelector("#single-unit-label"),
  cmInput: document.querySelector("#cm-input"),
  mmInput: document.querySelector("#mm-input"),
  singleInput: document.querySelector("#single-input"),
  feedback: document.querySelector("#feedback"),
  modeTabs: [...document.querySelectorAll(".mode-tab")],
  newProblemButton: document.querySelector("#new-problem-button"),
  showAnswerButton: document.querySelector("#show-answer-button"),
  correctCount: document.querySelector("#correct-count"),
  progressBar: document.querySelector("#progress-bar"),
  remainingMessage: document.querySelector("#remaining-message"),
  resetScoreButton: document.querySelector("#reset-score-button"),
};

const state = {
  mode: "ruler",
  problem: null,
  correct: 0,
  hintLevel: 0,
  pxPerMm: loadCalibrationScale(),
  isCalibrated: hasSavedCalibrationScale(),
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function readSavedCalibrationScale() {
  const savedValue = window.sessionStorage.getItem(CALIBRATION_STORAGE_KEY);
  const parsedValue = Number(savedValue);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

function loadCalibrationScale() {
  return readSavedCalibrationScale() ?? DEFAULT_PX_PER_MM;
}

function hasSavedCalibrationScale() {
  return readSavedCalibrationScale() !== null;
}

function saveCalibrationScale(pxPerMm) {
  window.sessionStorage.setItem(CALIBRATION_STORAGE_KEY, String(pxPerMm));
}

function mmToPx(mm) {
  return Math.round(mm * state.pxPerMm);
}

function createMeasureProblem(mode) {
  const target = measureTargets[randomInt(0, measureTargets.length - 1)];
  const totalMm = randomInt(18, 84);
  const decorMm = randomInt(18, 46);
  return {
    mode,
    ...target,
    totalMm,
    decorMm,
    cm: Math.floor(totalMm / 10),
    mm: totalMm % 10,
  };
}

function makeTick(index, highlightValue = null) {
  const tick = document.createElement("div");
  tick.className = "tick";
  tick.classList.add(
    index % 10 === 0 ? "cm-tick" : index % 5 === 0 ? "half-tick" : "mm-tick",
  );
  tick.style.left = `${index}%`;

  if (index % 10 === 0) {
    const label = document.createElement("span");
    label.className = "tick-label";
    label.textContent = index / 10;
    tick.append(label);
  }

  if (highlightValue === index) {
    const marker = document.createElement("span");
    marker.className = "marker";
    marker.textContent = "▼";
    tick.append(marker);
  }

  return tick;
}

function renderRuler(container, highlightValue = null) {
  container.innerHTML = "";
  const bar = document.createElement("div");
  bar.className = "ruler-bar";
  for (let index = 0; index <= 100; index += 1) {
    bar.append(makeTick(index, highlightValue));
  }
  container.append(bar);
}

function createProblem(mode) {
  if (mode === "measure-real") {
    return createMeasureProblem(mode);
  }

  if (mode === "ruler") {
    const totalMm = randomInt(7, 98);
    return {
      mode,
      totalMm,
      cm: Math.floor(totalMm / 10),
      mm: totalMm % 10,
    };
  }

  if (mode === "cm-to-mm") {
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

function measureShapeMarkup(problem) {
  const targetPx = mmToPx(problem.totalMm);
  const decorPx = mmToPx(problem.decorMm);
  const colorStyle = `--measure-color: ${problem.color};`;

  if (problem.shape === "rectangle-width") {
    return `<div class="screen-object rectangle-object" style="${colorStyle} width: ${targetPx}px; height: ${decorPx}px;"><span>横をはかる</span></div>`;
  }

  if (problem.shape === "rectangle-height") {
    return `<div class="screen-object rectangle-object vertical-target" style="${colorStyle} width: ${decorPx}px; height: ${targetPx}px;"><span>たてをはかる</span></div>`;
  }

  if (problem.shape === "bar") {
    return `<div class="screen-object bar-object" style="${colorStyle} width: ${targetPx}px;"></div>`;
  }

  return `<div class="screen-object line-object" style="${colorStyle} width: ${targetPx}px;"><span class="line-end start"></span><span class="line-end end"></span></div>`;
}

function updateCalibrationPreview() {
  const calibrationLine = els.measureCard.querySelector(".calibration-line");
  const calibrationStatus = els.measureCard.querySelector(
    ".calibration-status",
  );
  const calibrationValue = els.measureCard.querySelector("#calibration-value");

  if (!calibrationLine || !calibrationStatus || !calibrationValue) return;

  calibrationLine.style.width = `${mmToPx(CALIBRATION_MM)}px`;
  calibrationValue.textContent = `${Math.round(state.pxPerMm * 100) / 100}px/mm`;
  calibrationStatus.textContent = state.isCalibrated
    ? "この大きさをブラウザに一時保存中です。"
    : "本物のものさしで5cmに合わせてから保存してね。";
}

function bindCalibrationControls() {
  const scaleInput = els.measureCard.querySelector("#calibration-scale");
  const saveButton = els.measureCard.querySelector("#save-calibration-button");
  if (!scaleInput || !saveButton) return;

  scaleInput.value = String(state.pxPerMm);
  updateCalibrationPreview();

  scaleInput.addEventListener("input", () => {
    state.pxPerMm = Number(scaleInput.value);
    updateCalibrationPreview();
    renderMeasureObject(state.problem);
  });

  saveButton.addEventListener("click", () => {
    saveCalibrationScale(state.pxPerMm);
    state.isCalibrated = true;
    updateCalibrationPreview();
    els.feedback.textContent =
      "5cmの大きさをこのブラウザに一時保存したよ。次から同じ大きさで表示するね。";
    els.feedback.className = "feedback success";
  });
}

function renderMeasureObject(problem) {
  const objectStage = els.measureCard.querySelector("#measure-object-stage");
  if (!objectStage) return;
  objectStage.innerHTML = measureShapeMarkup(problem);
}

function renderMeasureCard(problem) {
  els.measureCard.hidden = false;
  els.measureCard.innerHTML = `
    <div class="measure-card__top">
      <div class="measure-card__icon" aria-hidden="true">${problem.icon}</div>
      <div>
        <p class="measure-card__label">画面ではかるもの</p>
        <strong>${problem.item}</strong>
        <span>${problem.tip}</span>
      </div>
    </div>

    <div class="calibration-panel" aria-label="画面の長さをものさしに合わせる設定">
      <div>
        <p class="measure-card__label">さいしょに合わせる</p>
        <strong class="calibration-title">この線を本物のものさしで5cmにしよう</strong>
        <span class="calibration-status"></span>
      </div>
      <div class="calibration-line-wrap">
        <div class="calibration-line" aria-hidden="true"></div>
        <span>5cm</span>
      </div>
      <label class="calibration-control">
        <span>大きさを調整</span>
        <input id="calibration-scale" type="range" min="2.4" max="5.4" step="0.01" />
      </label>
      <div class="calibration-actions">
        <button id="save-calibration-button" class="ghost-button" type="button">この大きさを一時保存</button>
        <small id="calibration-value"></small>
      </div>
    </div>

    <div class="measure-object-panel">
      <p class="measure-card__label">もんだい</p>
      <div id="measure-object-stage" class="measure-object-stage" aria-label="ものさしで測る図形"></div>
    </div>
  `;
  bindCalibrationControls();
  renderMeasureObject(problem);
}

function renderConversionVisual(problem) {
  els.conversionVisual.hidden = false;
  if (problem.mode === "cm-to-mm") {
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
  els.feedback.textContent = "こたえを入れて「こたえる」を押そう。";
  els.feedback.className = "feedback";
  els.cmInput.value = "";
  els.mmInput.value = "";
  els.singleInput.value = "";
  els.conversionVisual.hidden = true;
  els.conversionVisual.innerHTML = "";
  els.measureCard.hidden = true;
  els.measureCard.innerHTML = "";

  if (problem.mode === "ruler") {
    els.cmInput.max = "10";
    els.mmInput.max = "9";
    els.questionText.textContent =
      "赤いしるしは何cm何mmかな？ mmだけで表すと何mmかな？";
    els.rulerAnswerFields.hidden = false;
    els.singleAnswerFields.hidden = true;
    renderRuler(els.problemRuler, problem.totalMm);
    els.problemRuler.hidden = false;
    els.cmInput.focus();
    return;
  }

  if (problem.mode === "measure-real") {
    els.cmInput.max = "99";
    els.mmInput.max = "9";
    els.questionText.textContent = `画面の${problem.item}を本物のものさしではかって、何cm何mmかを書こう。`;
    els.rulerAnswerFields.hidden = false;
    els.singleAnswerFields.hidden = true;
    els.problemRuler.hidden = true;
    renderMeasureCard(problem);
    els.cmInput.focus();
    return;
  }

  if (problem.mode === "cm-to-mm") {
    els.questionText.textContent = `${problem.cm}cm は何mmかな？`;
    els.rulerAnswerFields.hidden = true;
    els.singleAnswerFields.hidden = false;
    els.singleAnswerLabel.textContent = "mmでこたえよう";
    els.singleUnitLabel.textContent = "mm";
    els.singleInput.min = "0";
    els.singleInput.max = "100";
    renderRuler(els.problemRuler, problem.totalMm);
    els.problemRuler.hidden = false;
    renderConversionVisual(problem);
    els.singleInput.focus();
    return;
  }

  els.cmInput.max = "10";
  els.mmInput.max = "9";
  els.questionText.textContent = `${problem.totalMm}mm は何cm何mmかな？`;
  els.rulerAnswerFields.hidden = false;
  els.singleAnswerFields.hidden = true;
  renderRuler(els.problemRuler, problem.totalMm);
  els.problemRuler.hidden = false;
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
    tab.classList.toggle("active", tab.dataset.mode === mode);
  });
  nextProblem();
}

function updateScore() {
  els.correctCount.textContent = state.correct;
  els.progressBar.style.width = `${(Math.min(state.correct, RUN_TARGET) / RUN_TARGET) * 100}%`;
  const remaining = Math.max(RUN_TARGET - state.correct, 0);
  els.remainingMessage.textContent =
    remaining === 0
      ? "すごい！ながさスター達成！"
      : `あと${remaining}もんで、ながさスター！`;
}

function measureAnswerMm() {
  const cm = Number(els.cmInput.value);
  const mm = Number(els.mmInput.value);
  if (
    !Number.isInteger(cm) ||
    !Number.isInteger(mm) ||
    cm < 0 ||
    cm > 99 ||
    mm < 0 ||
    mm > 9
  ) {
    return null;
  }
  return cm * 10 + mm;
}

function checkAnswer() {
  const problem = state.problem;
  if (problem.mode === "measure-real") {
    const answerMm = measureAnswerMm();
    return (
      answerMm !== null &&
      Math.abs(answerMm - problem.totalMm) <= MEASURE_TOLERANCE_MM
    );
  }

  if (problem.mode === "cm-to-mm") {
    return Number(els.singleInput.value) === problem.totalMm;
  }
  return (
    Number(els.cmInput.value) === problem.cm &&
    Number(els.mmInput.value) === problem.mm
  );
}

function answerText(problem) {
  if (problem.mode === "measure-real") {
    return `${problem.cm}cm ${problem.mm}mm`;
  }
  if (problem.mode === "cm-to-mm") return `${problem.totalMm}mm`;
  return `${problem.cm}cm ${problem.mm}mm（mmだけなら${problem.totalMm}mm）`;
}

function handleAnswer(event) {
  event.preventDefault();
  if (checkAnswer()) {
    state.correct += 1;
    updateScore();
    els.feedback.textContent =
      state.problem.mode === "measure-real"
        ? `正かい！ ${state.problem.item} は ${answerText(state.problem)}。じょうずにはかれたね。`
        : `正かい！ ${answerText(state.problem)} だね。つぎのもんだいへいこう。`;
    els.feedback.className = "feedback success";
    window.setTimeout(
      nextProblem,
      state.problem.mode === "measure-real" ? 1800 : 850,
    );
    return;
  }

  if (state.problem.mode === "measure-real") {
    const answerMm = measureAnswerMm();
    if (answerMm === null) {
      els.feedback.textContent =
        "cmは0以上、mmは0から9までで書こう。mmが10になったら1cmにくり上げてね。";
    } else {
      const direction =
        answerMm < state.problem.totalMm ? "もう少し長いよ" : "もう少し短いよ";
      els.feedback.textContent = `${direction}。ものさしの0と図形のはしをもう一度そろえてみよう。`;
    }
  } else {
    els.feedback.textContent =
      "もう一度見てみよう。10mmで1cmになることを思い出してね。";
  }
  els.feedback.className = "feedback error";
}

function showMoreHint() {
  state.hintLevel += 1;
  const problem = state.problem;
  if (state.hintLevel === 1) {
    if (problem.mode === "measure-real") {
      els.hintText.textContent =
        "図形のはしをものさしの0に合わせて、最後にこえた大きな目盛りをcm、その先の小さな目盛りをmmで数えよう。";
      return;
    }
    els.hintText.textContent =
      problem.mode === "cm-to-mm"
        ? `${problem.cm}cm は 10mm のまとまりが ${problem.cm}こあるよ。`
        : `${problem.totalMm}mm は、10mmのまとまりを先に数えるよ。`;
    return;
  }
  els.hintText.textContent =
    problem.mode === "measure-real"
      ? `こたえは ${answerText(problem)}。5cmの線を合わせてから、もう一度はかってみよう。`
      : `こたえは ${answerText(problem)}。目盛りとくらべてたしかめよう。`;
}

els.answerForm.addEventListener("submit", handleAnswer);
els.newProblemButton.addEventListener("click", nextProblem);
els.showAnswerButton.addEventListener("click", showMoreHint);
els.resetScoreButton.addEventListener("click", () => {
  state.correct = 0;
  updateScore();
  els.feedback.textContent =
    "スコアをリセットしたよ。もう一度チャレンジしよう。";
  els.feedback.className = "feedback";
});
els.modeTabs.forEach((tab) => {
  tab.addEventListener("click", () => setMode(tab.dataset.mode));
});

renderRuler(els.guideRuler);
updateScore();
nextProblem();
