// careerAnchors.js - Логика теста "Якоря карьеры"
import { showResults, userName, userGroup } from './navigation.js';
import { generateCertificate } from './certificateGenerator.js';

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
let answers = [];
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
    startTime = Date.now();
    loadQuestions();
}

async function loadQuestions() {
    try {
        questions = await fetchQuestions();
        answers = new Array(questions.length).fill(0); // Инициализация массива ответов
        console.log('Вопросы загружены, количество:', questions.length);
        showQuestion();
    } catch (error) {
        console.error("Ошибка при загрузке вопросов:", error);
        const quizContainer = document.getElementById('careerAnchorsQuiz');
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
    return await response.json();
}

function showQuestion() {
    if (questions.length === 0 || currentQuestion >= questions.length) return;
    
    questionElement.textContent = questions[currentQuestion];
    updateProgress();
    renderRatingScale();
    updateNavButtons();
}

function renderRatingScale() {
    ratingOptions.innerHTML = '';
    
    for (let i = 1; i <= 10; i++) {
        const option = document.createElement('div');
        option.className = `rating-option ${answers[currentQuestion] === i ? 'selected' : ''}`;
        option.textContent = i;
        option.addEventListener('click', () => {
            answers[currentQuestion] = i;
            console.log(`Вопрос ${currentQuestion+1}, ответ: ${i}`);
            renderRatingScale();
            nextButton.disabled = false;
        });
        ratingOptions.appendChild(option);
    }
}

function updateProgress() {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${currentQuestion + 1}/${questions.length}`;
}

function updateNavButtons() {
    prevButton.disabled = currentQuestion === 0;
    nextButton.disabled = answers[currentQuestion] === 0;
}

function nextCareerQuestion() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        showQuestion();
    } else {
        finishCareerTest();
    }
}

function prevCareerQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
    }
}

async function finishCareerTest() {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const results = calculateAnchorsResults();
    
    // Получаем данные из теста Голланда
    const hollandData = window.hollandResults || {
        name: userName,
        group: userGroup,
        testType: 'holland',
        personality: 'Не определено',
        time: 0,
        scores: { I: 0, II: 0, III: 0, IV: 0, V: 0, VI: 0 }
    };

    // Сохранение результатов
    try {
        const response = await fetch(`${API_BASE_URL}${RESULTS_ENDPOINT}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: userName,
                group: userGroup,
                testType: 'combined',
                time: hollandData.time + timeSpent,
                holland: {
                    personality: hollandData.personality,
                    scores: hollandData.scores
                },
                anchors: {
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
                }
            })
        });
        
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
    } catch (error) {
        console.error("Ошибка при сохранении результатов:", error);
    }
    
    // Показ результатов
    showResults();
    
    // Настройка кнопки PDF
    setupPdfButton();
}

function setupPdfButton() {
    const pdfButton = document.getElementById('download-certificate-btn');
    if (!pdfButton) return;
    
    pdfButton.style.display = 'inline-block';
    pdfButton.onclick = async (e) => {
        e.preventDefault(); // Предотвращаем стандартное поведение
        
        try {
            const hollandData = window.prepareHollandCertificateData ? window.prepareHollandCertificateData() : null;
            const anchorsData = prepareAnchorsCertificateData();
            
            await generateCertificate(
                hollandData || { 
                    types: 'Не определено', 
                    description: 'Тест Голланда не пройден', 
                    professions: [] 
                },
                anchorsData
            );
        } catch (error) {
            console.error('Ошибка генерации PDF:', error);
            alert('Ошибка при создании PDF: ' + error.message);
        }
        
        return false;
    };
}

