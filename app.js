console.log("🚀 ГАБ Калькулятор запущен!");

// 🎥 ССЫЛКА НА ВИДЕО
const WELCOME_VIDEO = 'https://raw.githubusercontent.com/777ernest888-oss/newgab/main/welcome.mp4';

const SHEET_ID = '1tLCnDY0j9GNpVde3P9XF9VVjpi2xLGXy_3ScYxEYSXk';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

let allObjects = [];
let currentView = 'list';

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
        rent: parseFloat(cols[4]?.trim()) || 0,
        yield: parseFloat(cols[5]?.trim()) || 0,
        city: cols[6]?.trim() || '',
        location: cols[7]?.trim() || '',
        photo: cols[8]?.trim() || '',
        description: cols[9]?.trim() || 'Описание отсутствует'
      };
    }).filter(obj => obj.id);

    console.log(`✅ Загружено: ${allObjects.length} объектов`);

    // 🎥 Видео ИЛИ фото
    const videoEl = document.getElementById('welcomeVideo');
    const imgEl = document.getElementById('welcomeImage');
   
    if (WELCOME_VIDEO && WELCOME_VIDEO.trim() !== '') {
      videoEl.src = WELCOME_VIDEO;
      videoEl.style.display = 'block';
      imgEl.style.display = 'none';
    } else {
      videoEl.style.display = 'none';
      imgEl.style.display = 'block';
    }
    // Заполняем фильтры
    fillFilters();

    // Скрываем загрузку, показываем приветствие
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('welcomeScreen').classList.remove('hidden');

  } catch (e) {
    console.error("❌ Ошибка:", e);
    alert("Ошибка: " + e.message);
    document.getElementById('loadingScreen').classList.add('hidden');
  }
}

function fillFilters() {
  const cities = [...new Set(allObjects.map(obj => obj.city).filter(Boolean))].sort();
  const types = [...new Set(allObjects.map(obj => obj.type).filter(Boolean))].sort();
 
  const cityFilter = document.getElementById('cityFilter');
  const typeFilter = document.getElementById('typeFilter');
 
  if (cityFilter) {
    cityFilter.innerHTML = '<option value="">Все города</option>' +
      cities.map(city => `<option value="${city}">${city}</option>`).join('');
  }
 
  if (typeFilter) {
    typeFilter.innerHTML = '<option value="">Все типы</option>' +
      types.map(type => `<option value="${type}">${type}</option>`).join('');
  }
}

function startApp() {
  document.getElementById('welcomeScreen').classList.add('hidden');
  document.getElementById('mainScreen').classList.remove('hidden');
  renderList(allObjects);
}

function toggleFilters() {
  document.getElementById('filtersBlock').classList.toggle('hidden');
}

function switchView(view) {
  currentView = view;
  const buttons = document.querySelectorAll('.view-btn');
  const listContainer = document.getElementById('objectsList');
  const calcContainer = document.getElementById('calcContainer');
  const backBtn = document.getElementById('backBtn');
 
  buttons.forEach(btn => btn.classList.remove('active')); 
  if (view === 'list') {
    buttons[0].classList.add('active');
    listContainer.classList.remove('hidden');
    calcContainer.classList.add('hidden');
    backBtn.classList.add('hidden');
  } else {
    buttons[1].classList.add('active');
    listContainer.classList.add('hidden');
    calcContainer.classList.remove('hidden');
    backBtn.classList.remove('hidden');
  }
}

function goBack() {
  switchView('list');
}

function filterObjects() {
  const city = document.getElementById('cityFilter')?.value || '';
  const type = document.getElementById('typeFilter')?.value || '';
  const minYield = parseFloat(document.getElementById('yieldFilter')?.value) || 0;
 
  document.getElementById('yieldValue').textContent = minYield;
 
  const filtered = allObjects.filter(obj => {
    const matchCity = !city || obj.city === city;
    const matchType = !type || obj.type === type;
    const matchYield = obj.yield >= minYield;
    return matchCity && matchType && matchYield;
  });
 
  renderList(filtered);
}

