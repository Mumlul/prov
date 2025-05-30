// navigation.js - Управление переходами между секциями приложения

// Элементы DOM
const mainContent = document.getElementById('mainContent');
const userInfoForm = document.getElementById('userInfoForm');
const quizContainer = document.getElementById('quizContainer');
const resultContainer = document.getElementById('resultContainer');
const startTestBtn = document.getElementById('startTestBtn');
const backBtn = document.getElementById('backBtn');
const backToFormBtn = document.getElementById('backToFormBtn');
const submitFormBtn = document.getElementById('submitFormBtn');
const restartBtn = document.getElementById('restart-btn');

// Экспортируемые переменные
export let userName = "";
export let userGroup = "";

// Инициализация
startTestBtn.addEventListener('click', () => {
    mainContent.style.display = 'none';
    userInfoForm.style.display = 'block';
});

backBtn.addEventListener('click', () => {
    userInfoForm.style.display = 'none';
    mainContent.style.display = 'block';
});

backToFormBtn.addEventListener('click', () => {
    quizContainer.style.display = 'none';
    userInfoForm.style.display = 'block';
});

submitFormBtn.addEventListener('click', () => {
    userName = document.getElementById('fullName').value.trim() || "Аноним";
    userGroup = document.getElementById('school').value.trim() || "Неизвестно";
    
    userInfoForm.style.display = 'none';
    quizContainer.style.display = 'block';
    
    if (window.initTest) {
        window.initTest();
    }
});

restartBtn.addEventListener('click', () => {
    resultContainer.style.display = 'none';
    userInfoForm.style.display = 'block';
    
    if (window.resetTest) {
        window.resetTest();
    }
});

// Показ результатов (переход от вопросов к результатам)
export function showResults() {
    quizContainer.style.display = 'none';
    resultContainer.style.display = 'block';
}