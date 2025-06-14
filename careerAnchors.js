// careerAnchors.js - Логика теста "Якоря карьеры"
import { showResults, userName, userGroup } from './navigation.js';

let questions = [];

const API_BASE_URL = "https://quiz-server-zsji.onrender.com/api"; 
const QUESTIONS_ENDPOINT = "/questions_anchor";
const RESULTS_ENDPOINT = "/save";

const anchors = {
    competence: [1, 9, 17, 25, 33],
    management: [2, 10, 18, 26, 34],
    autonomy: [3, 11, 19, 27, 35],
    stability: [4, 12, 20, 28, 36, 41],
    service: [5, 13, 21, 29, 37],
    challenge: [6, 14, 22, 30, 38],
    lifestyle: [7, 15, 23, 31, 39],
    entrepreneurship: [8, 16, 24, 32, 40]
};

let currentQuestion = 0;
let answers = Array(questions.length).fill(0);
let startTime;

// Элементы DOM
const questionElement = document.getElementById('careerQuestionContent');
const ratingOptions = document.getElementById('ratingOptions');
const nextButton = document.getElementById('career-next-btn');
const prevButton = document.getElementById('career-prev-btn');
const progressFill = document.getElementById('careerProgressFill');
const progressText = document.getElementById('careerProgressText');
const anchorsResult = document.getElementById('career-anchors-result');
const anchorsDescription = document.getElementById('anchors-description');
const anchorsTimeSpent = document.getElementById('anchors-time-spent');
const anchorsChart = document.getElementById('anchors-chart');

// Инициализация теста
function startCareerAnchorsTest() {
    currentQuestion = 0;
    answers = Array(questions.length).fill(0);
    startTime = Date.now();
    loadQuestions();
}

async function loadQuestions() {
    try {
        questions = await fetchQuestions();
        showQuestion();
    } catch (error) {
        console.error("Ошибка при загрузке вопросов:", error);
        quizContainer.innerHTML = `
            <div class="error">
                <p>Не удалось загрузить вопросы. Пожалуйста, попробуйте позже.</p>
                <button onclick="location.reload()">Обновить страницу</button>
            </div>
        `;
    }
}



async function fetchQuestions() {
    const response = await fetch(`${API_BASE_URL}${QUESTIONS_ENDPOINT}`);
    if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
    answers = Array(questions.length).fill(0);
    return await response.json();
}

// Показать текущий вопрос
function showQuestion() {
    questionElement.textContent = questions[currentQuestion];
    updateProgress();
    renderRatingScale();
    updateNavButtons();
}

// Отрисовка шкалы оценки
function renderRatingScale() {
    ratingOptions.innerHTML = '';
    
    for (let i = 1; i <= 10; i++) {
        const option = document.createElement('div');
        option.className = `rating-option ${answers[currentQuestion] === i ? 'selected' : ''}`;
        option.textContent = i;
        option.addEventListener('click', () => {
            answers[currentQuestion] = i;
            renderRatingScale();
            nextButton.disabled = false;
        });
        ratingOptions.appendChild(option);
    }
}

