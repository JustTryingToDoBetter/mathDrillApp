function generateQuestions() {
    questions = [];
    const halfQuestions = 25; // Since we need 50 questions, half will be addition and half subtraction

    for (let i = 0; i < halfQuestions; i++) {
        // Generate addition question
        let a, b, question, answerChoices = [], correctAnswer;
        do {
            a = Math.floor(Math.random() * 20) + 1;
            b = Math.floor(Math.random() * 20) + 1;
            correctAnswer = a + b;
        } while (correctAnswer > 20);
        question = `${a} + ${b}`;
        addQuestion(question, correctAnswer, answerChoices);

        // Generate subtraction question
        answerChoices = [];
        do {
            a = Math.floor(Math.random() * 20) + 1;
            b = Math.floor(Math.random() * 20) + 1;
            if (a < b) [a, b] = [b, a]; // Ensure a is always greater than or equal to b
            correctAnswer = a - b;
        } while (correctAnswer < 0);
        question = `${a} - ${b}`;
        addQuestion(question, correctAnswer, answerChoices);
    }

    // Fill remaining questions based on drill type
    for (let i = 0; i < halfQuestions; i++) {
        let a, b, question, answerChoices = [], correctAnswer;
        if (currentDrill === 'multiplication') {
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
        if (currentDrill === 'addition' || currentDrill === 'subtraction') {
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
    document.getElementById('drill').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('score').innerText = `You answered ${correctAnswers} out of 50 questions correctly!`;
}

function resetApp() {
    timeLeft = 300;
    currentQuestionIndex = 0;
    questions = [];
    correctAnswers = 0;
    currentDrill = '';
    document.getElementById('drill-selection').classList.remove('hidden');
    document.getElementById('drill').classList.add('hidden');
    document.getElementById('results').classList.add('hidden');
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
