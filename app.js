console.log("🚀 Запуск приложения ГАБ...");

// ID твоей таблицы
const SHEET_ID = '1tLCnDY0j9GNpVde3P9XF9VVjpi2xLGXy_3ScYxEYSXk';
// Ссылка, которая забирает данные в формате CSV (работает стабильнее)
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

const listEl = document.getElementById('objectsList');

async function loadObjects() {
  try {
    console.log("Загружаю таблицу...");
    const response = await fetch(SHEET_URL);
   
    if (!response.ok) throw new Error("Не удалось скачать таблицу");
   
    const text = await response.text();
   
    // Разбиваем текст на строки
    const lines = text.trim().split('\n');
   
    // Первая строка — заголовки, пропускаем её
    const rows = lines.slice(1);
   
    const objects = rows.map(row => {
      // Разбиваем строку по запятым
      // ВАЖНО: если в ячейках есть запятые, этот простой метод может сбиться,
      // но для твоих данных (цены, названия) должно подойти.
      const cols = row.split(',');
     
      return {
        title: cols[1] || 'Без названия', // Колонка title
        price: cols[3] || '0',            // Колонка price
        rent: cols[4] || '0'              // Колонка rent
      };
    });

    console.log(`✅ Успешно загружено: ${objects.length} объектов`);
    alert(`Загружено: ${objects.length} шт.`);

    // Отрисовываем список
    listEl.innerHTML = objects.map(obj => `
      <div style="padding:15px; border:1px solid #ddd; margin:10px 0; border-radius:8px; background:white;">
        <h3 style="margin:0 0 5px 0;">${obj.title}</h3>
        <p style="margin:0; color:#555;">Цена: ${obj.price} ₽</p>
        <p style="margin:0; color:#2ecc71; font-weight:bold;">Аренда: ${obj.rent} ₽</p>
      </div>
    `).join('');

  } catch (e) {
    console.error("❌ Ошибка:", e);
    alert("Ошибка загрузки: " + e.message);
    listEl.innerHTML = `<p style="color:red; padding:20px;">Ошибка: ${e.message}</p>`;
  }
}

// Запускаем загрузку
loadObjects();