function renderList(objects) {
  const container = document.getElementById('objectsList');
  if (!container) return;

  if (objects.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#999; padding:40px;">Нет объектов</p>';
    return;
  }

  container.innerHTML = objects.map(obj => {
    const yieldPercent = obj.yield || ((obj.rent * 12 / obj.price) * 100).toFixed(2);
    const payback = (obj.price / (obj.rent * 12)).toFixed(1);
   
    return `
      <div class="card" onclick="openModal('${obj.id}')">        <div class="card-meta">
          <span>📍 ${obj.city || 'Не указано'}</span>
          <span class="card-yield">📈 ${yieldPercent}%</span>
        </div>
        <h3>${obj.title}</h3>
        <div class="card-price">${obj.price.toLocaleString('ru-RU')} ₽</div>
        <div class="card-info">
          📈 Аренда: ${obj.rent.toLocaleString('ru-RU')} ₽/мес<br>
          ⏳ Окупаемость: ${payback} лет
        </div>
        <button class="card-btn" onclick="event.stopPropagation(); openModal('${obj.id}')">
          💰 Подробнее
        </button>
      </div>
    `;
  }).join('');
}

function openModal(id) {
  const obj = allObjects.find(o => o.id === id);
  if (!obj) return;

  const yieldPercent = obj.yield || ((obj.rent * 12 / obj.price) * 100).toFixed(2);
  const annualIncome = (obj.rent * 12).toLocaleString('ru-RU');
  const payback = (obj.price / (obj.rent * 12)).toFixed(1);

  document.getElementById('modalImg').src = obj.photo || 'hero.png';
  document.getElementById('modalTitle').textContent = obj.title;
  document.getElementById('modalPrice').textContent = `${obj.price.toLocaleString('ru-RU')} ₽`;
  document.getElementById('modalYield').textContent = `📈 Доходность: ${yieldPercent}% • Окупаемость: ${payback} лет`;
  document.getElementById('modalMeta').innerHTML = `
    📍 ${obj.city || 'Не указано'} • ${obj.location || ''}<br>
    🏢 Тип: ${obj.type || 'Не указан'}<br>
    💰 Доход в год: ${annualIncome} ₽
  `;
  document.getElementById('modalDesc').textContent = obj.description;

  document.getElementById('detailsModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('detailsModal').classList.add('hidden');
}

function calculateYield() {
  const price = parseFloat(document.getElementById('calcPrice')?.value) || 0;
  const rent = parseFloat(document.getElementById('calcRent')?.value) || 0;
 
  if (!price || !rent) {
    alert('Введите цену и аренду');    return;
  }

  const annualIncome = rent * 12;
  const yieldPercent = ((annualIncome / price) * 100).toFixed(2);
  const payback = (price / annualIncome).toFixed(1);

  document.getElementById('calcResult').innerHTML = `
    <div class="res-row"><span>💰 Доход в год:</span> <span>${annualIncome.toLocaleString('ru-RU')} ₽</span></div>
    <div class="res-row"><span>📈 Доходность:</span> <span>${yieldPercent}%</span></div>
    <div class="res-row"><span>⏳ Окупаемость:</span> <span>${payback} лет</span></div>
  `;
  document.getElementById('calcResult').classList.remove('hidden');
}

function contactBroker() {
  alert('📞 Свяжитесь с брокером:\n\n📱 +7 (XXX) XXX-XX-XX\n✈️ @username');
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  alert('🔗 Ссылка скопирована!');
}

// Обработчики фильтров
if (document.getElementById('cityFilter')) {
  document.getElementById('cityFilter').addEventListener('change', filterObjects);
}
if (document.getElementById('typeFilter')) {
  document.getElementById('typeFilter').addEventListener('change', filterObjects);
}
if (document.getElementById('yieldFilter')) {
  document.getElementById('yieldFilter').addEventListener('input', filterObjects);
}

// Запускаем
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadObjects);
} else {
  loadObjects();
}
