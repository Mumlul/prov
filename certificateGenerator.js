import { userName, userGroup } from './navigation.js';

// Описания типов по Холланду
const HOLLAND_TYPES = {
        'Реалистический тип': {
            fullDescription: 'Реалистический тип: Предпочитает четкие, структурированные задачи, связанные с техникой, инструментами, машинами. Обладает техническими способностями, развитыми моторными навыками. Часто выбирает профессии, связанные с механикой, строительством, сельским хозяйством.'
        },
        'Исследовательский тип': {
            fullDescription: 'Исследовательский тип: Ориентирован на исследовательскую деятельность, анализ, решение сложных интеллектуальных задач. Обладает аналитическим складом ума, любознательностью. Предпочитает научные профессии, программирование, аналитику.'
        },
        'Социальный тип': {
            fullDescription: 'Социальный тип: Ориентирован на общение, помощь другим, обучение. Обладает развитыми коммуникативными навыками, эмпатией. Выбирает профессии в образовании, медицине, психологии, социальной работе.'
        },
        'Конвенциальный тип': {
            fullDescription: 'Конвенциальный тип: Организованность, аккуратность, предпочтение структурированной деятельности. Хорошие исполнительские качества. Выбирает профессии в бухгалтерии, делопроизводстве, административной работе.'
        },
        'Предприимчивый тип': {
            fullDescription: 'Предприимчивый тип: Лидерские качества, ориентация на достижения, энергичность. Предпочитает деятельность, связанную с влиянием на людей, управлением, продажами. Выбирает предпринимательские и управленческие профессии.'
        },
        'Артистический тип': {
            fullDescription: 'Артистический тип: Творческая личность с развитым воображением и интуицией. Предпочитает неструктурированные задачи, позволяющие выразить себя. Выбирает профессии в искусстве, дизайне, музыке, литературе.'
        }
};