function calculateAnchorsResults() {
    const scores = {};
    
    // Рассчитываем средние баллы по каждой ориентации
    for (const [anchor, indexes] of Object.entries(anchors)) {
        const validIndexes = indexes.filter(idx => idx <= answers.length);
        const sum = validIndexes.reduce((acc, idx) => acc + (answers[idx - 1] || 0), 0);
        scores[anchor] = sum / validIndexes.length;
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

function renderAnchorsChart(results) {
    const container = document.getElementById('anchors-chart');
    container.innerHTML = '';
    // Цвета для якорей
    const colors = [
        '#237DF5', '#4CAF50', '#FFC107',
        '#9C27B0', '#FF5722', '#607D8B',
        '#8BC34A', '#E91E63'
    ];
    // Основной контейнер
    const chartContainer = document.createElement('div');
    chartContainer.style.width = '100%';
    chartContainer.style.maxWidth = '300px'; // Уменьшили максимальную ширину
    chartContainer.style.margin = '0 auto';
    // Canvas для диаграммы (уменьшенный размер)
    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.width = 250;  // Фиксированная ширина
    canvas.height = 250; // Фиксированная высота
    chartContainer.appendChild(canvas);
    // Компактная легенда
    const compactLegend = document.createElement('div');
    compactLegend.style.marginTop = '10px';
    compactLegend.style.fontSize = '12px';
    results.slice(0, 3).forEach((result, i) => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.margin = '3px 0';
        const colorBox = document.createElement('span');
        colorBox.style.display = 'inline-block';
        colorBox.style.width = '12px';
        colorBox.style.height = '12px';
        colorBox.style.backgroundColor = colors[i];
        colorBox.style.marginRight = '5px';
        colorBox.style.borderRadius = '2px';
        const label = document.createElement('span');
        label.textContent = `${result.name.split(' ')[0]} ${result.score.toFixed(1)}`;
        item.appendChild(colorBox);
        item.appendChild(label);
        compactLegend.appendChild(item);
    });
    chartContainer.appendChild(compactLegend);
    container.appendChild(chartContainer);
    // Создаем компактную круговую диаграмму
    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: results.map(item => item.name),
            datasets: [{
                data: results.map(item => item.score),
                backgroundColor: colors,
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: false, // Отключаем авто-масштабирование
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) =>
                            `${context.label}: ${context.raw.toFixed(1)}`
                    }
                }
            },
            cutout: '65%', // Делаем тоньше
            rotation: -90, // Начинаем с верха
            circumference: 360, // Полный круг
            animation: {
                animateScale: false, // Упрощаем анимацию
                animateRotate: true
            }
        }
    });
}

// Обработчик изменения размера окна
window.addEventListener('resize', function() {
    if (window.anchorsResults) {
        renderAnchorsChart(window.anchorsResults);
    }
});

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

function getAnchorDescription(key) {
    const descriptions = {
        competence: "Быть мастером своего дела. Предполагает стремление людей к профессионализму в выбранной области, признанию успеха и достижений окружающими людьми, соответствующему статусу и т.п. В случае достижения потолка или постоянных неудачах такие люди могут разочароваться и потерять интерес к работе. Вряд ли их заинтересует даже значительно более высокая должность, если она не связана с их профессиональными компетенциями.",
        management: "Управлять — людьми, проектами, бизнес-процессами и т.п. Самое главное для вас — управление: людьми, проектами, любыми бизнес-процессами — это в целом не имеет принципиального значения. Центральное понятие их профессионального развития — власть, осознание того, что от них зависит принятие ключевых решений.",
        autonomy: "На первое место ставится возможность работы по собственным, не навязанным сверху, правилам, будь то распорядок рабочего дня, дресс-код или другие искусственные ограничения. Главное, чтобы работа была выполнена качественно и в срок. Первичная задача личности с такой ориентацией — освобождение от организационных правил, предписаний и ограничений.",
        stability: "Стабильная, надежная работа на длительное время. В жизни человека должны преобладать уверенность в завтрашнем дне, предсказуемость и привычный жизненный уклад. Обладающие высоким желанием стабильности люди крайне неохотно идут на смену места работы или переезд на другое место жительства.",
        service: "Воплощать в работе свои идеалы и ценности. Ведущая потребность - быть причастным к улучшению окружающего мира, помощи людям или животным, стремление сделать мир лучше или просто работать в тесном контакте с единомышленниками.",
        challenge: "Сделать невозможное — возможным, решать уникальные задачи. Эти люди считают успехом преодоление непреодолимых препятствий, решение неразрешимых проблем или просто выигрыш. Они ориентированы на то, чтобы 'бросать вызов'.",
        lifestyle: "Сохранение гармонии между сложившейся личной жизнью, саморазвитием и карьерой, стремление человека к установке чёткого баланса, где все стороны гармонично сочетаются и не мешают друг другу. Для людей этой категории карьера ассоциируется с общим стилем жизни.",
        entrepreneurship: "Создавать новые организации, товары, услуги. Этим людям нравится создавать новые организации, товары или услуги, которые могут быть ассоциированы с их усилиями. Цель их карьеры — создавать что-то новое, преодолевая возникающие на пути препятствия для получения финансовой независимости."
    };
    return descriptions[key] || "Нет описания";
}

function prepareAnchorsCertificateData() {
    const results = calculateAnchorsResults();
    console.log('Данные для сертификата (Якоря):', results);
    return { results };
}

export { 
    startCareerAnchorsTest,
    nextCareerQuestion, 
    prevCareerQuestion,
    prepareAnchorsCertificateData
};