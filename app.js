console.log("🚀 app.js ЗАПУЩЕН!");
alert("Привет! Я app.js. Начинаю грузить таблицу...");

const SHEET_ID = '1tLCnDY0j9GNpVde3P9XF9VVjpi2xLGXy_3ScYxEYSXk';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Sheet1`;

const listEl = document.getElementById('objectsList');

async function loadObjects() {
  try {
    const response = await fetch(SHEET_URL);
    const text = await response.text();
    const jsonString = text.substring(47).slice(0, -2);
    const json = JSON.parse(jsonString);
   
    const rows = json.table.rows.filter(row => row.c && row.c[0]);
   
    const objects = rows.map(row => ({
      title: row.c[1]?.v || 'Без названия',
      price: row.c[3]?.v || 0,
      rent: row.c[4]?.v || 0
    }));

    alert(`Загружено: ${objects.length} шт.`);
   
    listEl.innerHTML = objects.map(obj => `
      <div style="padding:10px; border:1px solid #ccc; margin:5px;">
        <b>${obj.title}</b><br>
        Цена: ${obj.price}, Аренда: ${obj.rent}
      </div>
    `).join('');

  } catch (e) {
    alert("Ошибка: " + e.message);
    listEl.innerHTML = "Ошибка: " + e.message;
  }
}

// Запускаем сразу
loadObjects();
