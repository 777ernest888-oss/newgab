console.log("🚀 ГАБ Калькулятор запущен!");

// 🎥 НАСТРОЙКИ ВИДЕО - вставь ссылку или оставь пустой
const WELCOME_VIDEO = ''; // Пример: 'https://raw.githubusercontent.com/.../welcome.mp4'

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
   
    // 🎥 Показываем видео ИЛИ фото
    const videoEl = document.getElementById('welcomeVideo');
    const imgEl = document.getElementById('welcomeImage');
   
    if (WELCOME_VIDEO && WELCOME_VIDEO.trim() !== '') {
      videoEl.querySelector('source').src = WELCOME_VIDEO;
      videoEl.style.display = 'block';
      imgEl.style.display = 'none';
      console.log("🎥 Показываем видео");
    } else {
      videoEl.style.display = 'none';
      imgEl.style.display = 'block';
      console.log("🖼️ Показываем фото hero.png");
    }
   
    // Скрываем загрузку (если есть)
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {      loadingScreen.classList.add('hidden');
    }
   
  } catch (e) {
    console.error("❌ Ошибка:", e);
    alert("Ошибка загрузки: " + e.message);
   
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
  }
}

function startApp() {
  console.log("startApp вызвана");
  document.getElementById('welcomeScreen').classList.add('hidden');
  document.getElementById('mainContent').classList.remove('hidden');
 
  // Показываем список
  renderList();
}

function renderList() {
  const listEl = document.getElementById('objectsList');
  if (!listEl) {
    console.error("Не найден elementsList!");
    return;
  }
 
  if (allObjects.length === 0) {
    listEl.innerHTML = '<p>Объекты не загружены</p>';
    return;
  }
 
  listEl.innerHTML = allObjects.map(obj => `
    <div class="card">
      <h3>${obj.title}</h3>
      <div class="card-price">💰 Цена: ${obj.price.toLocaleString('ru-RU')} ₽</div>
      <div class="card-rent">📈 Аренда: ${obj.rent.toLocaleString('ru-RU')} ₽/мес</div>
      <button class="card-btn" onclick="calculateYield(${obj.price}, ${obj.rent}, '${obj.title}')">
        💰 Рассчитать доходность
      </button>
    </div>
  `).join('');
 
  console.log("Список отрисован");
}

function calculateYield(price, rent, title) {  const annualIncome = rent * 12;
  const yieldPercent = ((annualIncome / price) * 100).toFixed(2);
  const paybackYears = (price / annualIncome).toFixed(1);
 
  alert(`${title}\n\n💰 Доход в год: ${annualIncome.toLocaleString('ru-RU')} ₽\n📈 Доходность: ${yieldPercent}%\n⏳ Окупаемость: ${paybackYears} лет`);
}

// Запускаем
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadObjects);
} else {
  loadObjects();
}
