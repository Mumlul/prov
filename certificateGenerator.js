// certificateGenerator.js - Генерация сертификата с результатами обоих тестов
import { userName, userGroup } from './navigation.js';

export async function generateCertificate(hollandData, anchorsData) {
    try {
        // Форматируем дату
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        // Подготавливаем данные для сертификата
        const certificateData = {
            name: userName,
            group: userGroup,
            date: formattedDate,
            hollandType: hollandData.types,
            hollandDescription: hollandData.description,
            hollandProfessions: hollandData.professions,
            anchorsResults: anchorsData.results,
            anchorsChart: null // Для графика якорей карьеры
        };

        // Создаем HTML-структуру сертификата
        const certificateHtml = createCertificateHtml(certificateData);
        
        // Генерируем PDF
        await generatePdfFromHtml(certificateHtml);

    } catch (error) {
        console.error('Ошибка при создании сертификата:', error);
        alert('Не удалось сгенерировать сертификат. Пожалуйста, попробуйте позже.');
    }
}

function createCertificateHtml(data) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Сертификат профориентации</title>
            <style>
                body { font-family: 'Times New Roman', serif; margin: 0; padding: 0; }
                .certificate {
                    width: 210mm; height: 297mm;
                    padding: 20mm; box-sizing: border-box;
                    position: relative;
                }
                .header { text-align: center; margin-bottom: 15mm; }
                .title { 
                    text-align: center; 
                    font-size: 16pt; 
                    font-weight: bold;
                    margin: 10mm 0;
                }
                .section { margin-bottom: 8mm; }
                .section-title {
                    font-weight: bold;
                    font-size: 12pt;
                    margin-bottom: 3mm;
                    border-bottom: 1px solid #000;
                }
                .two-columns {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10mm;
                }
                .column { width: 48%; }
                .professions-list { margin-left: 5mm; }
                .footer {
                    position: absolute;
                    bottom: 15mm;
                    width: calc(100% - 40mm);
                    text-align: center;
                    font-size: 10pt;
                }
                .chart-container {
                    width: 100%;
                    height: 120px;
                    margin-top: 5mm;
                }
            </style>
        </head>
        <body>
            <div class="certificate">
                <div class="header">
                    <div style="font-size: 24pt; font-weight: bold;">УМЦПК</div>
                    <div style="font-size: 14pt;">Учебный межрегиональный центр подготовки кадров</div>
                </div>

                <div class="title">СЕРТИФИКАТ</div>
                <div class="title">результатов профориентационного тестирования</div>

                <div class="section">
                    <p><strong>ФИО:</strong> ${data.name}</p>
                    <p><strong>Группа/класс:</strong> ${data.group}</p>
                    <p><strong>Дата тестирования:</strong> ${data.date}</p>
                </div>

                <div class="two-columns">
                    <div class="column">
                        <div class="section">
                            <div class="section-title">МЕТОДИКА ГОЛЛАНДА</div>
                            <p><strong>Тип личности:</strong> ${data.hollandType}</p>
                            <p>${data.hollandDescription}</p>
                        </div>
                        
                        <div class="section">
                            <div class="section-title">РЕКОМЕНДУЕМЫЕ ПРОФЕССИИ</div>
                            <div class="professions-list">
                                ${data.hollandProfessions.map(p => `<p>• ${p}</p>`).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="column">
                        <div class="section">
                            <div class="section-title">ЯКОРЯ КАРЬЕРЫ</div>
                            ${data.anchorsResults.slice(0, 2).map(item => `
                                <p><strong>${item.name}:</strong> ${item.score.toFixed(1)}</p>
                                <p>${item.description}</p>
                            `).join('')}
                        </div>
                        
                        <div class="chart-container">
                            <!-- График будет вставлен здесь -->
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <div>Учебный межрегиональный центр подготовки кадров</div>
                    <div>Екатеринбург, ИНН: 6670452959, ОГРН: 1176688041724</div>
                </div>
            </div>
        </body>
        </html>
    `;
}

async function generatePdfFromHtml(html) {
    return new Promise((resolve, reject) => {
        // Создаем временный элемент для рендеринга
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'fixed';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '0';
        tempDiv.style.width = '210mm';
        tempDiv.innerHTML = html;
        document.body.appendChild(tempDiv);

        // Ждем загрузки всех ресурсов
        setTimeout(async () => {
            try {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                
                // Используем html2canvas для преобразования HTML в изображение
                const canvas = await html2canvas(tempDiv, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    scrollX: 0,
                    scrollY: 0,
                    width: 210 * 3.78, // Конвертируем mm в px (1mm ≈ 3.78px)
                    height: 297 * 3.78
                });

                // Добавляем изображение в PDF
                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
                
                // Сохраняем PDF
                pdf.save(`Профориентация_${userName.replace(/\s+/g, '_')}.pdf`);
                
                // Удаляем временный элемент
                document.body.removeChild(tempDiv);
                resolve();
            } catch (error) {
                document.body.removeChild(tempDiv);
                reject(error);
            }
        }, 500);
    });
}