let score = 0;
let streak = 0;
let currentQuestion = 0;
let totalQuestions = 10;
let correctAnswer = 0;
let timeLimit = 10;
let timeLeft = timeLimit;
let timerInterval;
let difficulty = 'easy';
let correctAnswers = 0;

function selectDifficulty(level) {
    difficulty = level;
    const buttons = document.querySelectorAll('.difficultyBtn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    if (level === 'easy') buttons[0].classList.add('selected');
    else if (level === 'medium') buttons[1].classList.add('selected');
    else if (level === 'hard') buttons[2].classList.add('selected');
    if (level === 'easy') timeLimit = 10;
    else if (level === 'medium') timeLimit = 7;
    else if (level === 'hard') timeLimit = 5;
}

function generateEquation() {
    let num1, num2, operator, equation;
    if (difficulty === 'easy') {
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        operator = Math.random() > 0.5 ? '+' : '-';
        if (operator === '-' && num1 < num2) [num1, num2] = [num2, num1];
    } else if (difficulty === 'medium') {
        num1 = Math.floor(Math.random() * 30) + 5;
        num2 = Math.floor(Math.random() * 15) + 2;
        const ops = ['+', '-', '×'];
        operator = ops[Math.floor(Math.random() * ops.length)];
        if (operator === '-' && num1 < num2) [num1, num2] = [num2, num1];
    } else {
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * 20) + 2;
        const ops = ['+', '-', '×', '÷'];
        operator = ops[Math.floor(Math.random() * ops.length)];
        if (operator === '-' && num1 < num2) [num1, num2] = [num2, num1];
        if (operator === '÷') {
            num1 = num2 * Math.floor(Math.random() * 10 + 2);
        }
    }
    equation = `${num1} ${operator} ${num2}`;
    switch(operator) {
        case '+': correctAnswer = num1 + num2; break;
        case '-': correctAnswer = num1 - num2; break;
        case '×': correctAnswer = num1 * num2; break;
        case '÷': correctAnswer = num1 / num2; break;
    }
    document.getElementById('equation').textContent = equation;
}

function startTimer() {
    timeLeft = timeLimit;
    const timerBar = document.getElementById('timerBar');
    const timerText = document.getElementById('timerText');
    timerBar.style.width = '100%';
    timerBar.className = 'timerBar';
    timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        const percentage = (timeLeft / timeLimit) * 100;
        timerBar.style.width = percentage + '%';
        timerText.textContent = Math.ceil(timeLeft) + 's';
        if (timeLeft <= timeLimit * 0.3) {
            timerBar.className = 'timerBar danger';
        } else if (timeLeft <= timeLimit * 0.5) {
            timerBar.className = 'timerBar warning';
        }
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            wrongAnswer();
        }
    }, 100);
}

function submitAnswer() {
    const userAnswer = parseFloat(document.getElementById('answerInput').value);
    if (isNaN(userAnswer)) return;
    clearInterval(timerInterval);
    if (userAnswer === correctAnswer) {
        correctAnswers++;
        streak++;
        const timeBonus = Math.floor(timeLeft * 10);
        const points = 100 + timeBonus + (streak * 20);
        score += points;
        showFeedback(`✓ Correct! +${points} points`, 'correct');
        document.getElementById('score').textContent = score;
        document.getElementById('streak').textContent = streak;
    } else {
        wrongAnswer();
        return;
    }
    setTimeout(nextQuestion, 1500);
}

function wrongAnswer() {
    streak = 0;
    showFeedback(`✗ Wrong! The answer was ${correctAnswer}`, 'wrong');
    document.getElementById('streak').textContent = streak;
    setTimeout(nextQuestion, 1500);
}

function showFeedback(message, type) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.className = 'feedback ' + type;
    feedback.style.display = 'block';
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion >= totalQuestions) {
        endGame();
        return;
    }
    document.getElementById('current').textContent = currentQuestion + 1;
    document.getElementById('answerInput').value = '';
    const feedback = document.getElementById('feedback');
    feedback.style.display = 'none';
    feedback.className = 'feedback';
    generateEquation();
    startTimer();
    document.getElementById('answerInput').focus();
}

function startGame() {
    document.getElementById('startScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    document.getElementById('gameOverScreen').classList.remove('active');
    score = 0;
    streak = 0;
    currentQuestion = 0;
    correctAnswers = 0;
    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = streak;
    document.getElementById('current').textContent = 1;
    document.getElementById('total').textContent = totalQuestions;
    generateEquation();
    startTimer();
    document.getElementById('answerInput').focus();
}

function endGame() {
    clearInterval(timerInterval);
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('gameOverScreen').classList.add('active');
    document.getElementById('finalScore').textContent = score;
    document.getElementById('correctCount').textContent = correctAnswers;
}

function restartGame() {
    document.getElementById('gameOverScreen').classList.remove('active');
    document.getElementById('startScreen').classList.add('active');
}

document.querySelector('.startBtn').addEventListener('click', startGame);
document.getElementById('answerInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') submitAnswer();
});
window.SubmitAnswer = submitAnswer;
window.restartGame = restartGame;