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

        // Обрабатываем типы Холланда - новая логика
        let hollandType = 'Не определено';
        let hollandDescription = 'Тест Холланда не пройден';
        let hollandProfessions = [];
        
        if (hollandData) {
            hollandType = hollandData.types || 'Не определено';
            hollandDescription = hollandData.description || 'Тест Холланда не пройден';
            hollandProfessions = Array.isArray(hollandData.professions) ? hollandData.professions : [];
        }

        const certificateData = {
            name: userName,
            group: userGroup,
            date: formattedDate,
            hollandType: hollandType,
            hollandDescription: hollandDescription,
            hollandProfessions: hollandProfessions,
            anchorsResults: anchorsData?.results || []
        };

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Генерация первой страницы (Голланд)
        const hollandHtml = createHollandPageHtml(certificateData);
        await addPageToPdf(pdf, hollandHtml, true);

        // Генерация второй страницы (Якоря карьеры)
        const anchorsHtml = createAnchorsPageHtml(certificateData);
        await addPageToPdf(pdf, anchorsHtml, false);

        pdf.save(`Профориентация_${userName.replace(/\s+/g, '_')}.pdf`);

    } catch (error) {
        console.error('Ошибка при создании сертификата:', error);
        alert('Не удалось сгенерировать сертификат. Пожалуйста, попробуйте позже.');
    }
}

function createHollandPageHtml(data) {
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
                    padding: 15mm 20mm; // Уменьшили отступы с 20mm 25mm
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
                <div class="info-row">
                    <span class="info-label">ФИО:</span> ${data.name}
                </div>
                <div class="info-row">
                    <span class="info-label">Группа/класс:</span> ${data.group}
                </div>
                <div class="info-row">
                    <span class="info-label">Дата тестирования:</span> ${data.date}
                </div>
            </div>

            <div class="section">
                <div class="section-title">Ваш тип личности</div>
                <div class="type-name">${data.hollandType || 'Не определено'}</div>
                <div class="type-description">${data.hollandDescription || ''}</div>
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

function createAnchorsPageHtml(data) {
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
                .anchor-item {
                    margin-bottom: 8mm;
                    padding: 0 10mm;
                }
                .anchor-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 3mm;
                }
                .anchor-name {
                    font-size: 13pt;
                    font-weight: bold;
                    color: #2337A5;
                }
                .anchor-score {
                    font-size: 13pt;
                    font-weight: bold;
                    color: #ffffff;
                    background-color: #2337A5;
                    padding: 2mm 4mm;
                    border-radius: 4px;
                }
                .anchor-description {
                    text-align: justify;
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
                <div class="subtitle">Тест "Якоря карьеры" Шейна</div>
            </div>

            ${Array.isArray(data.anchorsResults) && data.anchorsResults.length > 0 ? `
            <div class="section">
                <div class="section-title">Ваши карьерные ориентации</div>
                
                ${data.anchorsResults.map(item => `
                    <div class="anchor-item">
                        <div class="anchor-header">
                            <div class="anchor-name">${item.name}</div>
                            <div class="anchor-score">${item.score.toFixed(1)}</div>
                        </div>
                        <div class="anchor-description">${item.description || 'Описание отсутствует'}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            <div class="footer">
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
        tempDiv.style.padding = '0';
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