// careerAnchors.js - Логика теста "Якоря карьеры"
import { showResults } from './navigation.js';

const questions = [
    "Строить свою карьеру в пределах конкретной научной или технической сферы.",
    "Вести наблюдение и контроль над людьми, влиять на них на всех уровнях.",
    // ... остальные 40 утверждений из методики
];

const anchors = {
    competence: [1, 9, 17, 25, 33],
    management: [2, 10, 18, 26, 34],
    autonomy: [3, 11, 19, 27, 35],
    stability: [4, 12, 20, 28, 36],
    service: [5, 13, 21, 29, 37],
    challenge: [6, 14, 22, 30, 38],
    lifestyle: [7, 15, 23, 31, 39],
    entrepreneurship: [8, 16, 24, 32, 40]
};

let currentQuestion = 0;
let answers = Array(questions.length).fill(0);
let startTime;

export function startCareerAnchorsTest() {
    currentQuestion = 0;
    answers = Array(questions.length).fill(0);
    startTime = Date.now();
    showQuestion();
}

function showQuestion() {
    document.getElementById('careerQuestionContent').textContent = questions[currentQuestion];
    updateProgress();
    renderRatingScale();
    updateNavButtons();
}

function renderRatingScale() {
    const container = document.getElementById('ratingOptions');
    container.innerHTML = '';
    
    for (let i = 1; i <= 10; i++) {
        const option = document.createElement('div');
        option.className = `rating-option ${answers[currentQuestion] === i ? 'selected' : ''}`;
        option.textContent = i;
        option.addEventListener('click', () => {
            answers[currentQuestion] = i;
            renderRatingScale();
            document.getElementById('career-next-btn').disabled = false;
        });
        container.appendChild(option);
    }
}

function updateProgress() {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById('careerProgressFill').style.width = `${progress}%`;
    document.getElementById('careerProgressText').textContent = `${currentQuestion + 1}/${questions.length}`;
}

function updateNavButtons() {
    document.getElementById('career-prev-btn').disabled = currentQuestion === 0;
    document.getElementById('career-next-btn').disabled = answers[currentQuestion] === 0;
}

export function nextCareerQuestion() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        showQuestion();
    } else {
        finishCareerTest();
    }
}

export function prevCareerQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
    }
}

function finishCareerTest() {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const results = calculateAnchorsResults();
    
    // Показываем результаты
    document.getElementById('career-anchors-result').textContent = 
        `${results[0].name} (${results[0].score.toFixed(1)}), ${results[1].name} (${results[1].score.toFixed(1)})`;
    
    document.getElementById('anchors-description').innerHTML = `
        <p><strong>${results[0].name}:</strong> ${results[0].description}</p>
        <p><strong>${results[1].name}:</strong> ${results[1].description}</p>
    `;
    
    document.getElementById('anchors-time-spent').textContent = timeSpent;
    
    // Переходим к результатам
    showResults();
}

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

function getAnchorName(key) {
    const names = {
        competence: "Профессиональная компетентность",
        management: "Менеджмент",
        autonomy: "Автономия",
        stability: "Стабильность",
        service: "Служение",
        challenge: "Вызов",
        lifestyle: "Интеграция стилей",
        entrepreneurship: "Предпринимательство"
    };
    return names[key] || key;
}

function getAnchorDescription(key) {
    const descriptions = {
        competence: "Стремление быть мастером в своей области, профессиональное развитие.",
        management: "Желание управлять людьми, процессами и брать на себя ответственность.",
        // ... остальные описания
    };
    return descriptions[key] || "Нет описания";
}