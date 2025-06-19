// testLogic.js - Логика тестирования по методике Голланда
import { showResults, userName, userGroup } from './navigation.js';
import { 
    startCareerAnchorsTest,
    nextCareerQuestion,
    prevCareerQuestion 
} from './careerAnchors.js';

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
const quizContainer = document.getElementById('quizContainer');
const careerAnchorsQuiz = document.getElementById('careerAnchorsQuiz');

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

            document.querySelectorAll('.profession-card').forEach(c => {
                c.classList.remove('selected');
            });

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
    clearInterval(timerInterval);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const personalityType = determinePersonality(scores);
    const personalityInfo = getPersonalityDescription(personalityType);

    const sortedScores = Object.entries(scores)
        .map(([type, score]) => ({
            type: getDescriptionByType(type).name,
            score,
            key: type
        }))
        .sort((a, b) => b.score - a.score);

    const dominantType = sortedScores[0];
    const secondaryType = sortedScores[1] || null;
    
    // Получаем описания для обоих типов
    const dominantInfo = getPersonalityDescription(dominantType.key);
    const secondaryInfo = secondaryType ? getPersonalityDescription(secondaryType.key) : null;

    // Формируем полное описание
    let fullDescription = `
        <h3>Основной тип: ${dominantType.type}</h3>
        ${dominantInfo.fullDescription}
    `;
    
    if (secondaryInfo) {
        fullDescription += `
            <h3>Второстепенный тип: ${secondaryType.type}</h3>
            ${secondaryInfo.fullDescription}
        `;
    }

    // Сохраняем данные для последующей отправки
    window.hollandResults = {
        name: userName,
        group: userGroup,
        testType: 'holland',
        personality: `${dominantType.type}${secondaryType ? ` + ${secondaryType.type}` : ''}`,
        time: timeSpent,
        scores: scores
    };

    resultPersonality.textContent = `${dominantType.type}${secondaryType ? ` + ${secondaryType.type}` : ''}`;
    hollandDescription.innerHTML = fullDescription;
    hollandProfessions.innerHTML = dominantInfo.recommendedProfessions
        .map(prof => `<li>${prof}</li>`)
        .join('');
    hollandTimeSpent.textContent = timeSpent;
    
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
                <p><strong>Реалистический тип:</strong> предпочитает работать с конкретными объектами и их практическим использованием: вещами, инструментами, машинами.</p>
                <p>Таким людям свойственна эмоциональная стабильность, ориентация на настоящее. Люди, относящиеся к этому типу, предпочитают выполнять работу, требующую силы, ловкости, подвижности, хорошей координации движений, навыков практической работы. Результаты труда профессионалов этого типа ощутимы и реальны — их руками создан весь окружающий нас предметный мир. Люди реалистического типа охотнее делают, чем говорят, они настойчивы и уверены в себе, в работе предпочитают четкие и конкретные указания. Придерживаются традиционных ценностей, поэтому критически относятся к новым идеям.</p>
                <p><strong>Близкие типы:</strong> интеллектуальный и конвенциальный.</p>
                <p><strong>Противоположный тип:</strong> социальный.</p>
            `,
            recommendedProfessions: ["Оператор ПК", "Техник", "Шофер", "Ювелир", "Автомеханик", "Фермер", "Инженер"]
        },
        II: {
            fullDescription: `
                <p><strong>Интеллектуальный (исследовательский) тип:</strong> ориентирован на труд с идеями и с вещами (объектами). Присуща как пластичность, так и ригидность в действиях.</p>
                <p>Характеризуется как любознательный, методичный (система в работе), любит работать в одиночку. Отличается целеустремленностью, настойчивостью, терпеливостью. Предпочитает изыскательные профессии (узнать, распознать). Людей, относящихся к этому типу, отличают аналитические способности, рационализм, независимость и оригинальность мышления, умение точно формумулировать и излагать свои мысли, решать логические задачи, генерировать новые идеи. Они часто выбирают научную и исследовательскую работу. Им нужна свобода для творчества. Работа способна увлечь их настолько, что стирается грань между рабочим временем и досугом. Мир идей для них может быть важнее, чем общение с людьми. Материальное благополучие для них обычно не на первом месте.</p>
                <p><strong>Типы профессий:</strong></p>
                <ul>
                    <li>научные: математик, физик, астроном и т.д.</li>
                    <li>предполагающие создание чего-то принципиально нового: инженер-конструктор, композитор, селекционер, программист-разработчик</li>
                    <li>предполагающие изучение, анализ: психолог-исследователь, психодиагност, лингвист, искусствовед, биолог-исследователь</li>
                </ul>
                <p><strong>Близкие типы:</strong> реалистический и артистический.</p>
                <p><strong>Противоположный тип:</strong> предприимчивый.</p>
            `,
            recommendedProfessions: ["Математик", "Физик", "Астроном", "Инженер-конструктор", "Композитор", "Селекционер", "Программист"]
        },
        III: {
            fullDescription: `
                <p><strong>Социальный тип:</strong> ориентирован на общение, взаимодействие с другими людьми. Нуждается в контактах, не терпит уединение. Предпочитает работать с людьми, а не с вещами.</p>
                <p>Ответственен, терпелив, эмпатичен. Развитые вербальные способности, повышенная приспособляемость «пластичность» к меняющейся обстановке. Люди, относящиеся к этому типу, предпочитают профессиональную деятельность, связанную с обучением, воспитанием, лечением, консультированием, обслуживанием. Люди этого типа гуманны, чувствительны, активны, ориентированы на социальные нормы, способны понять эмоциональное состояние другого человека. Для них характерно хорошее речевое развитие, живая мимика, интерес к людям, готовность прийти на помощь. Материальное благополучие для них обычно не на первом месте. Представители социального типа ставят перед собой такие цели и задачи, которые позволяют им установить тесный контакт с окружающей социальной средой. Они активны и решают проблемы, опираясь главным образом на эмоции, чувства и умение общаться.</p>
                <p><strong>Близкие типы:</strong> артистический и предприимчивый.</p>
                <p><strong>Противоположный тип:</strong> реалистический.</p>
            `,
            recommendedProfessions: ["Учитель", "Преподаватель", "Психолог", "Логопед", "Врач", "Продавец"]
        },
        IV: {
            fullDescription: `
                <p><strong>Конвенциальный (офисный) тип:</strong> отдает предпочтение четко структурированной деятельности. Выбирает такие цели и задачи, которые четко подтверждаются обществом и обычаями.</p>
                <p>Связан с традиционными видами деятельности — канцелярскими, конторскими. Подход к чему-либо — практичен, стереотипен, он не оригинален. Характерны консерватизм, ригидность, но обладает хорошими навыками общения, а также моторными навыками. Настойчив, практичен, дисциплинирован, добросовестен. Преобладают невербальные способности, прекрасный исполнитель. Люди этого типа обычно проявляют склонность к работе, связанной с обработкой и систематизацией информации, предоставленной в виде условных знаков, цифр, формул, текстов (ведение документации, установление количественных соотношений между числами и условными знаками). Они отличаются аккуратностью, пунктуальностью, практичностью, ориентированы на социальные нормы, предпочитают четко регламентированную работу. Материальное благополучие для них более значимо, чем для других типов. Склонны к работе, не связанной с широкими контактами и принятием ответственных решений.</p>
                <p><strong>Близкие типы:</strong> реалистический и предприимчивый.</p>
                <p><strong>Противоположный тип:</strong> артистический.</p>
            `,
            recommendedProfessions: ["Экономист", "Кассир в банке", "Налоговый инспектор", "Ревизор", "Бухгалтер", "Нотариус", "Библиотекарь"]
        },
        V: {
            fullDescription: `
                <p><strong>Предприимчивый тип:</strong> выбирает цели и задачи, которые позволяют ему проявить энергию, энтузиазм. Сочетаются импульсивность и холодный расчет.</p>
                <p>Наделен как вербальными, так и невербальными способностями, обладает интуицией и навыками эффективного межличностного взаимодействия. Интересуется различными сферами жизни и деятельности. Предпочитает работать с людьми и идеями. Самоуверен, тщеславен, склонен к авантюризму. Настойчив в достижении цели, лабилен. Люди этого типа находчивы, практичны, быстро ориентируются в сложной обстановке, склонны к самостоятельному принятию решений, социально активны, готовы рисковать, ищут острые ощущения. Любят и умеют общаться. Имеют высокий уровень притязаний. Избегают занятий, требующих усидчивости, большой и длительной концентрации внимания. Для них значимо материальное благополучие. Предпочитают деятельность, требующую энергии, организаторских способностей, связанную с руководством, управлением и влиянием на людей.</p>
                <p><strong>Близкие типы:</strong> конвенциальный и социальный.</p>
                <p><strong>Противоположный тип:</strong> исследовательский.</p>
            `,
            recommendedProfessions: ["Предприниматель", "Продюсер", "Менеджер", "Брокер", "Менеджер по продажам", "Фермер", "Риелтор"]
        },
        VI: {
            fullDescription: `
                <p><strong>Артистический тип:</strong> сложный взгляд на жизнь, гибкость и независимость в принятии решений. Часто свойственен фатализм.</p>
                <p>Очень чувствителен, не социален, оригинален. Имеет богатое воображение, склонности к творческой деятельности, обладает хорошей интуицией, независим, эмоционален. Предпочитает занятия творческого характера. Преобладают вербальные способности. Для этого типа характерны исключительные способности восприятия и моторики, высокая чувствительность всех анализаторов. Имеет высокий жизненный идеал, нетривиален. Люди этого типа оригинальны, независимы в принятии решений, редко ориентируются на социальные нормы и одобрение, обладают необычным взглядом на жизнь, гибкостью мышления, эмоциональной чувствительностью. Отношения с людьми строят, опираясь на свои ощущения, эмоции, воображение, интуицию. Они не выносят жесткой регламентации, предпочитая свободный график работы.</p>
                <p><strong>Близкие типы:</strong> интеллектуальный и социальный.</p>
                <p><strong>Противоположный тип:</strong> конвенциальный.</p>
            `,
            recommendedProfessions: ["Писатель", "Фотограф", "Музыкант", "Художник", "Певец", "Журналист", "Архитектор", "Актер", "Дизайнер"]
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

function prepareHollandCertificateData() {
    const personalityType = determinePersonality(scores);
    const personalityInfo = getPersonalityDescription(personalityType);
    const sortedScores = Object.entries(scores)
        .map(([type, score]) => ({
            type: getDescriptionByType(type).name,
            score,
            key: type
        }))
        .sort((a, b) => b.score - a.score);

    const dominantType = sortedScores[0];
    const secondaryType = sortedScores[1] || null;

    return {
        personality: `${dominantType.type}${secondaryType ? ` + ${secondaryType.type}` : ''}`,
        description: personalityInfo.fullDescription,
        professions: personalityInfo.recommendedProfessions,
        types: sortedScores.map(item => ({
            type: item.type,
            score: item.score,
            description: getPersonalityDescription(item.key).fullDescription
        }))
    };
}

// Экспорт функций
window.prepareHollandCertificateData = prepareHollandCertificateData;

// Инициализация обработчиков
nextButton.addEventListener('click', nextQuestion);
prevButton.addEventListener('click', prevQuestion);
window.nextCareerQuestion = nextCareerQuestion;
window.prevCareerQuestion = prevCareerQuestion;