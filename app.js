console.log("🚀 ГАБ Калькулятор запущен!");

// 🎥 НАСТРОЙКИ ВИДЕО - вставь ссылку или оставь пустой
const WELCOME_VIDEO = ''; // Пример: 'https://.../video.mp4'

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
   
    if (WELCOME_VIDEO) {
      videoEl.querySelector('source').src = WELCOME_VIDEO;
      videoEl.classList.remove('hidden');
      imgEl.classList.add('hidden');
      console.log("🎥 Показываем видео");
    } else {
      videoEl.classList.add('hidden');
      imgEl.classList.remove('hidden');
      console.log("🖼️ Показываем фото");
    }
   
    // СКРЫВАЕМ ЗАГРУЗКУ И ПОКАЗЫВАЕМ ПРИВЕТСТВИЕ
    const loadingScreen = document.getElementById('loadingScreen');
    const welcomeScreen = document.getElementById('welcomeScreen');
   
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      console.log("Скрыли экран загрузки");
    }
   
    if (welcomeScreen) {
      welcomeScreen.classList.remove('hidden');
      console.log("Показали приветствие");
    }
   
    // Показываем список
    const listEl = document.getElementById('objectsList');
    if (listEl && allObjects.length > 0) {
      listEl.innerHTML = allObjects.map(obj => `
        <div style="padding:10px; border:1px solid #ccc; margin:5px;">
          <b>${obj.title}</b><br>
          Цена: ${obj.price}, Аренда: ${obj.rent}
        </div>
      `).join('');
      console.log("Показали список объектов");
    }
   
  } catch (e) {
    console.error("❌ Ошибка:", e);
    alert("Ошибка загрузки: " + e.message);
    document.getElementById('loadingScreen')?.classList.add('hidden');
  }
}

function startApp() {
  console.log("startApp вызвана");
  document.getElementById('welcomeScreen')?.classList.add('hidden');
  document.getElementById('mainContent')?.classList.remove('hidden');
}

// Запускаем
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadObjects);
} else {
  loadObjects();
}
