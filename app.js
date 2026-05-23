console.log("🚀 ГАБ Калькулятор запущен!");

// 🎥 НАСТРОЙКИ ВИДЕО - вставь ссылку или оставь пустой
const WELCOME_VIDEO = ''; // Пример: 'https://.../video.mp4'

const SHEET_ID = '1tLCnDY0j9GNpVde3P9XF9VVjpi2xLGXy_3ScYxEYSXk';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

let allObjects = [];
let currentView = 'list';

// Элементы
const loadingScreen = document.getElementById('loadingScreen');
const welcomeScreen = document.getElementById('welcomeScreen');
const mainContent = document.getElementById('mainContent');
const listingsContainer = document.getElementById('listingsContainer');
const calcContainer = document.getElementById('calcContainer');
const filtersBlock = document.getElementById('filtersBlock');
const cityFilter = document.getElementById('cityFilter');
const typeFilter = document.getElementById('typeFilter');
const yieldFilter = document.getElementById('yieldFilter');
const yieldValue = document.getElementById('yieldValue');
const backBtn = document.getElementById('backBtn');

// Загрузка данных
async function loadObjects() {
  try {
    console.log("Загрузка таблицы...");
    const response = await fetch(SHEET_URL);
    const text = await response.text();
    const lines = text.trim().split('\n');
   
    // Пропускаем заголовок
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
        description: cols[9]?.trim() || ''
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
    } else {
      videoEl.classList.add('hidden');
      imgEl.classList.remove('hidden');
    }
   
    // Скрываем загрузку, показываем приветствие
    loadingScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
   
    // Заполняем фильтры
    fillFilters();
   
  } catch (e) {
    console.error("❌ Ошибка:", e);
    alert("Ошибка загрузки: " + e.message);
    loadingScreen.classList.add('hidden');
  }
}

// Заполнение фильтров
function fillFilters() {
  const cities = [...new Set(allObjects.map(obj => obj.city).filter(Boolean))].sort();
  const types = [...new Set(allObjects.map(obj => obj.type).filter(Boolean))].sort();
 
  if (cityFilter) {
    cityFilter.innerHTML = '<option value="">Все города</option>' +
      cities.map(city => `<option value="${city}">${city}</option>`).join('');
  }
 
  if (typeFilter) {
    typeFilter.innerHTML = '<option value="">Все типы</option>' +
      types.map(type => `<option value="${type}">${type}</option>`).join('');
  }
}

// Старт приложения
function startApp() {
  welcomeScreen.classList.add('hidden');
  mainContent.classList.remove('hidden');  renderList(allObjects);
}

// Переключение фильтров
function toggleFilters() {
  filtersBlock.classList.toggle('hidden');
}

// Переключение вида
function switchView(view) {
  const listViewBtn = document.getElementById('listViewBtn');
  const calcViewBtn = document.getElementById('calcViewBtn');
 
  if (view === 'list') {
    listViewBtn.classList.add('active');
    calcViewBtn.classList.remove('active');
    listingsContainer.classList.remove('hidden');
    calcContainer.classList.add('hidden');
    backBtn.classList.add('hidden');
  } else {
    listViewBtn.classList.remove('active');
    calcViewBtn.classList.add('active');
    listingsContainer.classList.add('hidden');
    calcContainer.classList.remove('hidden');
    backBtn.classList.remove('hidden');
  }
  currentView = view;
}

// Назад
function goBack() {
  if (currentView === 'calc') {
    switchView('list');
  }
}

// Фильтрация
function filterObjects() {
  const city = cityFilter?.value || '';
  const type = typeFilter?.value || '';
  const minYield = parseFloat(yieldFilter?.value) || 0;
 
  if (yieldValue) yieldValue.textContent = `Доходность: ${minYield}%`;
 
  const filtered = allObjects.filter(obj => {
    const annualIncome = (obj.rent || 0) * 12;
    const yieldPercent = obj.price ? ((annualIncome / obj.price) * 100) : 0;
   
    const matchCity = !city || obj.city === city;
    const matchType = !type || obj.type === type;    const matchYield = yieldPercent >= minYield;
   
    return matchCity && matchType && matchYield;
  });
 
  renderList(filtered);
}

// Отрисовка списка
function renderList(objects) {
  if (!listingsContainer) return;
 
  if (objects.length === 0) {
    listingsContainer.innerHTML = '<div class="empty-state">Ничего не найдено</div>';
    return;
  }
 
  listingsContainer.innerHTML = objects.map(obj => {
    const monthlyIncome = obj.rent || 0;
    const annualIncome = monthlyIncome * 12;
    const yieldPercent = obj.price ? ((annualIncome / obj.price) * 100).toFixed(2) : 0;
    const paybackYears = annualIncome ? (obj.price / annualIncome).toFixed(1) : 0;
   
    return `
      <div class="card" onclick="openModal('${obj.id}')">
        <div class="card-meta">
          <span>📍 ${obj.city || 'Не указано'}</span>
          <span class="card-yield">📈 ${yieldPercent}%</span>
        </div>
        <h3>${obj.title}</h3>
        <div class="card-price">${obj.price.toLocaleString('ru-RU')} ₽</div>
        <div class="card-info">
          Аренда: ${monthlyIncome.toLocaleString('ru-RU')} ₽/мес<br>
          Окупаемость: ${paybackYears} лет
        </div>
        <button class="card-btn" onclick="event.stopPropagation(); calculateYield(${obj.price}, ${monthlyIncome})">
          💰 Рассчитать доходность
        </button>
      </div>
    `;
  }).join('');
}

// Калькулятор
function calculateYield(price, rent) {
  const p = price || parseFloat(document.getElementById('calcPrice').value) || 0;
  const r = rent || parseFloat(document.getElementById('calcRent').value) || 0;
 
  if (!p || !r) {
    alert('Введите цену и аренду');    return;
  }
 
  const annualIncome = r * 12;
  const yieldPercent = ((annualIncome / p) * 100).toFixed(2);
  const paybackYears = (p / annualIncome).toFixed(1);
 
  document.getElementById('resYear').textContent = annualIncome.toLocaleString('ru-RU') + ' ₽';
  document.getElementById('resYield').textContent = yieldPercent + '%';
  document.getElementById('resPayback').textContent = paybackYears + ' лет';
 
  document.getElementById('calcResult').classList.remove('hidden');
 
  // Если вызвали из списка, переключаемся на калькулятор
  if (!document.getElementById('calcContainer').classList.contains('hidden') === false) {
    switchView('calc');
  }
}

// Модалка
function openModal(id) {
  const obj = allObjects.find(o => o.id === id);
  if (!obj) return;
 
  document.getElementById('modalTitle').textContent = obj.title;
  document.getElementById('modalPrice').textContent = obj.price.toLocaleString('ru-RU') + ' ₽';
  document.getElementById('modalMeta').innerHTML = `
    <div>📍 ${obj.city}</div>
    <div>🏢 ${obj.type}</div>
    <div>📈 Доходность: ${obj.yield}%</div>
  `;
  document.getElementById('modalDescription').textContent = obj.description || 'Описание отсутствует';
 
  document.getElementById('detailsModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('detailsModal').classList.add('hidden');
}

function contactBroker() {
  alert('📞 Свяжитесь с брокером:\n+7 (XXX) XXX-XX-XX');
  closeModal();
}

// Инициализация
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadObjects);
} else {
  loadObjects();}

// Обработчики фильтров
if (cityFilter) cityFilter.addEventListener('change', filterObjects);
if (typeFilter) typeFilter.addEventListener('change', filterObjects);
if (yieldFilter) yieldFilter.addEventListener('input', filterObjects);
