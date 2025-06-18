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
    
    console.log('Результаты теста:', results);
    console.log('Все ответы:', answers);

    // Отображение результатов
    anchorsResult.textContent = `${results[0].name} (${results[0].score.toFixed(1)}), ${results[1].name} (${results[1].score.toFixed(1)})`;
    
    anchorsDescription.innerHTML = `
        <p><strong>${results[0].name}:</strong> ${results[0].description}</p>
        <p><strong>${results[1].name}:</strong> ${results[1].description}</p>
    `;
    
    anchorsTimeSpent.textContent = timeSpent;
    
    // Создание графика
    renderAnchorsChart(results);
    
    // Сохранение результатов
    try {
        const response = await fetch(`${API_BASE_URL}${RESULTS_ENDPOINT}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: userName,
                group: userGroup,
                testType: 'anchors',
                time: timeSpent,
                dateTime: new Date().toISOString(),
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
    console.log('Данные для сертификата (Якоря):', results);
    return { results };
}

export { 
    startCareerAnchorsTest,
    nextCareerQuestion, 
    prevCareerQuestion,
    prepareAnchorsCertificateData
};