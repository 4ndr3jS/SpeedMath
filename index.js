import { supabase } from './supabaseClient.js';

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
let leaderboard = [];

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
    showNameInput();
}

function restartGame() {
    document.getElementById('gameOverScreen').classList.remove('active');
    document.getElementById('startScreen').classList.add('active');
}

function renderLeaderboardHeader() {
    const table = document.querySelector('.container .table');
    const header = document.createElement('div');
    header.className = 'leaderboard-header';
    const placeLabel = document.createElement('div');
    placeLabel.className = 'leaderboard-cell place';
    placeLabel.textContent = '#';
    const nameLabel = document.createElement('div');
    nameLabel.className = 'leaderboard-cell';
    nameLabel.textContent = 'Name';
    const scoreLabel = document.createElement('div');
    scoreLabel.className = 'leaderboard-cell score';
    scoreLabel.textContent = 'Score';
    header.appendChild(placeLabel);
    header.appendChild(nameLabel);
    header.appendChild(scoreLabel);
    table.appendChild(header);
}

function renderLeaderboardRows(data) {
    const table = document.querySelector('.container .table');
    data.forEach((entry, i) => {
        const row = document.createElement('div');
        row.className = 'leaderboard-row' + (i % 2 === 1 ? ' alt' : '');
        const placeCell = document.createElement('div');
        placeCell.className = 'leaderboard-cell place';
        placeCell.textContent = i + 1;
        const nameCell = document.createElement('div');
        nameCell.className = 'leaderboard-cell name';
        nameCell.textContent = entry.name;
        const scoreCell = document.createElement('div');
        scoreCell.className = 'leaderboard-cell score';
        scoreCell.textContent = entry.score;
        row.appendChild(placeCell);
        row.appendChild(nameCell);
        row.appendChild(scoreCell);
        table.appendChild(row);
    });
}

function showNameInput() {
    let input = document.getElementById('leaderboardNameInput');
    let btn = document.getElementById('leaderboardSubmitBtn');
    if (!input) {
        input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter your name';
        input.id = 'leaderboardNameInput';
        input.className = 'answerInput';
        btn = document.createElement('button');
        btn.textContent = 'Submit to Leaderboard';
        btn.id = 'leaderboardSubmitBtn';
        btn.className = 'submitBtn';
        btn.style.marginTop = '10px';
        btn.onclick = submitToLeaderboard;
        const over = document.getElementById('gameOverScreen');
        over.appendChild(input);
        over.appendChild(btn);
    } else {
        input.style.display = '';
        btn.style.display = '';
    }
}

async function fetchLeaderboard() {
    try {
        const { data, error } = await supabase
            .from('leaderboard')
            .select('name, score')
            .order('score', { ascending: false })
            .limit(10);
        if (error) {
            console.error('Error fetching leaderboard:', error);
            return;
        }
        const table = document.querySelector('.container .table');
        table.innerHTML = '';
        renderLeaderboardHeader();
        renderLeaderboardRows(data);
    } catch (err) {
        console.error('Error:', err);
    }
}

async function submitToLeaderboard() {
    const input = document.getElementById('leaderboardNameInput');
    let name = input.value.trim();
    if (!name) return;
    input.style.display = 'none';
    document.getElementById('leaderboardSubmitBtn').style.display = 'none';
    try {
        const { error } = await supabase
            .from('leaderboard')
            .insert([{ name, score }]);
        if (error) {
            console.error('Error submitting score:', error);
            alert('Error submitting score.');
            return;
        }
        setTimeout(() => {
            fetchLeaderboard();
        }, 200);
    } catch (err) {
        console.error('Error:', err);
        alert('Error submitting score.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.startBtn').addEventListener('click', startGame);
    
    document.querySelectorAll('.difficultyBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectDifficulty(btn.dataset.difficulty);
        });
    });
    document.getElementById('submitBtn').addEventListener('click', submitAnswer);
    
    document.getElementById('answerInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitAnswer();
    });
    
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    
    fetchLeaderboard();
});