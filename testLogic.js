// testLogic.js - Логика тестирования

import { showResults, userName, userGroup } from './navigation.js';

// Константы API
const API_BASE_URL = "https://quiz-server-zsji.onrender.com/api";
const QUESTIONS_ENDPOINT = "/questions";
const RESULTS_ENDPOINT = "/save";

// Элементы DOM
const questionElement = document.getElementById('questionContent');
const nextButton = document.getElementById('next-btn');
const prevButton = document.getElementById('prev-btn');
const resultPersonality = document.getElementById('result-personality');
const resultDescription = document.getElementById('result-description');
const timeSpentElement = document.getElementById('time-spent');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

// Переменные состояния
let questions = [];
let currentQuestionIndex = 0;
let scores = {};
let startTime;
let timerInterval;

// Инициализация теста
window.initTest = function() {
    currentQuestionIndex = 0;
    scores = { I: 0, II: 0, III: 0, IV: 0, V: 0, VI: 0 };
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    
    loadQuestions();
};

// Сброс теста
window.resetTest = function() {
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
    // Обработчик для кнопки "Подробнее"
    document.querySelectorAll('.more-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.profession-card');
            const fullText = card.querySelector('.full');
            fullText.style.display = fullText.style.display === 'none' ? 'block' : 'none';
            btn.textContent = fullText.style.display === 'none' ? 'Подробнее' : 'Скрыть';
        });
    });

    // Обработчик клика по всей карточке
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

    // Обработчик для кнопки "Выбрать" (дублирует функционал клика по карточке)
    document.querySelectorAll('.select-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            btn.closest('.profession-card').click();
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

// Завершение теста
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
    resultDescription.innerHTML = `
        <p><strong>Описание:</strong> ${personalityInfo.description}</p>
        
        <details>
            <summary>Подробнее о типе</summary>
            <p>${personalityInfo.fullDescription}</p>
            <h4>Рекомендуемые профессии:</h4>
            <ul>
                ${personalityInfo.recommendedProfessions.map(prof => `<li>${prof}</li>`).join('')}
            </ul>
        </details>
    `;

    timeSpentElement.textContent = timeSpent;

    // Показываем блок с результатами
    showResults();

    // === КНОПКА СКАЧИВАНИЯ PDF ===
    const resultsContainer = document.querySelector('.results-container');

    if (!document.getElementById('download-pdf-btn')) {
        const downloadBtn = document.createElement('button');
        downloadBtn.id = 'download-pdf-btn';
        downloadBtn.textContent = 'Скачать сертификат (PDF)';
        downloadBtn.style.marginTop = '20px';
        downloadBtn.style.padding = '10px 20px';
        downloadBtn.style.fontSize = '16px';
        downloadBtn.style.backgroundColor = '#007BFF';
        downloadBtn.style.color = 'white';
        downloadBtn.style.border = 'none';
        downloadBtn.style.borderRadius = '5px';
        downloadBtn.style.cursor = 'pointer';

        downloadBtn.addEventListener('click', async () => {
            const payload = {
                name: userName || "Тестируемый",
                group: userGroup || "Не указано",
                dominantType,
                secondaryType,
                dominantDesc: getDescriptionByType(sortedScores[0].type.charAt(0)).fullDescription,
                secondaryDesc: getDescriptionByType(sortedScores[1]?.type?.charAt(0) || 'I').fullDescription,
                scores: sortedScores,
                professions: personalityInfo.recommendedProfessions,
                date: new Date().toLocaleDateString()
            };

            try {
                const response = await fetch(`${API_BASE_URL}/generate-certificate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error("Ошибка при генерации PDF");

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `certificate_${userName || 'user'}_${new Date().toISOString().slice(0, 10)}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } catch (error) {
                console.error("Ошибка при создании PDF:", error);
                alert("Не удалось создать PDF. Попробуйте позже.");
            }
        });

        resultsContainer.appendChild(downloadBtn);
    }

    // === ОТПРАВКА РЕЗУЛЬТАТОВ НА СЕРВЕР ===
    try {
        await saveResults({
            name: userName,
            personality: personalityType,
            time: timeSpent,
            group: userGroup,
            scores: scores
        });
    } catch (error) {
        console.error("Ошибка при сохранении результатов:", error);
    }
}

// Вспомогательные функции
function resetState() {
    questionElement.innerHTML = '';
    nextButton.disabled = true;
}

function updateTimer() {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    timeSpentElement.textContent = timeSpent;
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
    return Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
}

function getPersonalityDescription(type) {
    const descriptions = {
        I: {
            description: "Реалистический тип: Вы ориентированы на работу с вещами, техникой и конкретными объектами.",
            fullDescription: "Реалистический тип предпочитает работать с вещами, а не с людьми. Это несоциальный, эмоционально-стабильный тип. Люди этого типа хорошо приспосабливаются к обстановке, трудолюбивы, настойчивы и уверены в себе.",
            recommendedProfessions: ["Инженер", "Механик", "Строитель", "Водитель", "Фермер"]
        },
        II: {
            description: "Исследовательский тип: Вы любите исследовать идеи и решать сложные задачи.",
            fullDescription: "Исследовательский тип ориентирован на работу с идеями и вещами. Характеризуется любознательностью, методичностью и аналитическим мышлением.",
            recommendedProfessions: ["Ученый", "Программист", "Математик", "Биолог", "Физик"]
        },
        III: {
            description: "Социальный тип: Вы чувствительны к людям и предпочитаете общение и помощь другим.",
            fullDescription: "Социальный тип ориентирован на общение и взаимодействие с другими людьми. Люди этого типа гуманны, эмпатичны, активны и готовы прийти на помощь.",
            recommendedProfessions: ["Учитель", "Врач", "Психолог", "Социальный работник", "Тренер"]
        },
        IV: {
            description: "Конвенциональный тип: Вы предпочитаете структурированную, упорядоченную работу.",
            fullDescription: "Конвенциональный тип выбирает четко структурированную деятельность, связанную с обработкой информации. Люди этого типа аккуратны, пунктуальны, дисциплинированы и добросовестны.",
            recommendedProfessions: ["Бухгалтер", "Банковский служащий", "Секретарь", "Архивариус", "Аналитик данных"]
        },
        V: {
            description: "Предприимчивый тип: Вы энергичны, предприимчивы и любите влиять на других.",
            fullDescription: "Предприимчивый тип выбирает цели, которые позволяют проявить энергию и энтузиазм. Люди этого типа находчивы, практичны, быстро ориентируются в сложной обстановке.",
            recommendedProfessions: ["Менеджер", "Предприниматель", "Юрист", "Политик", "Риелтор"]
        },
        VI: {
            description: "Артистический тип: Вы креативны, чувствительны и любите творчество.",
            fullDescription: "Артистический тип характеризуется богатым воображением, чувствительностью и оригинальностью. Люди этого типа независимы, эмоциональны и предпочитают творческую деятельность.",
            recommendedProfessions: ["Художник", "Музыкант", "Писатель", "Актер", "Дизайнер"]
        }
    };
    return descriptions[type] || {
        description: "Не удалось определить ваш тип личности.",
        fullDescription: "Попробуйте пройти тест еще раз.",
        recommendedProfessions: []
    };
}

// Инициализация обработчиков
nextButton.addEventListener('click', nextQuestion);
prevButton.addEventListener('click', prevQuestion);

function getDescriptionByType(type) {
    const descriptions = {
        I: {
            name: "Реалистический тип",
            description: "Вы ориентированы на работу с вещами, техникой и конкретными объектами."
        },
        II: {
            name: "Исследовательский тип",
            description: "Вы любите исследовать идеи и решать сложные задачи."
        },
        III: {
            name: "Социальный тип",
            description: "Вы чувствительны к людям и предпочитаете общение и помощь другим."
        },
        IV: {
            name: "Конвенциональный тип",
            description: "Вы предпочитаете структурированную, упорядоченную работу."
        },
        V: {
            name: "Предприимчивый тип",
            description: "Вы энергичны, предприимчивы и любите влиять на других."
        },
        VI: {
            name: "Артистический тип",
            description: "Вы креативны, чувствительны и любите творчество."
        }
    };
    return descriptions[type] || { name: "Неизвестный тип", description: "" };
}