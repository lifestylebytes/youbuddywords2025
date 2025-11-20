// app.js

// questions.js에서 QUESTIONS 사용
let questions = [...QUESTIONS];

const card = document.getElementById("card");
const prefixEl = document.getElementById("sentencePrefix");
const suffixEl = document.getElementById("sentenceSuffix");
const meaningEl = document.getElementById("meaning");
const patternBeforeEl = document.getElementById("patternBefore");
const patternAfterEl = document.getElementById("patternAfter");
const caretEl = document.getElementById("caret");
const answerInput = document.getElementById("answerInput");
const statusEl = document.getElementById("status");
const progressEl = document.getElementById("progress");
const scoreEl = document.getElementById("score");
const skipBtn = document.getElementById("skipBtn");
const resetBtn = document.getElementById("resetBtn");
const enterBtn = document.getElementById("enterBtn"); // 🔹 이 줄 추가


let currentIndex = 0;
let correctCount = 0;
let wrongCount = 0;

// 언더바 패턴용
let patternChars = []; // ["_","_","_"," ","_","_","_", ...]
let totalSlots = 0;

// 배열 섞기 (랜덤 순서)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
shuffle(questions);

// "our very own" → "___ ___ ___"
function buildPatternFromAnswer(answer) {
  const words = answer.trim().split(/\s+/);
  const wordPatterns = words.map(w => "_".repeat(w.length));
  return wordPatterns.join(" ");
}

function setupPattern(answer) {
  const pattern = buildPatternFromAnswer(answer);
  patternChars = pattern.split("");
  totalSlots = answer.replace(/\s/g, "").length;
}

// inputValue 기준으로 before / after 분리해서 그리기
function renderPattern(inputValue) {
  const typed = inputValue.replace(/\s/g, "");
  const caretSlotIndex = Math.min(typed.length, totalSlots);

  let before = "";
  let after = "";
  let slotCounter = 0;

  for (let i = 0; i < patternChars.length; i++) {
    const baseChar = patternChars[i];

    if (baseChar === " ") {
      // 단어 사이 공백
      if (slotCounter < caretSlotIndex) before += " ";
      else after += " ";
    } else {
      // 실제 글자 자리
      let outChar;
      if (slotCounter < typed.length) {
        outChar = typed[slotCounter]; // 이미 친 글자
      } else {
        outChar = "_"; // 아직 안 친 자리
      }

      if (slotCounter < caretSlotIndex) before += outChar;
      else after += outChar;

      slotCounter++;
    }
  }

  patternBeforeEl.textContent = before;
  patternAfterEl.textContent = after;
}

// 문제 세팅
function setSentence(q) {
  wrongCount = 0;

  prefixEl.textContent = q.prefix || "";
  suffixEl.textContent = q.suffix || "";
  meaningEl.textContent = q.meaning || "";

  setupPattern(q.answer);
  renderPattern("");   // 아직 입력 없음
  caretEl.style.display = "inline";

  answerInput.value = "";
  answerInput.disabled = false;
  answerInput.focus();

  statusEl.textContent = "";
  statusEl.className = "status";

  progressEl.textContent = `Q ${currentIndex + 1} / ${questions.length}`;
  scoreEl.textContent = `Score: ${correctCount}`;
}

function normalise(str) {
  return str.trim().replace(/\s+/g, " ").toLowerCase();
}

// 입력할 때마다 패턴 업데이트
function handleInput() {
  const raw = answerInput.value;
  renderPattern(raw);
}

// 다음 문제
function nextQuestion() {
  currentIndex++;
  if (currentIndex >= questions.length) {
    const total = questions.length; // 전체 문장 개수

    progressEl.textContent = "Done";
    statusEl.innerHTML = 
      `모든 문장을 다 쳤어요. 오늘의 You Buddy 세션 끝!<br>` +
      `오늘의 점수는? 두구두구두구 ${total}개 중 ${correctCount}점!`;
    statusEl.className = "status correct";

    answerInput.disabled = true;
    caretEl.style.display = "none";
    return;
  }
  setSentence(questions[currentIndex]);
}


// 정답 보여주고 자동 다음
function revealAndNext() {
  const q = questions[currentIndex];
  patternBeforeEl.textContent = q.answer;
  patternAfterEl.textContent = "";
  caretEl.style.display = "none";

  statusEl.textContent = `정답: "${q.answer}"`;
  statusEl.className = "status";

  setTimeout(nextQuestion, 1200);
}

// Enter로 정답 체크
function checkAnswer() {
  const q = questions[currentIndex];
  const user = normalise(answerInput.value);
  const correct = normalise(q.answer);

  if (!user) {
    statusEl.textContent = "먼저 표현을 한 글자라도 입력해 주세요.";
    statusEl.className = "status wrong";
    card.classList.add("shake");
    setTimeout(() => card.classList.remove("shake"), 250);
    return;
  }

  if (user === correct) {
    correctCount++;
    statusEl.textContent = "딩! 맞았습니다. 다음 문장으로 넘어갈게요.";
    statusEl.className = "status correct";
    card.classList.add("flash");
    scoreEl.textContent = `Score: ${correctCount}`;

    setTimeout(() => {
      card.classList.remove("flash");
      nextQuestion();
    }, 450);
  } else {
    wrongCount++;
    if (wrongCount >= 3) {
      revealAndNext();
      return;
    }
    statusEl.textContent = `음… 이건 아닌 것 같아요. (${wrongCount}/3)`;
    statusEl.className = "status wrong";
    card.classList.add("shake");
    setTimeout(() => card.classList.remove("shake"), 250);
  }
}

answerInput.addEventListener("input", handleInput);
answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    checkAnswer();
  }
});
enterBtn.addEventListener("click", () => {
  checkAnswer();
});

function resetAll() {
  // 원본 QUESTIONS에서 다시 새 배열 만들고 섞기
  questions = [...QUESTIONS];
  shuffle(questions);

  currentIndex = 0;
  correctCount = 0;
  wrongCount = 0;

  scoreEl.textContent = "Score: 0";
  statusEl.textContent = "";
  statusEl.className = "status";

  setSentence(questions[0]);  // 첫 문제 다시 세팅
}


resetBtn.addEventListener("click", resetAll);

skipBtn.addEventListener("click", revealAndNext);

// 첫 문제 시작
setSentence(questions[currentIndex]);
