// testLogic.js - Логика тестирования по методике Голланда
import { showResults, userName, userGroup } from './navigation.js';
import { startCareerAnchorsTest } from './careerAnchors.js';

// Константы API (если нужно будет вернуться обратно)
const API_BASE_URL = "https://quiz-server-zsji.onrender.com/api"; 
const QUESTIONS_ENDPOINT = "/questions";
const RESULTS_ENDPOINT = "/save";

// Элементы DOM
const questionElement = document.getElementById('questionContent');
const nextButton = document.getElementById('next-btn');
const prevButton = document.getElementById('prev-btn');
const resultPersonality = document.getElementById('result-personality');
const hollandDescription = document.getElementById('holland-description');
const hollandProfessions = document.getElementById('holland-professions');
const hollandTimeSpent = document.getElementById('holland-time-spent');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

// Переменные состояния
let questions = [];
let currentQuestionIndex = 0;
let scores = {};
let startTime;
let timerInterval;

// Инициализация теста
window.initTest = function () {
    currentQuestionIndex = 0;
    scores = { I: 0, II: 0, III: 0, IV: 0, V: 0, VI: 0 };
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    loadQuestions();
};

// Сброс теста
window.resetTest = function () {
    clearInterval(timerInterval);
    currentQuestionIndex = 0;
    scores = { I: 0, II: 0, III: 0, IV: 0, V: 0, VI: 0 };
};

// Загрузка вопросов
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

// Отображение текущего вопроса
function showQuestion() {
    resetState();
    const currentQuestion = questions[currentQuestionIndex];
    updateProgress();
    questionElement.innerHTML = `
        <div class="profession-card" data-type="${currentQuestion.A.type}">
            <h4>${currentQuestion.A.profession}</h4>
            <p class="short">${currentQuestion.A.short}</p>
        </div>
        <div class="profession-card" data-type="${currentQuestion.B.type}">
            <h4>${currentQuestion.B.profession}</h4>
            <p class="short">${currentQuestion.B.short}</p>
        </div>
    `;
    setupQuestionButtons();
    updateNavButtons();
}

