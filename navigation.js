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
const resultPersonality = document.getElementById('result-personality');
const hollandTimeSpent = document.getElementById('holland-time-spent');
const hollandDescription = document.getElementById('holland-description');
const hollandProfessions = document.getElementById('holland-professions');
const anchorsResult = document.getElementById('career-anchors-result');
const anchorsDescription = document.getElementById('anchors-description');
const anchorsTimeSpent = document.getElementById('anchors-time-spent');
const anchorsChart = document.getElementById('anchors-chart');

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
    // Скрываем тесты и показываем страницу результатов
    if (quizContainer) quizContainer.style.display = 'none';
    if (careerAnchorsQuiz) careerAnchorsQuiz.style.display = 'none';
    if (resultContainer) resultContainer.style.display = 'block';
    
    try {
        // 1. Получаем данные обоих тестов
        const hollandData = window.prepareHollandCertificateData?.();
        const anchorsData = window.prepareAnchorsCertificateData?.();
        
        // 2. Отображаем результаты теста Холланда
        if (window.hollandResults && resultPersonality && hollandTimeSpent && hollandDescription && hollandProfessions) {
            const { personality, time } = window.hollandResults;
            resultPersonality.textContent = personality;
            hollandTimeSpent.textContent = time;
            
            // Если есть данные для описания
            if (hollandData) {
                const description = hollandData.description || 'Описание недоступно';
                hollandDescription.innerHTML = description;
                
                if (hollandData.professions?.length > 0) {
                    hollandProfessions.innerHTML = hollandData.professions
                        .map(prof => `<li>${prof}</li>`)
                        .join('');
                }
            }
        }
        
        // 3. Отображаем результаты теста "Якоря карьеры"
        if (window.anchorsResults && anchorsResult && anchorsDescription && anchorsTimeSpent) {
            const topAnchors = window.anchorsResults.slice(0, 2);
            
            // Обновляем текстовые результаты
            anchorsResult.textContent = topAnchors.map(a => a.name).join(', ');
            
            // Добавляем описания
            anchorsDescription.innerHTML = topAnchors.map(anchor => `
                <div class="anchor-result">
                    <h4>${anchor.name} (${anchor.score.toFixed(1)})</h4>
                    <p>${anchor.description}</p>
                </div>
            `).join('');
            
            if (window.anchorsTimeSpent) {
                anchorsTimeSpent.textContent = window.anchorsTimeSpent;
            }
            
            if (anchorsChart) {
                renderAnchorsChart(window.anchorsResults);
            }
        }
        
        // 4. Настраиваем кнопку PDF (ваш существующий код с улучшениями)
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
                    
                    // Добавляем обработку ошибок для генерации
                    await generateCertificate(
                        hollandData || { 
                            types: 'Не определено', 
                            description: 'Тест Голланда не пройден', 
                            professions: [] 
                        },
                        anchorsData || { results: [] }
                    );
                } catch (error) {
                    console.error('Ошибка генерации PDF:', error);
                    alert('Не удалось сгенерировать PDF. Пожалуйста, попробуйте позже.');
                } finally {
                    pdfBtn.disabled = false;
                    pdfBtn.textContent = 'Скачать сертификат (PDF)';
                }
            };
            
            const resultFooter = document.querySelector('#resultContainer .result-content');
            if (resultFooter) {
                const restartBtn = document.getElementById('restart-btn');
                if (restartBtn) {
                    resultFooter.insertBefore(pdfBtn, restartBtn);
                } else {
                    resultFooter.appendChild(pdfBtn);
                }
            }
        }
        
    } catch (error) {
        console.error('Ошибка при отображении результатов:', error);
        
        // Показываем сообщение об ошибке пользователю
        if (resultContainer) {
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.innerHTML = `
                <p>Произошла ошибка при отображении результатов.</p>
                <button onclick="location.reload()">Попробовать снова</button>
            `;
            
            resultContainer.innerHTML = '';
            resultContainer.appendChild(errorElement);
        }
    }
}

// Добавим функцию renderAnchorsChart, если она не определена
if (!window.renderAnchorsChart) {
    window.renderAnchorsChart = function(results) {
        if (!anchorsChart) return;
        
        anchorsChart.innerHTML = '';
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
            mainContainer.style.gap = '20px';
            mainContainer.style.width = '100%';
            mainContainer.style.maxWidth = '600px';
            mainContainer.style.margin = '0 auto';

            // Контейнер для диаграммы
            const chartContainer = document.createElement('div');
            chartContainer.style.flex = '1';
            chartContainer.style.minWidth = '250px';

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
            legendContainer.style.minWidth = '200px';
            legendContainer.style.padding = '10px';
            
            // Заголовок легенды
            const legendTitle = document.createElement('div');
            legendTitle.textContent = 'Карьерные ориентации';
            legendTitle.style.fontWeight = 'bold';
            legendTitle.style.marginBottom = '10px';
            legendTitle.style.color = '#2337A5';
            legendContainer.appendChild(legendTitle);

            // Элементы легенды
            results.forEach((result, i) => {
                const legendItem = document.createElement('div');
                legendItem.style.display = 'flex';
                legendItem.style.alignItems = 'center';
                legendItem.style.margin = '8px 0';
                
                const colorBox = document.createElement('div');
                colorBox.style.width = '15px';
                colorBox.style.height = '15px';
                colorBox.style.backgroundColor = colors[i % colors.length];
                colorBox.style.borderRadius = '3px';
                colorBox.style.marginRight = '10px';
                colorBox.style.flexShrink = '0';
                
                const label = document.createElement('div');
                label.style.flex = '1';
                label.innerHTML = `
                    <div style="font-weight: 600;">${result.name}</div>
                    <div style="font-size: 0.9em; color: #555;">Оценка: ${result.score.toFixed(1)}</div>
                `;
                
                legendItem.appendChild(colorBox);
                legendItem.appendChild(label);
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

        } catch (error) {
            console.error('Ошибка при создании диаграммы:', error);
            const container = document.getElementById('anchors-chart');
            if (container) {
                container.innerHTML = '<p>Ошибка при отображении диаграммы</p>';
            }
        }
    };
}