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
    window.anchorsResults = results;
    window.anchorsTimeSpent = timeSpent;
    
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
    pdfButton.onclick = async () => {
        try {
            const hollandData = window.prepareHollandCertificateData ? window.prepareHollandCertificateData() : null;
            const anchorsData = prepareAnchorsCertificateData();
            
            console.log('Данные для PDF:', { hollandData, anchorsData });
            
            if (!anchorsData?.results || anchorsData.results.length === 0) {
                throw new Error('Нет данных теста Якорей карьеры');
            }
            
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
    try {
        const container = document.getElementById('anchors-chart');
        if (!container) {
            console.error('Контейнер для диаграммы не найден');
            return;
        }

        if (!results || results.length === 0) {
            console.error('Нет данных для диаграммы');
            container.innerHTML = '<p>Нет данных для отображения</p>';
            return;
        }

        container.innerHTML = '';
        
        // Цвета для якорей
        const colors = [
            '#237DF5', '#4CAF50', '#FFC107',
            '#9C27B0', '#FF5722', '#607D8B',
            '#8BC34A', '#E91E63'
        ];

        // Основной контейнер с flex-расположением
        const mainContainer = document.createElement('div');
        mainContainer.style.display = 'flex';
        mainContainer.style.flexWrap = 'wrap';
        mainContainer.style.justifyContent = 'center';
        mainContainer.style.alignItems = 'center';
        mainContainer.style.gap = '30px';
        mainContainer.style.width = '100%';
        mainContainer.style.maxWidth = '600px';
        mainContainer.style.margin = '0 auto';

        // Контейнер для диаграммы
        const chartContainer = document.createElement('div');
        chartContainer.style.flex = '0 0 auto';

        // Canvas для диаграммы
        const canvas = document.createElement('canvas');
        canvas.style.display = 'block';
        canvas.width = 250;
        canvas.height = 250;
        canvas.style.width = '250px';
        canvas.style.height = '250px';
        chartContainer.appendChild(canvas);

        // Контейнер для легенды (сбоку)
        const legendContainer = document.createElement('div');
        legendContainer.style.flex = '1';
        legendContainer.style.minWidth = '250px';
        legendContainer.style.padding = '10px';
        
        // Заголовок легенды
        const legendTitle = document.createElement('h4');
        legendTitle.textContent = 'Карьерные ориентации';
        legendTitle.style.fontWeight = '600';
        legendTitle.style.marginBottom = '15px';
        legendTitle.style.color = '#2337A5';
        legendContainer.appendChild(legendTitle);

        // Элементы легенды
        results.forEach((result, i) => {
            const legendItem = document.createElement('div');
            legendItem.style.display = 'flex';
            legendItem.style.alignItems = 'center';
            legendItem.style.marginBottom = '12px';
            legendItem.style.padding = '8px';
            legendItem.style.borderRadius = '6px';
            legendItem.style.backgroundColor = '#f8f9fa';
            
            const colorBox = document.createElement('div');
            colorBox.style.width = '16px';
            colorBox.style.height = '16px';
            colorBox.style.backgroundColor = colors[i % colors.length];
            colorBox.style.borderRadius = '4px';
            colorBox.style.marginRight = '12px';
            colorBox.style.flexShrink = '0';
            
            const labelContainer = document.createElement('div');
            labelContainer.style.flex = '1';
            
            const nameLabel = document.createElement('div');
            nameLabel.textContent = result.name;
            nameLabel.style.fontWeight = '600';
            nameLabel.style.marginBottom = '4px';
            
            const scoreLabel = document.createElement('div');
            scoreLabel.textContent = `Оценка: ${result.score.toFixed(1)}`;
            scoreLabel.style.fontSize = '0.9em';
            scoreLabel.style.color = '#666';
            
            labelContainer.appendChild(nameLabel);
            labelContainer.appendChild(scoreLabel);
            
            legendItem.appendChild(colorBox);
            legendItem.appendChild(labelContainer);
            legendContainer.appendChild(legendItem);
        });

        // Собираем все вместе
        mainContainer.appendChild(chartContainer);
        mainContainer.appendChild(legendContainer);
        container.appendChild(mainContainer);

        // Проверка наличия Chart.js
        if (typeof Chart === 'undefined') {
            console.error('Chart.js не загружен');
            container.innerHTML = '<p>Ошибка загрузки библиотеки графиков</p>';
            return;
        }

        // Создаем диаграмму
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
                responsive: false,
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
                cutout: '65%',
                rotation: -90,
                circumference: 360,
                animation: {
                    animateScale: false,
                    animateRotate: true
                }
            }
        });

        // Адаптация для мобильных устройств
        const mediaQuery = window.matchMedia('(max-width: 600px)');
        function handleMobileChange(e) {
            if (e.matches) {
                mainContainer.style.flexDirection = 'column';
                mainContainer.style.gap = '15px';
                legendContainer.style.minWidth = '100%';
            } else {
                mainContainer.style.flexDirection = 'row';
                mainContainer.style.gap = '30px';
                legendContainer.style.minWidth = '250px';
            }
        }
        mediaQuery.addListener(handleMobileChange);
        handleMobileChange(mediaQuery);

    } catch (error) {
        console.error('Ошибка при создании диаграммы:', error);
        const container = document.getElementById('anchors-chart');
        if (container) {
            container.innerHTML = '<p>Ошибка при отображении диаграммы</p>';
        }
    }
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
    return { 
        results,
        chartData: {
            labels: results.map(r => r.name),
            scores: results.map(r => r.score),
            colors: ['#237DF5', '#4CAF50', '#FFC107', '#9C27B0', '#FF5722', '#607D8B', '#8BC34A', '#E91E63']
        }
    };
}

export { 
    startCareerAnchorsTest,
    nextCareerQuestion, 
    prevCareerQuestion,
    prepareAnchorsCertificateData
};