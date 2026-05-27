console.log(" ГАБ Калькулятор запущен!");

const WELCOME_VIDEO = 'https://raw.githubusercontent.com/777ernest888-oss/newgab/main/welcome.mp4';
const SHEET_ID = '1tLCnDY0j9GNpVde3P9XF9VVjpi2xLGXy_3ScYxEYSXk';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

// 🔐 НАСТРОЙКИ
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxiuUMeslxZOUBC2Y4sg2QqJe_Iy5u8qA3WE7j3sWfuvWmzXz8P807FK9m7Q5YFiWs2/exec';
const SECRET_KEY = 'SecretParol999';

let allObjects = [];
let currentModalId = null;
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
        id: cols[0]?.trim() || '', title: cols[1]?.trim() || 'Без названия', type: cols[2]?.trim() || '',
        price: parseFloat(cols[3]?.trim()) || 0, rent: parseFloat(cols[4]?.trim()) || 0,
        yield: parseFloat(cols[5]?.trim()) || 0, city: cols[6]?.trim() || '', location: cols[7]?.trim() || '',
        photo: cols[8]?.trim() || '', description: cols[9]?.trim() || 'Описание отсутствует'
      };
    }).filter(obj => obj.id);
    console.log(`✅ Загружено: ${allObjects.length} объектов`);
    const videoEl = document.getElementById('welcomeVideo');
    const imgEl = document.getElementById('welcomeImage');
    if (WELCOME_VIDEO && WELCOME_VIDEO.trim() !== '') { videoEl.src = WELCOME_VIDEO; videoEl.style.display = 'block'; imgEl.style.display = 'none'; }
    else { videoEl.style.display = 'none'; imgEl.style.display = 'block'; }
    fillFilters();
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('welcomeScreen').classList.remove('hidden');
  } catch (e) { console.error("❌ Ошибка:", e); alert("Ошибка: " + e.message); document.getElementById('loadingScreen').classList.add('hidden'); }
}

function fillFilters() {
  const cities = [...new Set(allObjects.map(obj => obj.city).filter(Boolean))].sort();
  const types = [...new Set(allObjects.map(obj => obj.type).filter(Boolean))].sort();
  const cityFilter = document.getElementById('cityFilter');
  const typeFilter = document.getElementById('typeFilter');
  if (cityFilter) cityFilter.innerHTML = '<option value="">Все города</option>' + cities.map(c => `<option value="${c}">${c}</option>`).join('');
  if (typeFilter) typeFilter.innerHTML = '<option value="">Все типы</option>' + types.map(t => `<option value="${t}">${t}</option>`).join('');
}
function startApp() {
  document.getElementById('welcomeScreen').classList.add('hidden');
  document.getElementById('mainScreen').classList.remove('hidden');
  checkIntroBanner();
  renderList(allObjects);
}

function closeBanner() {
  const banner = document.getElementById('introBanner');
  banner.style.opacity = '0';
  banner.style.transform = 'translateY(-20px)';
  banner.style.transition = 'all 0.3s ease';
  setTimeout(() => {
    banner.style.display = 'none';
    localStorage.setItem('gabIntroClosed', 'true');
  }, 300);
}

function checkIntroBanner() {
  const isClosed = localStorage.getItem('gabIntroClosed');
  if (isClosed === 'true') {
    const banner = document.getElementById('introBanner');
    if (banner) banner.style.display = 'none';
  }
}

function toggleFilters() { document.getElementById('filtersBlock').classList.toggle('hidden'); }

function switchView(view) {
  currentView = view;
  const buttons = document.querySelectorAll('.view-btn');
  const listContainer = document.getElementById('objectsList');
  const calcContainer = document.getElementById('calcContainer');
  const backBtn = document.getElementById('backBtn');
  buttons.forEach(b => b.classList.remove('active'));
  if (view === 'list') { buttons[0].classList.add('active'); listContainer.classList.remove('hidden'); calcContainer.classList.add('hidden'); backBtn.classList.add('hidden'); }
  else { buttons[1].classList.add('active'); listContainer.classList.add('hidden'); calcContainer.classList.remove('hidden'); backBtn.classList.remove('hidden'); }
}

function goBack() { switchView('list'); }

function filterObjects() {
  const city = document.getElementById('cityFilter')?.value || '';
  const type = document.getElementById('typeFilter')?.value || '';
  const filtered = allObjects.filter(obj => { return (!city || obj.city === city) && (!type || obj.type === type); });
  renderList(filtered);
}

