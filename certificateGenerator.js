import { userName, userGroup } from './navigation.js';

const { jsPDF } = window.jspdf;

export async function generateCertificate(hollandData, anchorsData) {
    try {
        if (!window.jspdf || !window.html2canvas) {
            throw new Error('Библиотеки для генерации PDF не загружены');
        }

        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const certificateData = {
            name: userName,
            group: userGroup,
            date: formattedDate,
            hollandType: hollandData?.types || 'Не определено',
            hollandDescription: hollandData?.description || 'Тест Холланда не пройден',
            hollandProfessions: hollandData?.professions || [],
            anchorsResults: anchorsData?.results || []
        };

        const certificateHtml = createCertificateHtml(certificateData);
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
                body { 
                    font-family: 'Times New Roman', serif; 
                    margin: 0; 
                    padding: 0; 
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-color: #f5f5f5;
                }
                .certificate-container {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .certificate {
                    width: 210mm; 
                    height: 297mm;
                    padding: 20mm; 
                    box-sizing: border-box;
                    position: relative;
                    background-color: white;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    text-align: center;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 15mm; 
                }
                .header img {
                    height: 50px;
                    margin-bottom: 10px;
                }
                .title { 
                    text-align: center; 
                    font-size: 16pt; 
                    font-weight: bold;
                    margin: 10mm 0;
                    text-transform: uppercase;
                }
                .section { 
                    margin-bottom: 8mm; 
                    text-align: center;
                }
                .section-title {
                    font-weight: bold;
                    font-size: 12pt;
                    margin-bottom: 3mm;
                    border-bottom: 1px solid #000;
                    display: inline-block;
                    padding-bottom: 2mm;
                }
                .two-columns {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10mm;
                    text-align: left;
                }
                .column { 
                    width: 48%; 
                }
                .professions-list { 
                    margin-left: 5mm; 
                    text-align: left;
                }
                .footer {
                    position: absolute;
                    bottom: 15mm;
                    left: 0;
                    right: 0;
                    text-align: center;
                    font-size: 10pt;
                }
                .footer img {
                    height: 40px;
                    margin-top: 5mm;
                }
                .chart-container {
                    width: 100%;
                    height: 120px;
                    margin-top: 5mm;
                }
                .center-text {
                    text-align: center;
                }
                .signature-line {
                    margin-top: 20mm;
                    border-top: 1px solid #000;
                    width: 60mm;
                    display: inline-block;
                    padding-top: 2mm;
                }
            </style>
        </head>
        <body>
            <div class="certificate-container">
                <div class="certificate">
                    <div class="header">
                        <!-- Вставьте верхний колонтитул (логотип) здесь -->
                        <img src="images/up.png" alt="Логотип">
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
                                    ${Array.isArray(data.hollandProfessions) ? data.hollandProfessions.map(p => `<p>• ${p}</p>`).join('') : ''}
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
                        <!-- Вставьте нижний колонтитул здесь -->
                        <img src="images/down.png" alt="Логотип">
                        <div>Учебный межрегиональный центр подготовки кадров</div>
                        <div>Екатеринбург, ИНН: 6670452959, ОГРН: 1176688041724</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

async function generatePdfFromHtml(html) {
    return new Promise((resolve, reject) => {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'fixed';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = '210mm';
        tempDiv.style.height = '297mm';
        tempDiv.style.padding = '20mm';
        tempDiv.style.boxSizing = 'border-box';
        tempDiv.innerHTML = html;
        document.body.appendChild(tempDiv);

        setTimeout(async () => {
            try {
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const canvas = await html2canvas(tempDiv, {
                    scale: 2,
                    logging: true,
                    useCORS: true,
                    width: 794,
                    height: 1123,
                    scrollX: 0,
                    scrollY: 0
                });

                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
                
                pdf.save(`Профориентация_${userName.replace(/\s+/g, '_')}.pdf`);
                
                document.body.removeChild(tempDiv);
                resolve();
            } catch (error) {
                console.error('Ошибка генерации PDF:', error);
                document.body.removeChild(tempDiv);
                reject(error);
            }
        }, 500);
    });
}