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

// Функция проверки формы
function validateForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const school = document.getElementById('school').value.trim();
    const fullNameError = document.getElementById('fullNameError');
    const schoolError = document.getElementById('schoolError');
    let isValid = true;

    // Сброс ошибок
    fullNameError.textContent = '';
    schoolError.textContent = '';

    // Проверка ФИО
    if (!fullName) {
        fullNameError.textContent = 'Пожалуйста, введите ФИО';
        isValid = false;
    }

    // Проверка школы
    if (!school) {
        schoolError.textContent = 'Пожалуйста, укажите школу';
        isValid = false;
    } else {
        // Проверка наличия школы в списке
        const schoolsList = document.getElementById('schoolsList').options;
        let schoolExists = false;

        for (let i = 0; i < schoolsList.length; i++) {
            if (school === schoolsList[i].value) {
                schoolExists = true;
                break;
            }
        }

        if (!schoolExists) {
            schoolError.textContent = 'Выберите школу из списка';
            isValid = false;
        }
    }

    return isValid;
}

// Обработчик кнопки "Продолжить к тестированию"
submitFormBtn.addEventListener('click', () => {
    if (!validateForm()) {
        return; // Не продолжать, если форма невалидна
    }

    userName = document.getElementById('fullName').value.trim() || "Аноним";
    userGroup = document.getElementById('school').value.trim() || "Неизвестно";
    
    userInfoForm.style.display = 'none';
    quizContainer.style.display = 'block';
    
    if (window.initTest) {
        window.initTest();
    }
});

// Остальные обработчики (без изменений)
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

restartBtn.addEventListener('click', () => {
    resultContainer.style.display = 'none';
    userInfoForm.style.display = 'block';
    
    if (window.resetTest) {
        window.resetTest();
    }
});

// Показ результатов (без изменений)
export async function showResults() {
    quizContainer.style.display = 'none';
    careerAnchorsQuiz.style.display = 'none';
    resultContainer.style.display = 'block';
    
    try {
        const hollandData = window.prepareHollandCertificateData?.();
        const anchorsData = window.prepareAnchorsCertificateData?.();
        
        if (hollandData && anchorsData) {
            const oldBtn = document.querySelector('#resultContainer .pdf-btn');
            if (oldBtn) oldBtn.remove();
            
            const pdfBtn = document.createElement('button');
            pdfBtn.textContent = 'Скачать сертификат (PDF)';
            pdfBtn.className = 'pdf-btn submit-btn';
            pdfBtn.style.margin = '10px auto';
            pdfBtn.style.display = 'block';
            
            pdfBtn.onclick = async () => {
                try {
                    pdfBtn.disabled = true;
                    pdfBtn.textContent = 'Генерация PDF...';
                    await generateCertificate(hollandData, anchorsData);
                } catch (error) {
                    console.error('Ошибка:', error);
                    alert('Не удалось сгенерировать PDF. Пожалуйста, попробуйте позже.');
                } finally {
                    pdfBtn.disabled = false;
                    pdfBtn.textContent = 'Скачать сертификат (PDF)';
                }
            };
            
            const resultFooter = document.querySelector('#resultContainer .result-content');
            if (resultFooter) {
                resultFooter.insertBefore(pdfBtn, document.getElementById('restart-btn'));
            }
        }
    } catch (error) {
        console.error('Ошибка при подготовке данных сертификата:', error);
    }
}