function renderList(objects) {
  const container = document.getElementById('objectsList');  if (!container) return;
  if (objects.length === 0) { container.innerHTML = '<p style="text-align:center; color:#999; padding:40px;">Нет объектов</p>'; return; }
  container.innerHTML = objects.map(obj => {
    const y = obj.yield || ((obj.rent * 12 / obj.price) * 100).toFixed(2);
    const p = (obj.price / (obj.rent * 12)).toFixed(1);
    return `
      <div class="card" onclick="openModal('${obj.id}')">
        <div class="card-meta"><span>📍 ${obj.city || 'Не указано'}</span><span class="card-yield">📈 ${y}%</span></div>
        <h3>${obj.title}</h3>
        <div class="card-price">${obj.price.toLocaleString('ru-RU')} ₽</div>
        <div class="card-info">📈 Аренда: ${obj.rent.toLocaleString('ru-RU')} ₽/мес<br> Окупаемость: ${p} лет</div>
        <button class="card-btn" onclick="event.stopPropagation(); openModal('${obj.id}')">💰 Подробнее</button>
      </div>`;
  }).join('');
}

function openModal(id) {
  currentModalId = id;
  const obj = allObjects.find(o => o.id === id);
  if (!obj) return;
  const y = obj.yield || ((obj.rent * 12 / obj.price) * 100).toFixed(2);
  const p = (obj.price / (obj.rent * 12)).toFixed(1);
  const annual = (obj.rent * 12).toLocaleString('ru-RU');
  document.getElementById('modalImg').src = obj.photo || 'hero.png';
  document.getElementById('modalTitle').textContent = obj.title;
  document.getElementById('modalPrice').textContent = `${obj.price.toLocaleString('ru-RU')} ₽`;

  document.getElementById('modalYield').innerHTML = `
    <div style="margin-bottom: 4px;">📈 <b>Доходность:</b> ${y}%</div>
    <div>⏳ <b>Окупаемость:</b> ${p} лет</div>
  `;

  document.getElementById('modalMeta').innerHTML = `📍 ${obj.city || 'Не указано'} • ${obj.location || ''}<br>🏢 Тип: ${obj.type || 'Не указан'}<br>💰 Доход в год: ${annual} ₽`;
  document.getElementById('modalDesc').textContent = obj.description;

  document.getElementById('objectDetails').classList.remove('hidden');
  document.getElementById('modalActions').classList.remove('hidden');
  document.getElementById('leadForm').classList.add('hidden');
  document.getElementById('leadName').value = '';
  document.getElementById('leadPhone').value = '';
  document.getElementById('leadTelegram').value = '';

  if (window.Telegram && window.Telegram.WebApp.initDataUnsafe?.user) {
    document.getElementById('leadName').value = window.Telegram.WebApp.initDataUnsafe.user.first_name || '';
  }

  document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeModal(e) {  if (!e || e.target.id === 'modalOverlay') document.getElementById('modalOverlay').classList.add('hidden');
}

function openLeadForm() {
  document.getElementById('objectDetails').classList.add('hidden');
  document.getElementById('modalActions').classList.add('hidden');
  document.getElementById('leadForm').classList.remove('hidden');
}

function cancelLead() {
  document.getElementById('objectDetails').classList.remove('hidden');
  document.getElementById('modalActions').classList.remove('hidden');
  document.getElementById('leadForm').classList.add('hidden');
}

// 📞 СТРОГАЯ МАСКА ТЕЛЕФОНА (МОБИЛЬНАЯ ВЕРСИЯ)
const phoneInput = document.getElementById('leadPhone');

if (phoneInput) {
  // Принудительная очистка при любом вводе
  phoneInput.addEventListener('input', function(e) {
    let val = e.target.value;
    // Удаляем ВСЁ кроме цифр
    val = val.replace(/\D/g, '');
    // Ограничиваем длину
    if (val.length > 11) val = val.slice(0, 11);
    // Если начинается не с 7 или 8, добавляем 7
    if (val.length > 0 && !val.startsWith('7') && !val.startsWith('8')) {
      val = '7' + val;
    }
    if (val.startsWith('8')) {
      val = '7' + val.slice(1);
    }
    // Форматируем
    let formatted = '+7';
    if (val.length > 1) {
      formatted += ' (' + val.slice(1, 4);
    }
    if (val.length >= 5) {
      formatted += ') ' + val.slice(4, 7);
    }
    if (val.length >= 8) {
      formatted += '-' + val.slice(7, 9);
    }
    if (val.length >= 10) {
      formatted += '-' + val.slice(9, 11);
    }
    e.target.value = formatted;
  });
    // Блокируем вставку нецифрового текста
  phoneInput.addEventListener('paste', function(e) {
    e.preventDefault();
    let paste = (e.clipboardData || window.clipboardData).getData('text');
    paste = paste.replace(/\D/g, '');
    if (paste.length > 11) paste = paste.slice(0, 11);
    if (paste.startsWith('8')) {
      paste = '7' + paste.slice(1);
    }
    if (!paste.startsWith('7') && paste.length > 0) {
      paste = '7' + paste;
    }
    let formatted = '+7';
    if (paste.length > 1) {
      formatted += ' (' + paste.slice(1, 4);
    }
    if (paste.length >= 5) {
      formatted += ') ' + paste.slice(4, 7);
    }
    if (paste.length >= 8) {
      formatted += '-' + paste.slice(7, 9);
    }
    if (paste.length >= 10) {
      formatted += '-' + paste.slice(9, 11);
    }
    e.target.value = formatted;
  });
 
  // Блокируем ввод нецифровых символов
  phoneInput.addEventListener('keydown', function(e) {
    const allowedKeys = ['0','1','2','3','4','5','6','7','8','9','Backspace','Delete','Tab','ArrowLeft','ArrowRight'];
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  });
}

// 🚫 БЛОКИРОВКА КИРИЛЛИЦЫ В TELEGRAM
const telegramInput = document.getElementById('leadTelegram');

if (telegramInput) {
  telegramInput.addEventListener('input', function(e) {
    let val = e.target.value;
    // Оставляем только латиницу, цифры, @ и _
    val = val.replace(/[^a-zA-Z0-9_@]/g, '');
    // @ только в начале
    if (val.includes('@') && !val.startsWith('@')) {
      val = '@' + val.replace(/@/g, '');
    }
    // Ограничиваем длину    if (val.length > 32) val = val.slice(0, 32);
    e.target.value = val;
  });
 
  // Блокируем вставку
  telegramInput.addEventListener('paste', function(e) {
    e.preventDefault();
    let paste = (e.clipboardData || window.clipboardData).getData('text');
    paste = paste.replace(/[^a-zA-Z0-9_@]/g, '');
    if (paste.includes('@') && !paste.startsWith('@')) {
      paste = '@' + paste.replace(/@/g, '');
    }
    if (paste.length > 32) paste = paste.slice(0, 32);
    e.target.value = paste;
  });
}

// 🚀 ОТПРАВКА ЗАЯВКИ С ВАЛИДАЦИЕЙ
async function submitLead() {
  const obj = allObjects.find(o => o.id === currentModalId);
  if (!obj) return;

  const name = document.getElementById('leadName').value.trim();
  const phone = document.getElementById('leadPhone').value.trim();
  let telegram = document.getElementById('leadTelegram').value.trim();
  const phoneDigits = phone.replace(/\D/g, '');

  if (!name || name.length < 2) {
    alert('❌ Пожалуйста, введите имя (минимум 2 символа)');
    return;
  }

  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    alert('❌ Введите корректный номер телефона (10–15 цифр)\nПример: +7 (999) 123-45-67');
    return;
  }

  if (telegram) {
    if (!telegram.startsWith('@')) {
      telegram = '@' + telegram;
    }
  }

  const btn = document.getElementById('submitLeadBtn');
  btn.textContent = 'Отправка...';
  btn.disabled = true;

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',      body: JSON.stringify({
        secret: SECRET_KEY,
        projectId: 'gab_calc',
        title: obj.title,
        price: obj.price.toLocaleString('ru-RU'),
        city: obj.city,
        leadName: name,
        leadPhone: phone,
        leadTelegram: telegram || 'Не указан'
      })
    });
    const result = await response.json();
    if (result.success) {
      alert('✅ Заявка отправлена! Брокер свяжется с вами.');
      closeModal();
    } else { alert('❌ Ошибка: ' + result.error); }
  } catch (e) { alert('❌ Ошибка сети: ' + e.message); }
  finally { btn.textContent = 'Отправить заявку'; btn.disabled = false; }
}

function calculateYield() {
  const price = parseFloat(document.getElementById('calcPrice')?.value) || 0;
  const rent = parseFloat(document.getElementById('calcRent')?.value) || 0;
  if (!price || !rent) return alert('Введите цену и аренду');
  const annual = rent * 12;
  const y = ((annual / price) * 100).toFixed(2);
  const p = (price / annual).toFixed(1);
  document.getElementById('calcResult').innerHTML = `<div class="res-row"><span>💰 Доход в год:</span> <span>${annual.toLocaleString('ru-RU')} ₽</span></div><div class="res-row"><span>📈 Доходность:</span> <span>${y}%</span></div><div class="res-row"><span>⏳ Окупаемость:</span> <span>${p} лет</span></div>`;
  document.getElementById('calcResult').classList.remove('hidden');
}

function copyLink() { navigator.clipboard.writeText(window.location.href); alert('✅ Ссылка скопирована!'); }

document.getElementById('cityFilter')?.addEventListener('change', filterObjects);
document.getElementById('typeFilter')?.addEventListener('change', filterObjects);

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadObjects); else loadObjects();
