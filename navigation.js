// navigation.js - Управление переходами между секциями приложения

// Элементы DOM
const mainContent = document.getElementById('mainContent');
const userInfoForm = document.getElementById('userInfoForm');
const quizContainer = document.getElementById('quizContainer');
const careerAnchorsQuiz = document.getElementById('careerAnchorsQuiz');
const resultContainer = document.getElementById('resultContainer');
const startTestBtn = document.getElementById('startTestBtn');
const backBtn = document.getElementById('backBtn');
const backToFormBtn = document.getElementById('backToFormBtn');
const backToFirstTestBtn = document.getElementById('backToFirstTestBtn');
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

backToFirstTestBtn.addEventListener('click', () => {
    careerAnchorsQuiz.style.display = 'none';
    quizContainer.style.display = 'block';
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
export async function showResults() {
    quizContainer.style.display = 'none';
    careerAnchorsQuiz.style.display = 'none';
    resultContainer.style.display = 'block';
    
    // Добавьте вызов генерации сертификата
    try {
        const hollandData = window.prepareHollandCertificateData?.();
        const anchorsData = window.prepareAnchorsCertificateData?.();
        
        if (hollandData && anchorsData) {
            // Добавляем кнопку для генерации PDF
            const pdfBtn = document.createElement('button');
            pdfBtn.textContent = 'Скачать сертификат (PDF)';
            pdfBtn.className = 'pdf-btn';
            pdfBtn.onclick = () => generateCertificate(hollandData, anchorsData);
            
            const resultFooter = document.querySelector('#resultContainer .footer');
            if (resultFooter) {
                resultFooter.appendChild(pdfBtn);
            }
        }
    } catch (error) {
        console.error('Ошибка при подготовке данных сертификата:', error);
    }
}