

let timer;
let timeLeft = 300;
let currentQuestionIndex = 0;
let questions = [];
let correctAnswers = 0;
let currentDrill = '';
let drillHistory = [];

function loadDrillHistory() {
    console.log("Loading drill history");
    const savedHistory = localStorage.getItem('drillHistory');
    if (savedHistory) {
        drillHistory = JSON.parse(savedHistory);
        console.log("Drill history loaded:", drillHistory);
    }
}

function startDrill(drillType) {
    console.log(`Starting ${drillType} drill`);
    currentDrill = drillType;
    document.getElementById('drill-selection').classList.add('hidden');
    document.getElementById('drill').classList.remove('hidden');
    generateQuestions();
    startTimer();
    displayQuestion(currentQuestionIndex);
    updateQuestionsList();
}

function startTimer() {
    console.log("Starting timer");
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

function generateQuestions() {
    console.log("Generating questions");
    questions = [];
    const totalQuestions = 50;

    for (let i = 0; i < totalQuestions; i++) {
        let a, b, question, answerChoices = [], correctAnswer;

        if (currentDrill === 'addition') {
            do {
                a = Math.floor(Math.random() * 20) + 1;
                b = Math.floor(Math.random() * 20) + 1;
                correctAnswer = a + b;
            } while (correctAnswer > 20);
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

        addQuestion(question, correctAnswer, answerChoices);
    }
}

function addQuestion(question, correctAnswer, answerChoices) {
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

    questions.push({
        question,
        answerChoices,
        correctAnswer,
        answered: false
    });
}

function displayQuestion(index) {
    const questionData = questions[index];
    document.getElementById('question').innerText = questionData.question;
    const buttons = document.querySelectorAll('#answer-buttons button');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].innerText = questionData.answerChoices[i];
    }
    document.getElementById('question-number').innerText = `Question: ${index + 1}/50`;
}

function submitAnswer(button) {
    const answer = parseInt(button.innerText);
    if (answer === questions[currentQuestionIndex].correctAnswer) {
        correctAnswers += 1;
    }
    questions[currentQuestionIndex].answered = true;
    updateQuestionsList();
    nextQuestion();
}

function skipQuestion() {
    nextQuestion();
}

function nextQuestion() {
    if (currentQuestionIndex < 49) {
        currentQuestionIndex += 1;
    } else {
        currentQuestionIndex = 0;
    }
    displayQuestion(currentQuestionIndex);
}

function jumpToQuestion(index) {
    currentQuestionIndex = index;
    displayQuestion(currentQuestionIndex);
}

function updateQuestionsList() {
    const list = document.getElementById('questions-list');
    list.innerHTML = '';
    questions.forEach((q, index) => {
        const questionElement = document.createElement('span');
        questionElement.innerText = index + 1;
        questionElement.className = q.answered ? 'answered' : 'unanswered';
        questionElement.onclick = () => jumpToQuestion(index);
        list.appendChild(questionElement);
    });
}

function endDrill() {
    clearInterval(timer);
    saveDrillHistory();
    document.getElementById('drill').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('score').innerText = `You answered ${correctAnswers} out of 50 questions correctly!`;
}

function saveDrillHistory() {
    console.log("Saving drill history");
    const drillRecord = {
        drillType: currentDrill,
        correctAnswers,
        totalQuestions: questions.length,
        date: new Date().toLocaleString()
    };
    drillHistory.push(drillRecord);
    localStorage.setItem('drillHistory', JSON.stringify(drillHistory));
}

function viewHistory() {
    console.log("Viewing drill history");
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    drillHistory.forEach((record, index) => {
        const listItem = document.createElement('li');
        listItem.innerText = `${record.date} - ${record.drillType}: ${record.correctAnswers}/${record.totalQuestions}`;
        historyList.appendChild(listItem);
    });
    document.getElementById('drill-selection').classList.add('hidden');
    document.getElementById('history').classList.remove('hidden');
}

function closeHistory() {
    document.getElementById('history').classList.add('hidden');
    document.getElementById('drill-selection').classList.remove('hidden');
}

function resetApp() {
    console.log("Resetting app");
    timeLeft = 300;
    currentQuestionIndex = 0;
    questions = [];
    correctAnswers = 0;
    currentDrill = '';
    document.getElementById('drill-selection').classList.remove('hidden');
    document.getElementById('drill').classList.add('hidden');
    document.getElementById('results').classList.add('hidden');
}

function logout() {
    console.log("Logging out");
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
