import { userName, userGroup } from './navigation.js';

// Описания типов по Холланду
const HOLLAND_TYPES = {
    'Реалистичный': {
        description: 'Предпочитает четкие, структурированные задачи, связанные с техникой, инструментами, машинами. Обладает техническими способностями, развитыми моторными навыками. Часто выбирает профессии, связанные с механикой, строительством, сельским хозяйством.'
    },
    'Исследовательский': {
        description: 'Ориентирован на исследовательскую деятельность, анализ, решение сложных интеллектуальных задач. Обладает аналитическим складом ума, любознательностью. Предпочитает научные профессии, программирование, аналитику.'
    },
    'Артистический': {
        description: 'Творческая личность с развитым воображением и интуицией. Предпочитает неструктурированные задачи, позволяющие выразить себя. Выбирает профессии в искусстве, дизайне, музыке, литературе.'
    },
    'Социальный': {
        description: 'Ориентирован на общение, помощь другим, обучение. Обладает развитыми коммуникативными навыками, эмпатией. Выбирает профессии в образовании, медицине, психологии, социальной работе.'
    },
    'Предприимчивый': {
        description: 'Лидерские качества, ориентация на достижения, энергичность. Предпочитает деятельность, связанную с влиянием на людей, управлением, продажами. Выбирает предпринимательские и управленческие профессии.'
    },
    'Конвенциальный': {
        description: 'Организованность, аккуратность, предпочтение структурированной деятельности. Хорошие исполнительские качества. Выбирает профессии в бухгалтерии, делопроизводстве, административной работе.'
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
    const typeBlocks = data.hollandTypes.map((item, idx) => `
        <div class="type-section">
            <div class="type-name">${item.type}</div>
            <div class="type-description">${item.description}</div>
        </div>
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
                    padding: 15mm 20mm; /* Увеличим отступы */
                    line-height: 1.6;
                    font-size: 11pt;
                    background-color: #ffffff;
                    color: #333333;
                    width: 210mm;
                    height: 297mm;
                    box-sizing: border-box;
                }
                .header {
                    margin-bottom: 8mm;
                    text-align: center;
                }
                .main-title {
                    font-size: 16pt;
                    font-weight: bold;
                    color: #2337A5;
                    margin-bottom: 3mm;
                    text-transform: uppercase;
                }
                .subtitle {
                    font-size: 12pt;
                    color: #666666;
                }
                .user-info {
                    margin-bottom: 10mm;
                    padding: 6mm;
                    background-color: #f8f9fa;
                    border-radius: 4px;
                }
                .info-row {
                    margin-bottom: 3mm;
                }
                .info-label {
                    font-weight: bold;
                    color: #2337A5;
                }
                .section {
                    margin-bottom: 10mm;
                }
                .section-title {
                    font-size: 14pt;
                    font-weight: bold;
                    color: #2337A5;
                    margin-bottom: 5mm;
                    border-bottom: 2px solid #eeeeee;
                    padding-bottom: 2mm;
                }
                .type-name {
                    font-size: 13pt;
                    font-weight: bold;
                    color: #2337A5;
                    margin-bottom: 5mm;
                }
                .type-description {
                    margin-left: 10mm;
                    margin-right: 10mm;
                    text-align: justify;
                    margin-bottom: 5mm;
                }
                .professions-list {
                    columns: 2;
                    column-gap: 15mm;
                    margin-top: 5mm;
                }
                .professions-list li {
                    margin-bottom: 3mm;
                    break-inside: avoid;
                    padding-left: 5mm;
                    position: relative;
                }
                .professions-list li:before {
                    content: "•";
                    position: absolute;
                    left: 0;
                    color: #2337A5;
                    font-weight: bold;
                }
                .footer {
                    text-align: center;
                    margin-top: 15mm;
                    font-size: 9pt;
                    color: #999999;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="main-title">РЕЗУЛЬТАТЫ ПРОФОРИЕНТАЦИИ</div>
                <div class="subtitle">Тест Холланда на определение типа личности</div>
            </div>
            <div class="user-info">
                <div class="info-row"><span class="info-label">ФИО:</span> ${data.name}</div>
                <div class="info-row"><span class="info-label">Группа/класс:</span> ${data.group}</div>
                <div class="info-row"><span class="info-label">Дата тестирования:</span> ${data.date}</div>
            </div>
            <div class="section">
                <div class="section-title">Ваш тип личности</div>
                ${typeBlocks}
            </div>
            ${Array.isArray(data.hollandProfessions) && data.hollandProfessions.length > 0 ? `
            <div class="section">
                <div class="section-title">Рекомендуемые профессии</div>
                <ul class="professions-list">
                    ${data.hollandProfessions.map(p => `<li>${p}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            <div class="footer">
                Страница 1 из 2 · Документ сгенерирован автоматически
            </div>
        </body>
        </html>
    `;
}

// function createAnchorsPageHtml(data) {
//     // Берём только 2 лучших результата
//     const topAnchors = [...data.anchorsResults]
//         .sort((a, b) => b.score - a.score)
//         .slice(0, 2);

//     // Создаем данные для легенды
//     const legendItems = data.anchorsResults
//         .sort((a, b) => b.score - a.score)
//         .map((item, index) => ({
//             name: item.name,
//             score: item.score.toFixed(1),
//             color: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#843b62', '#F28482'][index % 6]
//         }));

//     return `
//         <!DOCTYPE html>
//         <html lang="ru">
//         <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>Результаты теста "Якоря карьеры"</title>
//             <style>
//                 body {
//                     font-family: 'Arial', sans-serif;
//                     margin: 0;
//                     padding: 15mm 20mm;
//                     line-height: 1.6;
//                     font-size: 11pt;
//                     background-color: #ffffff;
//                     color: #333333;
//                     width: 210mm;
//                     height: 297mm;
//                     box-sizing: border-box;
//                 }
//                 .header {
//                     margin-bottom: 8mm;
//                     text-align: center;
//                 }
//                 .main-title {
//                     font-size: 16pt;
//                     font-weight: bold;
//                     color: #2337A5;
//                     margin-bottom: 3mm;
//                     text-transform: uppercase;
//                 }
//                 .subtitle {
//                     font-size: 12pt;
//                     color: #666666;
//                 }
//                 .section {
//                     margin-bottom: 10mm;
//                 }
//                 .section-title {
//                     font-size: 14pt;
//                     font-weight: bold;
//                     color: #2337A5;
//                     margin-bottom: 5mm;
//                     border-bottom: 2px solid #eeeeee;
//                     padding-bottom: 2mm;
//                 }
//                 .anchor-item {
//                     margin-bottom: 8mm;
//                     padding: 0 10mm;
//                 }
//                 .anchor-header {
//                     display: flex;
//                     justify-content: space-between;
//                     align-items: center;
//                     margin-bottom: 3mm;
//                 }
//                 .anchor-name {
//                     font-size: 13pt;
//                     font-weight: bold;
//                     color: #2337A5;
//                 }
//                 .anchor-score {
//                     font-size: 13pt;
//                     font-weight: bold;
//                     color: #ffffff;
//                     background-color: #2337A5;
//                     padding: 2mm 4mm;
//                     border-radius: 4px;
//                 }
//                 .chart-container {
//                     margin-top: 15mm;
//                     text-align: center;
//                     position: relative;
//                 }
//                 .chart-title {
//                     font-size: 13pt;
//                     font-weight: bold;
//                     color: #2337A5;
//                     margin-bottom: 5mm;
//                 }
//                 .chart-image {
//                     width: 100%;
//                     max-width: 300px;
//                     margin: 0 auto;
//                     display: block;
//                 }
//                 .legend {
//                     margin-top: 10px;
//                     text-align: center;
//                 }
//                 .legend-item {
//                     display: inline-block;
//                     margin: 5px 10px;
//                     font-size: 10pt;
//                 }
//                 .legend-color {
//                     display: inline-block;
//                     width: 12px;
//                     height: 12px;
//                     border-radius: 50%;
//                     margin-right: 5px;
//                 }
//                 .footer {
//                     text-align: center;
//                     margin-top: 15mm;
//                     font-size: 9pt;
//                     color: #999999;
//                 }
//             </style>
//         </head>
//         <body>
//             <div class="header">
//                 <div class="main-title">РЕЗУЛЬТАТЫ ПРОФОРИЕНТАЦИИ</div>
//                 <div class="subtitle">Тест "Якоря карьеры" Шейна</div>
//             </div>
//             ${topAnchors.length > 0 ? `
//             <div class="section">
//                 <div class="section-title">Ваши карьерные ориентации</div>
//                 ${topAnchors.map(item => `
//                     <div class="anchor-item">
//                         <div class="anchor-header">
//                             <div class="anchor-name">${item.name}</div>
//                             <div class="anchor-score">${item.score.toFixed(1)}</div>
//                         </div>
//                         <div class="anchor-description">${item.description || 'Описание отсутствует'}</div>
//                     </div>
//                 `).join('')}
//             </div>
//             ` : ''}
//             <div class="chart-container">
//                 <div class="chart-title">Распределение якорей карьеры</div>
//                 <div class="legend">
//                     ${legendItems.map(item => `
//                         <div class="legend-item">
//                             <span class="legend-color" style="background-color: ${item.color};"></span>
//                             ${item.name}: ${item.score}
//                         </div>
//                     `).join('')}
//                 </div>
//             </div>
//             <div class="footer">
//                 Страница 2 из 2 · Документ сгенерирован автоматически
//             </div>
//         </body>
//         </html>
//     `;
// }
function createAnchorsPageHtml(data) {
    const topAnchors = [...data.anchorsResults]
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);

    return `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <style>
                .chart-visualization {
                    margin: 20px 0;
                }
                .chart-bar {
                    display: flex;
                    align-items: center;
                    margin: 8px 0;
                }
                .chart-bar-color {
                    width: 20px;
                    height: 20px;
                    border-radius: 4px;
                    margin-right: 10px;
                }
                .chart-bar-label {
                    min-width: 200px;
                }
                .chart-bar-value {
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="chart-visualization">
                ${data.chartData.labels.map((label, index) => `
                    <div class="chart-bar">
                        <div class="chart-bar-color" style="background-color: ${data.chartData.colors[index % data.chartData.colors.length]};"></div>
                        <div class="chart-bar-label">${label}</div>
                        <div class="chart-bar-value">${data.chartData.scores[index].toFixed(1)}</div>
                    </div>
                `).join('')}
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
        tempDiv.style.padding = '0 20mm';
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