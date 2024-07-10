let timer;
let timeLeft = 300;
let questionCounter = 0;
let correctAnswers = 0;
let currentDrill = '';
let correctAnswer = 0;

function startDrill(drillType) {
    currentDrill = drillType;
    document.getElementById('drill-selection').classList.add('hidden');
    document.getElementById('drill').classList.remove('hidden');
    startTimer();
    generateQuestion();
}

function startTimer() {
    document.getElementById('timer').innerText = `Time: ${formatTime(timeLeft)}`;
    timer = setInterval(() => {
        timeLeft -= 1;
        document.getElementById('timer').innerText = `Time: ${formatTime(timeLeft)}`;
        if (timeLeft <= 0) {
            endDrill();
        }
    }, 1000);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${minutes}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;
}

function generateQuestion() {
    let a, b, question, answerChoices = [];
    if (currentDrill === 'addition') {
        a = Math.floor(Math.random() * 20) + 1;
        b = Math.floor(Math.random() * 20) + 1;
        correctAnswer = a + b;
        question = `${a} + ${b}`;
    } else if (currentDrill === 'multiplication') {
        a = Math.floor(Math.random() * 12) + 1;
        b = Math.floor(Math.random() * 12) + 1;
        correctAnswer = a * b;
        question = `${a} * ${b}`;
    } else if (currentDrill === 'division') {
        a = Math.floor(Math.random() * 12) + 1;
        b = Math.floor(Math.random() * 12) + 1;
        while (a % b !== 0) {
            a = Math.floor(Math.random() * 12) + 1;
            b = Math.floor(Math.random() * 12) + 1;
        }
        correctAnswer = a / b;
        question = `${a} / ${b}`;
    }

    document.getElementById('question').innerText = question;

    answerChoices.push(correctAnswer);
    while (answerChoices.length < 4) {
        let wrongAnswer;
        if (currentDrill === 'addition') {
            wrongAnswer = Math.floor(Math.random() * 40);
        } else if (currentDrill === 'multiplication') {
            wrongAnswer = Math.floor(Math.random() * 144);
        } else if (currentDrill === 'division') {
            wrongAnswer = Math.floor(Math.random() * 12) + 1;
        }
        if (wrongAnswer !== correctAnswer && !answerChoices.includes(wrongAnswer)) {
            answerChoices.push(wrongAnswer);
        }
    }

    shuffleArray(answerChoices);

    const buttons = document.querySelectorAll('#answer-buttons button');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].innerText = answerChoices[i];
    }
}

function submitAnswer(button) {
    const answer = parseInt(button.innerText);

    if (answer === correctAnswer) {
        correctAnswers += 1;
    }
    questionCounter += 1;

    if (questionCounter >= 50) {
        endDrill();
    } else {
        generateQuestion();
    }
}
// stops drill after 
function endDrill() {
    clearInterval(timer);
    document.getElementById('drill').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('score').innerText = `You answered ${correctAnswers} out of ${questionCounter} questions correctly!`;
}

// restarts app
function resetApp() {
    timeLeft = 300;
    questionCounter = 0;
    correctAnswers = 0;
    currentDrill = '';
    document.getElementById('drill-selection').classList.remove('hidden');
    document.getElementById('drill').classList.add('hidden');
    document.getElementById('results').classList.add('hidden');
}

// moves the multi choice questions around
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