export async function generateCertificate(hollandData, anchorsData) {
    try {
        if (!window.jspdf || !window.html2canvas) {
            throw new Error('Библиотеки для генерации PDF не загружены');
        }

        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        // Обработка данных теста Холланда
        let hollandType = 'Не определено';
        let hollandDescription = 'Тест Холланда не пройден';
        let hollandProfessions = [];

        if (hollandData) {
            hollandType = hollandData.personality || 'Не определено';
            hollandDescription = '';
            hollandProfessions = Array.isArray(hollandData.professions) ? hollandData.professions : [];
        }

        // Парсим данные обоих типов из строки "Тип + Тип"
        const types = hollandType.split('+').map(t => t.trim());
        const descriptions = types.map(type => {
            return HOLLAND_TYPES[type] ? HOLLAND_TYPES[type].description : `Описание для "${type}" не найдено`;
        });

        // Подготовка данных для PDF
        const certificateData = {
            name: userName,
            group: userGroup,
            date: formattedDate,
            hollandTypes: types.map((type, index) => ({
                type,
                description: descriptions[index]
            })),
            hollandProfessions: hollandProfessions,
            anchorsResults: anchorsData?.results || []
        };

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Первая страница — Холланд
        const hollandHtml = createHollandPageHtml(certificateData);
        await addPageToPdf(pdf, hollandHtml, true);

        // Вторая страница — Якоря
        const anchorsHtml = createAnchorsPageHtml(certificateData);
        await addPageToPdf(pdf, anchorsHtml, false);

        pdf.save(`Профориентация_${userName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
        console.error('Ошибка при создании сертификата:', error);
        alert('Не удалось сгенерировать сертификат. Пожалуйста, попробуйте позже.');
    }
}

function createHollandPageHtml(data) {
    // Обработка данных теста Холланда
    let personalityType = 'Не определено';
    let descriptions = [];
    let professions = [];
    
    if (data.hollandTypes && data.hollandTypes.length > 0) {
        personalityType = data.hollandTypes.map(t => t.type).join(' + ');
        descriptions = data.hollandTypes.map(t => t.description);
    } else if (data.personality) {
        personalityType = data.personality;
        // Для совместимости со старыми данными
        const types = data.personality.split('+').map(t => t.trim());
        descriptions = types.map(type => {
            return HOLLAND_TYPES[type] ? HOLLAND_TYPES[type].description : `Описание для "${type}" не найдено`;
        });
    }
    
    if (data.hollandProfessions && data.hollandProfessions.length > 0) {
        professions = data.hollandProfessions;
    } else if (data.professions) {
        professions = data.professions;
    }

    const descriptionBlocks = descriptions.map(desc => `
        <div class="pdf-type-desc">${desc}</div>
    `).join('');

    return `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Результаты теста Холланда</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    margin: 0;
                    padding: 15mm 20mm;
                    line-height: 1.6;
                    font-size: 11pt;
                    background-color: #ffffff;
                    color: #333333;
                    width: 210mm;
                    height: 297mm;
                    box-sizing: border-box;
                }
                .background-image {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 100%;
                    height: auto;
                    max-width: 100%;
                    max-height: 100%;
                    opacity: 0.1;
                    z-index: -1;
                }
                .pdf-header {
                    margin-bottom: 8mm;
                    text-align: center;
                }
                .pdf-main-title {
                    font-size: 16pt;
                    font-weight: bold;
                    color: #2337A5;
                    margin-bottom: 3mm;
                    text-transform: uppercase;
                }
                .pdf-subtitle {
                    font-size: 12pt;
                    color: #666666;
                }
                .pdf-user-info {
                    margin-bottom: 10mm;
                    padding: 6mm;
                }
                .pdf-info-row {
                    margin-bottom: 3mm;
                }
                .pdf-info-label {
                    font-weight: bold;
                    color: #2337A5;
                }
                .pdf-section {
                    margin-bottom: 10mm;
                }
                .pdf-section-title {
                    font-size: 14pt;
                    font-weight: bold;
                    color: #2337A5;
                    margin-bottom: 5mm;
                    border-bottom: 2px solid #eeeeee;
                    padding-bottom: 2mm;
                }
                .pdf-personality-type {
                    font-size: 14pt;
                    font-weight: bold;
                    color: #237DF5;
                    margin-bottom: 5mm;
                }
                .pdf-type-desc {
                    margin-bottom: 5mm;
                    text-align: justify;
                }
                .pdf-professions-list {
                    columns: 2;
                    column-gap: 15mm;
                    margin-top: 5mm;
                }
                .pdf-professions-list li {
                    margin-bottom: 3mm;
                    break-inside: avoid;
                    padding-left: 5mm;
                    position: relative;
                }
                .pdf-professions-list li:before {
                    content: "•";
                    position: absolute;
                    left: 0;
                    color: #2337A5;
                    font-weight: bold;
                }
                .pdf-footer {
                    text-align: center;
                    margin-top: 15mm;
                    font-size: 9pt;
                    color: #999999;
                }
            </style>
        </head>
        <body>
            <div class="pdf-header">
                <div class="pdf-main-title">РЕЗУЛЬТАТЫ ПРОФОРИЕНТАЦИИ</div>
                <div class="pdf-subtitle">Тест Холланда на определение типа личности</div>
            </div>
            <div class="pdf-user-info">
                <div class="pdf-info-row"><span class="pdf-info-label">ФИО:</span> ${data.name}</div>
                <div class="pdf-info-row"><span class="pdf-info-label">Группа/класс:</span> ${data.group}</div>
                <div class="pdf-info-row"><span class="pdf-info-label">Дата тестирования:</span> ${data.date}</div>
            </div>
            <div class="pdf-section">
                <div class="pdf-section-title">Ваш тип личности</div>
                <div class="pdf-personality-type">${personalityType}</div>
                ${descriptionBlocks}
            </div>
            ${professions.length > 0 ? `
            <div class="pdf-section">
                <div class="pdf-section-title">Рекомендуемые профессии</div>
                <ul class="pdf-professions-list">
                    ${professions.map(p => `<li>${p}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            <div class="pdf-footer">
                Страница 1 из 2 · Документ сгенерирован автоматически
            </div>
        </body>
        </html>
    `;
}

function createAnchorsPageHtml(data) {
    const topAnchors = [...data.anchorsResults]
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);

    return `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Результаты теста "Якоря карьеры"</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    margin: 0;
                    padding: 15mm 20mm;
                    line-height: 1.6;
                    font-size: 11pt;
                    background-color: #ffffff;
                    color: #333333;
                    width: 210mm;
                    height: 297mm;
                    box-sizing: border-box;
                }
                .pdf-header {
                    margin-bottom: 8mm;
                    text-align: center;
                }
                .pdf-main-title {
                    font-size: 16pt;
                    font-weight: bold;
                    color: #2337A5;
                    margin-bottom: 3mm;
                    text-transform: uppercase;
                }
                .pdf-subtitle {
                    font-size: 12pt;
                    color: #666666;
                }
                .pdf-user-info {
                    margin-bottom: 10mm;
                    padding: 6mm;
                }
                .pdf-info-row {
                    margin-bottom: 3mm;
                }
                .pdf-info-label {
                    font-weight: bold;
                    color: #2337A5;
                }
                .pdf-section {
                    margin-bottom: 10mm;
                }
                .pdf-section-title {
                    font-size: 14pt;
                    font-weight: bold;
                    color: #2337A5;
                    margin-bottom: 5mm;
                    border-bottom: 2px solid #eeeeee;
                    padding-bottom: 2mm;
                }
                .pdf-personality-type {
                    font-size: 14pt;
                    font-weight: bold;
                    color: #237DF5;
                    margin-bottom: 5mm;
                }
                .pdf-type-desc {
                    margin-bottom: 5mm;
                    text-align: justify;
                    padding: 5mm;
                }
                .pdf-professions-list {
                    columns: 2;
                    column-gap: 15mm;
                    margin-top: 5mm;
                }
                .pdf-professions-list li {
                    margin-bottom: 3mm;
                    break-inside: avoid;
                    padding-left: 5mm;
                    position: relative;
                }
                .pdf-professions-list li:before {
                    position: absolute;
                    left: 0;
                    color: #2337A5;
                    font-weight: bold;
                }
                .pdf-footer {
                    text-align: center;
                    margin-top: 15mm;
                    font-size: 9pt;
                    color: #999999;
                }
                .pdf-anchor-item {
                    margin-bottom: 8mm;
                    padding: 5mm;
                }
                .pdf-anchor-name {
                    font-size: 13pt;
                    font-weight: bold;
                    color: #2337A5;
                    margin-bottom: 3mm;
                }
                .pdf-anchor-score {
                    font-size: 13pt;
                    font-weight: bold;
                    color: #237DF5;
                    margin-bottom: 3mm;
                }
            </style>
        </head>
        <body>
            <div class="pdf-header">
                <div class="pdf-main-title">РЕЗУЛЬТАТЫ ПРОФОРИЕНТАЦИИ</div>
                <div class="pdf-subtitle">Тест "Якоря карьеры" Шейна</div>
            </div>
            ${topAnchors.length > 0 ? `
            <div class="pdf-section">
                <div class="pdf-section-title">Ваши карьерные ориентации</div>
                ${topAnchors.map(item => `
                    <div class="pdf-anchor-item">
                        <div class="pdf-anchor-name">${item.name}</div>
                        <div class="pdf-anchor-score">Оценка: ${item.score.toFixed(1)}</div>
                        <div class="pdf-type-desc">${item.description || 'Описание отсутствует'}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            <div class="pdf-footer">
                Страница 2 из 2 · Документ сгенерирован автоматически
            </div>
        </body>
        </html>
    `;
}

async function addPageToPdf(pdf, html, isFirstPage) {
    return new Promise((resolve, reject) => {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'fixed';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = '210mm';
        tempDiv.style.height = '297mm';
        tempDiv.style.padding = '30mm 20mm';
        tempDiv.style.boxSizing = 'border-box';
        tempDiv.innerHTML = html;
        document.body.appendChild(tempDiv);
        setTimeout(async () => {
            try {
                const canvas = await html2canvas(tempDiv, {
                    scale: 2,
                    logging: false,
                    useCORS: true,
                    width: 794,
                    height: 1123,
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: tempDiv.scrollWidth,
                    windowHeight: tempDiv.scrollHeight
                });
                const imgData = canvas.toDataURL('image/png');
                if (!isFirstPage) {
                    pdf.addPage();
                }
                pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
                document.body.removeChild(tempDiv);
                resolve();
            } catch (error) {
                console.error('Ошибка генерации страницы PDF:', error);
                document.body.removeChild(tempDiv);
                reject(error);
            }
        }, 300);
    });
}