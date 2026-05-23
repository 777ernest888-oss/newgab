console.log("🚀 app.js ЗАПУЩЕН!");

const SHEET_ID = '1tLCnDY0j9GNpVde3P9XF9VVjpi2xLGXy_3ScYxEYSXk';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

// Элементы DOM
const loadingScreen = document.getElementById('loadingScreen');
const listEl = document.getElementById('objectsList');
const cityFilter = document.getElementById('cityFilter');
const typeFilter = document.getElementById('typeFilter');
const yieldFilter = document.getElementById('yieldFilter');
const yieldValue = document.getElementById('yieldValue');
const calcViewBtn = document.getElementById('calcViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const calcContainer = document.getElementById('calcContainer');
const listingsContainer = document.getElementById('listingsContainer');

let allObjects = [];

// Загрузка данных
async function loadObjects() {
  try {
    console.log("Загружаю таблицу...");
    const response = await fetch(SHEET_URL);
   
    if (!response.ok) throw new Error("Не удалось скачать таблицу");
   
    const text = await response.text();
    const lines = text.trim().split('\n');
   
    // Пропускаем заголовок (первая строка)
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
    }).filter(obj => obj.id); // Убираем пустые строки

    console.log(`✅ Загружено: ${allObjects.length} объектов`);   
    // Скрываем экран загрузки
    if (loadingScreen) loadingScreen.classList.add('hidden');
   
    // Показываем главный экран
    const welcomeScreen = document.getElementById('welcomeScreen');
    const mainContent = document.getElementById('mainContent');
    if (welcomeScreen) welcomeScreen.classList.add('hidden');
    if (mainContent) mainContent.classList.remove('hidden');
   
    // Заполняем фильтры
    fillFilters();
   
    // Отображаем список
    renderList(allObjects);
   
  } catch (e) {
    console.error("❌ Ошибка:", e);
    alert("Ошибка загрузки: " + e.message);
    if (loadingScreen) loadingScreen.classList.add('hidden');
  }
}

// Заполнение фильтров
function fillFilters() {
  const cities = [...new Set(allObjects.map(obj => obj.city).filter(Boolean))];
  const types = [...new Set(allObjects.map(obj => obj.type).filter(Boolean))];
 
  if (cityFilter) {
    cityFilter.innerHTML = '<option value="">Все города</option>' +
      cities.map(city => `<option value="${city}">${city}</option>`).join('');
  }
 
  if (typeFilter) {
    typeFilter.innerHTML = '<option value="">Все типы</option>' +
      types.map(type => `<option value="${type}">${type}</option>`).join('');
  }
}

// Отображение списка
function renderList(objects) {
  if (!listEl) return;
 
  if (objects.length === 0) {
    listEl.innerHTML = '<div style="padding:20px; text-align:center; color:#999;">Ничего не найдено</div>';
    return;
  }
 
  listEl.innerHTML = objects.map(obj => {
    const monthlyIncome = obj.rent || 0;    const annualIncome = monthlyIncome * 12;
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
        <div style="color:#666; font-size:14px; margin-bottom:8px;">
          Аренда: ${monthlyIncome.toLocaleString('ru-RU')} ₽/мес • Окупаемость: ${paybackYears} лет
        </div>
        <button class="card-btn" onclick="event.stopPropagation(); calculateYield(${obj.price}, ${monthlyIncome})">
          💰 Рассчитать доходность
        </button>
      </div>
    `;
  }).join('');
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
    const matchType = !type || obj.type === type;
    const matchYield = yieldPercent >= minYield;
   
    return matchCity && matchType && matchYield;
  });
 
  renderList(filtered);
}

// Калькулятор
function calculateYield(price, rent) {
  if (!price || !rent) return;
 
  const monthlyIncome = rent;  const annualIncome = rent * 12;
  const yieldPercent = ((annualIncome / price) * 100).toFixed(2);
  const paybackYears = (price / annualIncome).toFixed(1);
 
  const resultDiv = document.getElementById('calcResult');
  const resMonth = document.getElementById('resMonth');
  const resYield = document.getElementById('resYield');
  const resPayback = document.getElementById('resPayback');
 
  if (resMonth) resMonth.textContent = `${annualIncome.toLocaleString('ru-RU')} ₽`;
  if (resYield) resYield.textContent = `${yieldPercent}%`;
  if (resPayback) resPayback.textContent = `${paybackYears} лет`;
 
  if (resultDiv) resultDiv.classList.remove('hidden');
 
  // Переключаемся на вкладку калькулятора
  if (calcViewBtn) calcViewBtn.click();
}

// Переключение вкладок
function switchView(view) {
  if (view === 'list') {
    if (listingsContainer) listingsContainer.classList.remove('hidden');
    if (calcContainer) calcContainer.classList.add('hidden');
    if (listViewBtn) listViewBtn.classList.add('active');
    if (calcViewBtn) calcViewBtn.classList.remove('active');
  } else {
    if (listingsContainer) listingsContainer.classList.add('hidden');
    if (calcContainer) calcContainer.classList.remove('hidden');
    if (listViewBtn) listViewBtn.classList.remove('active');
    if (calcViewBtn) calcViewBtn.classList.add('active');
  }
}

// Открытие модалки
function openModal(id) {
  const obj = allObjects.find(o => o.id === id);
  if (!obj) return;
 
  // Здесь можно добавить открытие детальной информации
  alert(`${obj.title}\n\nЦена: ${obj.price.toLocaleString('ru-RU')} ₽\nАренда: ${obj.rent.toLocaleString('ru-RU')} ₽/мес\nГород: ${obj.city}\n\n${obj.description}`);
}

// Инициализация
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadObjects();
   
    // Навешиваем обработчики
    if (cityFilter) cityFilter.addEventListener('change', filterObjects);    if (typeFilter) typeFilter.addEventListener('change', filterObjects);
    if (yieldFilter) yieldFilter.addEventListener('input', filterObjects);
    if (listViewBtn) listViewBtn.addEventListener('click', () => switchView('list'));
    if (calcViewBtn) calcViewBtn.addEventListener('click', () => switchView('calc'));
  });
} else {
  loadObjects();
 
  if (cityFilter) cityFilter.addEventListener('change', filterObjects);
  if (typeFilter) typeFilter.addEventListener('change', filterObjects);
  if (yieldFilter) yieldFilter.addEventListener('input', filterObjects);
  if (listViewBtn) listViewBtn.addEventListener('click', () => switchView('list'));
  if (calcViewBtn) calcViewBtn.addEventListener('click', () => switchView('calc'));
}
