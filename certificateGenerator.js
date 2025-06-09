// certificateGenerator.js - Генерация сертификата в формате PDF с изображениями

import { userName, userGroup } from './navigation.js';

// Функция для генерации сертификата
export async function generateCertificate(data) {
    try {
        // Форматируем данные для вставки в шаблон
        const formattedData = {
            dominantType: data.dominantType,
            dominantDesc: data.dominantDesc,
            secondaryType: data.secondaryType,
            secondaryDesc: data.secondaryDesc,
            scores: formatScores(data.scores),
            professions: data.professions.join('\n• '),
            date: data.date,
            name: userName,
            group: userGroup
        };

        // Создаем HTML-шаблон сертификата
        const certificateHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Сертификат теста Голланда</title>
                <style>
                    body {
                        font-family: 'Times New Roman', serif;
                        margin: 0;
                        padding: 0;
                        line-height: 1.5;
                    }
                    .certificate {
                        border: 2px solid #000;
                        padding: 0;
                        width: 210mm;
                        height: 297mm;
                        position: relative;
                        box-sizing: border-box;
                    }
                    .header-image {
                        width: 100%;
                        height: auto;
                        margin-bottom: 1cm;
                    }
                    .title {
                        text-align: center;
                        font-size: 14pt;
                        font-weight: bold;
                        margin: 1cm 0;
                    }
                    .content {
                        padding: 0 2cm;
                    }
                    .section {
                        margin-bottom: 0.8cm;
                    }
                    .section-title {
                        font-weight: bold;
                        font-size: 12pt;
                        margin-bottom: 0.3cm;
                    }
                    .footer-image {
                        width: 100%;
                        height: auto;
                        position: absolute;
                        bottom: 0;
                        left: 0;
                    }
                    .footer-text {
                        position: absolute;
                        bottom: 1.5cm;
                        width: 100%;
                        text-align: center;
                        font-size: 10pt;
                    }
                    .signature {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 2cm;
                    }
                </style>
            </head>
            <body>
                <div class="certificate">
                    <!-- Верхний заголовок -->
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="font-weight: bold; font-size: 24px;">УМЦПК</div>
                        <div style="font-size: 16px;">учебный межрегиональный центр подготовки кадров</div>
                    </div>

                    <div class="content">
                        <div class="title">СЕРТИФИКАТ</div>
                        <div class="title">Тест профессиональных предпочтений Голланда</div>

                        <div class="section">
                            <div class="section-title">РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ</div>
                            <p><strong>ФИО:</strong> ${formattedData.name}</p>
                            <p><strong>Группа/класс:</strong> ${formattedData.group}</p>
                            <p><strong>Доминирующий тип:</strong> ${formattedData.dominantType}</p>
                            <p><strong>Описание:</strong> ${formattedData.dominantDesc}</p>
                            <p><strong>Дополнительный тип:</strong> ${formattedData.secondaryType}</p>
                            <p><strong>Описание:</strong> ${formattedData.secondaryDesc}</p>
                        </div>

                        <div class="section">
                            <div class="section-title">РЕЙТИНГ ПО ШКАЛАМ:</div>
                            <pre>${formattedData.scores}</pre>
                        </div>

                        <div class="section">
                            <div class="section-title">РЕКОМЕНДУЕМЫЕ ПРОФЕССИИ:</div>
                            <p>• ${formattedData.professions}</p>
                        </div>

                        <div class="section">
                            <p><strong>Дата прохождения:</strong> ${formattedData.date}</p>
                        </div>
                    </div>

                    <!-- Нижний колонтитул -->
                    <div style="position: absolute; bottom: 20px; width: 100%; text-align: center;">
                        <div>УМЦПК - Учебный межрегиональный центр подготовки кадров</div>
                        <div>Екатеринбург ИНН: 6670452959 ОГРН: 1176688041724</div>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Создаем временный элемент для рендеринга
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.innerHTML = certificateHtml;
        document.body.appendChild(tempDiv);

        // Ждём, пока DOM прогрузится
        setTimeout(async () => {
            const content = tempDiv.querySelector('.certificate');

            // Генерируем canvas из DOM
            const canvas = await html2canvas(content, {
                scale: 2,
                useCORS: true,
                scrollX: 0,
                scrollY: 0,
                logging: false
            });

            document.body.removeChild(tempDiv); // Чистим

            // Создаем PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`Сертификат_${formattedData.name.replace(/\s+/g, '_')}.pdf`);
        }, 500);

    } catch (error) {
        console.error('Ошибка при создании сертификата:', error);
        alert('Не удалось сгенерировать сертификат: ' + error.message);
    }
}

function formatScores(scores) {
    return scores.map(item => `${item.type}: ${item.score} баллов`).join('\n');
}