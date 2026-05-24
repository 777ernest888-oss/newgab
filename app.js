console.log("🚀 ГАБ Калькулятор запущен!");

// 🎥 ССЫЛКА НА ВИДЕО — УЖЕ ВСТАВЛЕНА!
const WELCOME_VIDEO = 'https://raw.githubusercontent.com/777ernest888-oss/newgab/main/welcome.mp4';

const SHEET_ID = '1tLCnDY0j9GNpVde3P9XF9VVjpi2xLGXy_3ScYxEYSXk';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

let allObjects = [];

async function loadObjects() {
  try {
    console.log("Загрузка таблицы...");
    const response = await fetch(SHEET_URL);
    const text = await response.text();
    const lines = text.trim().split('\n');
    const rows = lines.slice(1);

    allObjects = rows.map(row => {
      const cols = row.split(',');
      return {
        id: cols[0]?.trim() || '',
        title: cols[1]?.trim() || 'Без названия',
        type: cols[2]?.trim() || '',
        price: parseFloat(cols[3]?.trim()) || 0,
        rent: parseFloat(cols[4]?.trim()) || 0
      };
    }).filter(obj => obj.id);

    console.log(`✅ Загружено: ${allObjects.length} объектов`);

    // 🎥 ВКЛЮЧАЕМ ВИДЕО
    const videoEl = document.getElementById('welcomeVideo');
    const imgEl = document.getElementById('welcomeImage');
   
    if (WELCOME_VIDEO && WELCOME_VIDEO.trim() !== '') {
      videoEl.src = WELCOME_VIDEO;
      videoEl.style.display = 'block';
      imgEl.style.display = 'none';
      console.log("🎥 ВИДЕО ВКЛЮЧЕНО");
    } else {
      videoEl.style.display = 'none';
      imgEl.style.display = 'block';
      console.log("🖼️ Фото включено");
    }

    // Скрываем загрузку, показываем приветствие
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('welcomeScreen').classList.remove('hidden');

    renderList();
  } catch (e) {
    console.error("❌ Ошибка:", e);
    alert("Ошибка загрузки: " + e.message);
    document.getElementById('loadingScreen').classList.add('hidden');
  }
}

function startApp() {
  console.log("Переход к списку...");
  document.getElementById('welcomeScreen').classList.add('hidden');
  document.getElementById('mainScreen').classList.remove('hidden');
  renderList();
}

function renderList() {
  const container = document.getElementById('objectsList');
  if (!container) {
    console.error("❌ Не найден objectsList!");
    return;
  }

  if (allObjects.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#666; padding:20px;">Нет объектов</p>';
    return;
  }

  container.innerHTML = allObjects.map(obj => `
    <div class="card">
      <h3>${obj.title}</h3>
      <div class="card-info">💰 Цена: ${obj.price.toLocaleString('ru-RU')} ₽<br>📈 Аренда: ${obj.rent.toLocaleString('ru-RU')} ₽/мес</div>
      <button class="card-btn" onclick="alert('💰 ${obj.title}\\n\\n📈 Доходность: ${((obj.rent*12/obj.price)*100).toFixed(2)}%\\n⏳ Окупаемость: ${(obj.price/(obj.rent*12)).toFixed(1)} лет')">💰 Рассчитать</button>
    </div>
  `).join('');
 
  console.log("✅ Список отрисован: " + allObjects.length + " карточек");
}

// Запускаем
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadObjects);
} else {
  loadObjects();
}
