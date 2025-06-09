// careerAnchors.js - Логика теста "Якоря карьеры"
import { showResults, userName, userGroup } from './navigation.js';

const questions = [
    "Строить свою карьеру в пределах конкретной научной или технической сферы.",
    "Вести наблюдение и контроль над людьми, влиять на них на всех уровнях.",
    "Иметь возможность делать все по-своему и не быть стесненным правилами какой-либо организации.",
    "Иметь постоянное место работы с гарантированным окладом и социальной защищенностью.",
    "Употреблять свое умение общаться на пользу людям, помогать другим.",
    "Работать над проблемами, которые представляются почти неразрешимыми.",
    "Весь такой образ жизни, чтобы интересы семьи и карьеры взаимно уравновешивали друг друга.",
    "Создать и построить нечто, что будет всецело моим произведением или идеей.",
    "Продолжать работу по своей специальности, чем получить более высокую должность, не связанную с моей специальностью.",
    "Быть первым руководителем в организации.",
    "Иметь работу, не связанную с режимом или другими организационными ограничениями.",
    "Работать в организации, которая обеспечит мне стабильность на длительный период времени.",
    "Употребить свои умения и способности на то, чтобы сделать мир лучше.",
    "Соревноваться с другими и побеждать.",
    "Строить карьеру, которая позволит мне не изменять своему образу жизни.",
    "Создать новое коммерческое предприятие.",
    "Посвятить всю жизнь избранной профессии.",
    "Занять высокую руководящую должность.",
    "Иметь работу, которая представляет максимум свободы и автономии в выборе характера занятий, времени выполнения и т.д.",
    "Оставаться на одном месте жительства, чем переехать в связи с повышением.",
    "Иметь возможность использовать свои умения и таланты для служения важной цели.",
    "Единственная действительная цель моей карьеры — находить и решать трудные проблемы, независимо от того, в какой области они возникли.",
    "Я всегда стремлюсь уделять одинаковое внимание моей семье и моей карьере.",
    "Я всегда нахожусь в поиске идей, которые дадут мне возможность начать и построить свое собственное дело.",
    "Я соглашусь на руководящую должность только в том случае, если она находится в сфере моей профессиональной компетенции.",
    "Я хотел бы достичь такого положения в организации, которое давало бы возможность наблюдать за работой других и интегрировать их деятельность.",
    "В моей профессиональной деятельности я более всего заботился о своей свободе и автономии.",
    "Для меня важнее остаться на нынешнем месте жительства, чем получить повышение или новую работу в другой деятельности.",
    "Я всегда искал работу, на которой мог бы приносить пользу другим.",
    "Соревнование и выигрыш — это наиболее важные и волнующие стороны моей карьеры.",
    "Карьера имеет смысл только в том случае, если она позволяет вести жизнь, которая мне нравится.",
    "Предпринимательская деятельность составляет центральную часть моей карьеры.",
    "Я бы скорее ушел из организации, чем стал заниматься работой, не связанной с моей профессией.",
    "Я буду считать, что достиг успеха в карьере только тогда, когда стану руководителем высокого уровня в солидной организации.",
    "Я не хочу, чтобы меня стесняла какая-нибудь организация или мир бизнеса.",
    "Я бы предпочел работать в организации, которая обеспечивает длительный контракт.",
    "Я бы хотел посвятить свою карьеру достижению важной и полезной цели.",
    "Я чувствую себя преуспевающим только тогда, когда я постоянно вовлечен в решение трудных проблем или в ситуацию соревнования.",
    "Выбрать и поддерживать определенный образ жизни важнее, чем добиваться успеха в карьере.",
    "Я всегда хотел основать и построить свой собственный бизнес.",
    "Я предпочитаю работу, которая не связана с командировками."
];

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
    showQuestion();
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
window.nextCareerQuestion = function () {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        showQuestion();
    } else {
        finishCareerTest();
    }
};

// Переход к предыдущему вопросу
window.prevCareerQuestion = function () {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
    }
};

// Завершение теста
function finishCareerTest() {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const results = calculateAnchorsResults();
    
    // Отображение результатов
    anchorsResult.textContent = `${results[0].name} (${results[0].score.toFixed(1)}), ${results[1].name} (${results[1].score.toFixed(1)})`;
    
    anchorsDescription.innerHTML = `
        <p><strong>${results[0].name}:</strong> ${results[0].description}</p>
        <p><strong>${results[1].name}:</strong> ${results[1].description}</p>
    `;
    
    anchorsTimeSpent.textContent = timeSpent;
    
    // Создание графика
    renderChart(results);
    
    // Показываем результаты
    showResults();
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

export { startCareerAnchorsTest };