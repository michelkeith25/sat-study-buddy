
let allQuestions = [];
let filteredQuestions = [];
let currentQuestionIndex = 0;
let timer;
let timeLeft = 60;
let score = 0;
let startTime;

const questionText = document.getElementById('question-text');
const answerButtons = document.getElementById('answer-buttons');
const nextBtn = document.getElementById('next-btn');
const explanationBox = document.getElementById('explanation');
const timerDisplay = document.getElementById('timer');

async function loadQuestions() {
  const res = await fetch('sat_study_buddy_questions.json');
  allQuestions = await res.json();
}

function startQuiz() {
  const category = document.getElementById('category').value;
  const difficulty = document.getElementById('difficulty').value;

  filteredQuestions = allQuestions.filter(q =>
    q.category === category && q.difficulty === difficulty
  );

  filteredQuestions.sort(() => Math.random() - 0.5);

  document.getElementById('quiz').style.display = 'block';
  document.getElementById('leaderboard').style.display = 'none';
  currentQuestionIndex = 0;
  score = 0;
  showQuestion();
}

function showQuestion() {
  resetState();
  startTimer();
  startTime = new Date().getTime();

  const question = filteredQuestions[currentQuestionIndex];
  questionText.textContent = question.question;

  question.answers.forEach(answer => {
    const btn = document.createElement('button');
    btn.textContent = answer.text;
    btn.onclick = () => selectAnswer(answer.correct, question);
    answerButtons.appendChild(btn);
  });
}

function resetState() {
  clearInterval(timer);
  timeLeft = 60;
  timerDisplay.textContent = '';
  nextBtn.style.display = 'none';
  explanationBox.style.display = 'none';
  answerButtons.innerHTML = '';
}

function startTimer() {
  timerDisplay.textContent = `Time left: ${timeLeft}s`;
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      autoSubmit();
    }
  }, 1000);
}

function selectAnswer(isCorrect, question) {
  clearInterval(timer);
  Array.from(answerButtons.children).forEach(btn => btn.disabled = true);

  if (isCorrect) {
    event.target.classList.add('correct');
    const timeTaken = (new Date().getTime() - startTime) / 1000;
    score += 10;
    if (timeTaken < 15) {
      score += 5;
    }
  } else {
    event.target.classList.add('incorrect');
    explanationBox.innerHTML = `
      <strong>Explanation:</strong> ${question.explanation}<br>
      <a href="${question.reference}" target="_blank">Learn more</a>
    `;
    explanationBox.style.display = 'block';
  }

  nextBtn.style.display = 'block';
}

function autoSubmit() {
  explanationBox.innerHTML = `
    <strong>Time's up!</strong><br>
    <a href="${filteredQuestions[currentQuestionIndex].reference}" target="_blank">Review the concept</a>
  `;
  explanationBox.style.display = 'block';
  Array.from(answerButtons.children).forEach(btn => btn.disabled = true);
  nextBtn.style.display = 'block';
}

nextBtn.onclick = () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < filteredQuestions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
};

function endQuiz() {
  document.getElementById('quiz').style.display = 'none';
  const playerName = prompt("🎉 Quiz Complete! Enter your name for the leaderboard:");
  if (playerName) {
    saveToLeaderboard(playerName, score);
  }
  showLeaderboard();
}

function saveToLeaderboard(name, score) {
  const leaderboard = JSON.parse(localStorage.getItem('satLeaderboard')) || [];
  leaderboard.push({ name, score, date: new Date().toLocaleString() });
  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem('satLeaderboard', JSON.stringify(leaderboard.slice(0, 5)));
}

function showLeaderboard() {
  const board = document.getElementById('leaderboard');
  const leaderboard = JSON.parse(localStorage.getItem('satLeaderboard')) || [];
  board.innerHTML = '<h2>🏆 Leaderboard</h2>';
  leaderboard.forEach((entry, index) => {
    board.innerHTML += `<p>${index + 1}. ${entry.name} — ${entry.score} pts (${entry.date})</p>`;
  });
  board.style.display = 'block';
}

loadQuestions();