// Обновление прогресса
function updateProgress() {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${currentQuestion + 1}/${questions.length}`;
}

// Обновление кнопок навигации
function updateNavButtons() {
    prevButton.disabled = currentQuestion === 0;
    nextButton.disabled = answers[currentQuestion] === 0;
}

// Переход к следующему вопросу
function nextCareerQuestion() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        showQuestion();
    } else {
        finishCareerTest();
    }
};

// Переход к предыдущему вопросу
function prevCareerQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
    }
};

// Завершение теста
async function finishCareerTest() {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const results = calculateAnchorsResults();
    
    // Добавляем дату и время
    const now = new Date();
    const testDateTime = now.toISOString();
    
    // Отображение результатов
    anchorsResult.textContent = `${results[0].name} (${results[0].score.toFixed(1)}), ${results[1].name} (${results[1].score.toFixed(1)})`;
    
    anchorsDescription.innerHTML = `
        <p><strong>${results[0].name}:</strong> ${results[0].description}</p>
        <p><strong>${results[1].name}:</strong> ${results[1].description}</p>
    `;
    
    anchorsTimeSpent.textContent = timeSpent;
    
    // Создание графика
    renderChart(results);
    
    // Сохраняем результаты
    try {
        const response = await fetch(`${API_BASE_URL}${RESULTS_ENDPOINT}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: userName,
                group: userGroup,
                testType: 'anchors',
                time: timeSpent,
                dateTime: testDateTime, // Добавляем дату и время
                results: results,
                scores: {
                    competence: results.find(r => r.name.includes("компетентность"))?.score || 0,
                    management: results.find(r => r.name.includes("Менеджмент"))?.score || 0,
                    autonomy: results.find(r => r.name.includes("Автономия"))?.score || 0,
                    stability: results.find(r => r.name.includes("Стабильность"))?.score || 0,
                    service: results.find(r => r.name.includes("Служение"))?.score || 0,
                    challenge: results.find(r => r.name.includes("Вызов"))?.score || 0,
                    lifestyle: results.find(r => r.name.includes("Интеграция"))?.score || 0,
                    entrepreneurship: results.find(r => r.name.includes("Предпринимательство"))?.score || 0
                }
            })
        });
        
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
    } catch (error) {
        console.error("Ошибка при сохранении результатов:", error);
    }
    
    showResults();

    document.getElementById('download-certificate-btn').style.display = 'inline-block';

    document.getElementById('download-certificate-btn').onclick = () => {
        generatePdfFromHtml(); // предположим, что так называется функция создания PDF
    };
}

// Расчет результатов
function calculateAnchorsResults() {
    const scores = {};
    
    // Рассчитываем средние баллы по каждой ориентации
    for (const [anchor, indexes] of Object.entries(anchors)) {
        const sum = indexes.reduce((acc, idx) => acc + answers[idx - 1], 0);
        scores[anchor] = sum / indexes.length;
    }
    
    // Преобразуем в массив и сортируем
    return Object.entries(scores)
        .map(([key, score]) => ({
            name: getAnchorName(key),
            description: getAnchorDescription(key),
            score
        }))
        .sort((a, b) => b.score - a.score);
}

// Отрисовка графика
function renderChart(results) {
    const labels = results.map(item => item.name);
    const data = results.map(item => item.score);
    
    const ctx = document.createElement('canvas');
    anchorsChart.innerHTML = '';
    anchorsChart.appendChild(ctx);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Баллы',
                data: data,
                backgroundColor: '#237DF5',
                borderColor: '#1a6bd8',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Названия якорей карьеры
function getAnchorName(key) {
    const names = {
        competence: "Профессиональная компетентность",
        management: "Менеджмент",
        autonomy: "Автономия",
        stability: "Стабильность",
        service: "Служение",
        challenge: "Вызов",
        lifestyle: "Интеграция стилей жизни",
        entrepreneurship: "Предпринимательство"
    };
    return names[key] || key;
}

// Описание якорей карьеры
function getAnchorDescription(key) {
    const descriptions = {
        competence: "Стремление быть профессионалом, мастером в своем деле. Желание развиваться в конкретной профессиональной области.",
        management: "Ориентация на управление людьми, проектами и процессами. Стремление к власти и ответственности.",
        autonomy: "Ценность свободы и независимости в работе. Желание работать по своим правилам без жесткого контроля.",
        stability: "Предпочтение стабильной, надежной работы с предсказуемыми условиями. Важность социальных гарантий.",
        service: "Стремление помогать другим, приносить пользу обществу. Работа ради реализации важных ценностей.",
        challenge: "Желание решать сложные задачи, преодолевать препятствия. Ориентация на конкуренцию и победу.",
        lifestyle: "Важность баланса между работой и личной жизнью. Стремление к гармоничному сочетанию всех сфер жизни.",
        entrepreneurship: "Желание создавать новое, работать на себя. Ориентация на создание собственного бизнеса."
    };
    return descriptions[key] || "Нет описания";
}

function prepareAnchorsCertificateData() {
    const results = calculateAnchorsResults();
    return { results };
}

export { 
    startCareerAnchorsTest,
    nextCareerQuestion, 
    prevCareerQuestion 
};