function updateProgress() {
    if (questions.length > 0) {
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${currentQuestionIndex + 1}/${questions.length}`;
    }
}

// Настройка обработчиков кнопок вопроса
function setupQuestionButtons() {
    document.querySelectorAll('.profession-card').forEach(card => {
        card.addEventListener('click', () => {
            const type = card.dataset.type;
            scores[type] = (scores[type] || 0) + 1;

            // Снимаем выделение со всех карточек
            document.querySelectorAll('.profession-card').forEach(c => {
                c.classList.remove('selected');
            });

            // Выделяем текущую карточку
            card.classList.add('selected');
            nextButton.disabled = false;
        });
    });
}

// Обновление состояния кнопок навигации
function updateNavButtons() {
    prevButton.disabled = currentQuestionIndex === 0;
    nextButton.disabled = true;
}

// Переход к следующему вопросу
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        finishTest();
    }
}

// Переход к предыдущему вопросу
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

async function finishTest() {
    clearInterval(timerInterval); // Останавливаем таймер
    const timeSpent = Math.floor((Date.now() - startTime) / 1000); // Время в секундах
    const personalityType = determinePersonality(scores); // Определяем тип личности
    const personalityInfo = getPersonalityDescription(personalityType); // Получаем описание

    // Сортировка шкал по убыванию баллов
    const sortedScores = Object.entries(scores)
        .map(([type, score]) => ({
            type: getDescriptionByType(type).name,
            score
        }))
        .sort((a, b) => b.score - a.score);

    // Определяем доминирующий и дополнительный типы
    const dominantType = sortedScores[0].type;
    const secondaryType = sortedScores[1]?.type || "Нет данных";

    // Отображение основных результатов
    resultPersonality.textContent = `${dominantType} ${secondaryType ? `+ ${secondaryType}` : ''}`;
    hollandDescription.innerHTML = personalityInfo.fullDescription;
    
    // Формируем список профессий
    hollandProfessions.innerHTML = personalityInfo.recommendedProfessions
        .map(prof => `<li>${prof}</li>`)
        .join('');
    
    hollandTimeSpent.textContent = timeSpent;
    
    // Переходим ко второму тесту
    quizContainer.style.display = 'none';
    careerAnchorsQuiz.style.display = 'block';
    startCareerAnchorsTest();
}

// Вспомогательные функции
function resetState() {
    questionElement.innerHTML = '';
    nextButton.disabled = true;
}

function updateTimer() {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    hollandTimeSpent.textContent = timeSpent;
}

async function fetchQuestions() {
    const response = await fetch(`${API_BASE_URL}${QUESTIONS_ENDPOINT}`);
    if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
    return await response.json();
}

async function saveResults(data) {
    const response = await fetch(`${API_BASE_URL}${RESULTS_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
    return await response.json();
}

function determinePersonality(scores) {
    return Object.entries(scores).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
}

function getPersonalityDescription(type) {
    const descriptions = {
        I: {
            fullDescription: `
                <p><strong>Реалистический тип:</strong> Вы ориентированы на работу с вещами, техникой и конкретными объектами.</p>
                <p>Это несоциальный, эмоционально-стабильный тип. Люди этого типа хорошо приспосабливаются к обстановке, трудолюбивы, настойчивы и уверены в себе. Они предпочитают четкие задачи, требующие физической силы, ловкости или механических навыков.</p>
            `,
            recommendedProfessions: ["Инженер", "Механик", "Строитель", "Водитель", "Фермер", "Электрик", "Плотник", "Сварщик"]
        },
        II: {
            fullDescription: `
                <p><strong>Исследовательский тип:</strong> Вы любите исследовать идеи и решать сложные задачи.</p>
                <p>Это аналитический, интеллектуальный тип. Люди этого типа любят наблюдать, учиться, анализировать и решать проблемы. Они предпочитают научные и исследовательские задачи, требующие абстрактного мышления.</p>
            `,
            recommendedProfessions: ["Ученый", "Программист", "Математик", "Биолог", "Физик", "Химик", "Аналитик", "Исследователь"]
        },
        III: {
            fullDescription: `
                <p><strong>Социальный тип:</strong> Вы чувствительны к людям и предпочитаете общение и помощь другим.</p>
                <p>Это гуманный, эмпатичный тип. Люди этого типа любят работать с другими, обучать, помогать, лечить. Они обладают развитыми коммуникативными навыками и стремятся к социальному взаимодействию.</p>
            `,
            recommendedProfessions: ["Учитель", "Врач", "Психолог", "Социальный работник", "Тренер", "Медсестра", "Консультант", "Персонал сферы услуг"]
        },
        IV: {
            fullDescription: `
                <p><strong>Конвенциональный тип:</strong> Вы предпочитаете структурированную, упорядоченную работу.</p>
                <p>Это организованный, точный тип. Люди этого типа любят работать с данными, документами, цифрами. Они предпочитают четкие инструкции, структурированные задачи и систематический подход.</p>
            `,
            recommendedProfessions: ["Бухгалтер", "Банковский служащий", "Секретарь", "Архивариус", "Аналитик данных", "Кассир", "Делопроизводитель", "Финансовый контролер"]
        },
        V: {
            fullDescription: `
                <p><strong>Предприимчивый тип:</strong> Вы энергичны, предприимчивы и любите влиять на других.</p>
                <p>Это амбициозный, энергичный тип. Люди этого типа любят руководить, убеждать, достигать целей. Они обладают лидерскими качествами, уверенностью в себе и стремлением к успеху.</p>
            `,
            recommendedProfessions: ["Менеджер", "Предприниматель", "Юрист", "Политик", "Риелтор", "Маркетолог", "Продавец", "Руководитель"]
        },
        VI: {
            fullDescription: `
                <p><strong>Артистический тип:</strong> Вы креативны, чувствительны и любите творчество.</p>
                <p>Это оригинальный, экспрессивный тип. Люди этого типа любят работать в неструктурированных условиях, используя воображение и творческие способности. Они избегают рутины и ценят самовыражение.</p>
            `,
            recommendedProfessions: ["Художник", "Музыкант", "Писатель", "Актер", "Дизайнер", "Фотограф", "Архитектор", "Режиссер"]
        }
    };
    return descriptions[type] || {
        fullDescription: "<p>Не удалось определить ваш тип личности. Попробуйте пройти тест еще раз.</p>",
        recommendedProfessions: []
    };
}

function getDescriptionByType(type) {
    const descriptions = {
        I: { name: "Реалистический тип" },
        II: { name: "Исследовательский тип" },
        III: { name: "Социальный тип" },
        IV: { name: "Конвенциональный тип" },
        V: { name: "Предприимчивый тип" },
        VI: { name: "Артистический тип" }
    };
    return descriptions[type] || { name: "Неизвестный тип" };
}

// Инициализация обработчиков
nextButton.addEventListener('click', nextQuestion);
prevButton.addEventListener('click', prevQuestion);