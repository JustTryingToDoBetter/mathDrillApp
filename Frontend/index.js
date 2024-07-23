let timer;
let timeLeft = 300; // 5 minutes
let currentQuestionIndex = 0;
let questions = [];
let correctAnswers = 0;
let currentDrill = '';

function startDrill(drillType) {
    currentDrill = drillType;
    document.getElementById('drill-selection').classList.add('hidden');
    document.getElementById('drill').classList.remove('hidden');
    generateQuestions();
    startTimer();
    displayQuestion(currentQuestionIndex);
    updateQuestionsList();
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

function generateQuestions() {
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

async function saveScore(drillType, score) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found. User must be logged in.');
        }

        const response = await fetch('/api/users/save-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ drillType, score })
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Error saving score: ${errorMessage}`);
        }

        const data = await response.json();
        console.log('Score saved successfully:', data.message);
        alert('Score saved successfully!');
    } catch (error) {
        console.error('Error during score saving:', error);
        alert(`Error saving score: ${error.message}`);
    }
}

async function endDrill() {
    clearInterval(timer);
    document.getElementById('drill').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('score').innerText = `You answered ${correctAnswers} out of 50 questions correctly!`;

    // Save the score
    await saveScore(currentDrill, correctAnswers);
}

function resetApp() {
    timeLeft = 300;
    currentQuestionIndex = 0;
    questions = [];
    correctAnswers = 0;
    currentDrill = '';
    const drillSelection = document.getElementById('drill-selection');
    const drill = document.getElementById('drill');
    const results = document.getElementById('results');

    if (drillSelection) {
        drillSelection.classList.remove('hidden');
    }
    if (drill) {
        drill.classList.add('hidden');
    }
    if (results) {
        results.classList.add('hidden');
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

let allHistoryData = [];

async function loadDrillHistory() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found. User must be logged in.');
        }

        const response = await fetch('/api/users/history', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Error fetching history: ${errorMessage}`);
        }

        allHistoryData = await response.json();
        renderHistoryChart(allHistoryData);
    } catch (error) {
        console.error('Error fetching history:', error);
        alert(`Error fetching history: ${error.message}`);
    }
}

function filterHistory() {
    const selectedDrillType = document.getElementById('drill-type-select').value;
    let filteredData = allHistoryData;

    if (selectedDrillType !== 'all') {
        filteredData = allHistoryData.filter(entry => entry.drill_type === selectedDrillType);
    }

    renderHistoryChart(filteredData);
}

function renderHistoryChart(historyData) {
    const ctx = document.getElementById('history-chart').getContext('2d');
    const labels = historyData.map(entry => new Date(entry.date).toLocaleDateString());
    const scores = historyData.map(entry => entry.score);

    if (window.historyChart) {
        window.historyChart.destroy();
    }

    window.historyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Score',
                data: scores,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 50
                }
            },
            responsive: true,
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    enabled: true
                }
            }
        }
    });
}

function viewHistory() {
    const drillSelection = document.getElementById('drill-selection');
    const history = document.getElementById('history');
    
    if (drillSelection) {
        drillSelection.classList.add('hidden');
    }
    if (history) {
        history.classList.remove('hidden');
    }

    loadDrillHistory();
}

function closeHistory() {
    const history = document.getElementById('history');
    const drillSelection = document.getElementById('drill-selection');
    
    if (history) {
        history.classList.add('hidden');
    }
    if (drillSelection) {
        drillSelection.classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', fetchProfile);

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
}

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html'; // Redirect to login if no token
        return;
    }

    try {
        const response = await fetch('/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            document.getElementById('greeting').innerText = `Welcome, ${user.username}!`;
        } else {
            localStorage.removeItem('token'); // Remove invalid token
            window.location.href = '/login.html'; // Redirect to login if token is invalid
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('token'); // Remove token in case of error
        window.location.href = '/login.html'; // Redirect to login
    }
});
