// ⚙️ НАСТРОЙКИ ПРОЕКТА (меняй здесь)
const CONFIG = {
  // Если видео не нужно, оставь пустой строкой: welcomeVideo: ''
  welcomeVideo: 'https://github.com/777ernest888-oss/newgab/blob/main/welcome.mp4',
  welcomeImage: 'welcome.png',
  botToken: 'ТВОЙ_ТОКЕН_БОТА', // Для отправки заявок
  chatId: 'ТВОЙ_CHAT_ID'
};

let tg;
try {
  if (window.Telegram && window.Telegram.WebApp) {
    tg = window.Telegram.WebApp;
    tg.ready(); tg.expand();
  } else {
    tg = { ready:()=>{}, expand:()=>{}, showAlert:(m)=>alert(m), close:()=>window.close() };
  }
} catch (e) { console.error(e); }

let listings = [];
let currentModalId = null;

// === НАВИГАЦИЯ ===
function showBack() { document.getElementById('customBackBtn')?.classList.remove('hidden'); }
function hideBack() { document.getElementById('customBackBtn')?.classList.add('hidden'); }
function appBack() {
  if (!document.getElementById('consultModal').classList.contains('hidden')) return closeConsultModal();
  if (!document.getElementById('detailsModal').classList.contains('hidden')) return closeModal();
  if (!document.getElementById('calcContainer').classList.contains('hidden')) return switchView('list');
  tg?.close();
}

// === ЗАПУСК ===
function startApp() {
  document.getElementById('welcomeScreen')?.classList.add('hidden');
  document.getElementById('mainContent')?.classList.remove('hidden');
  window.scrollTo(0, 0); hideBack();
}
function toggleFilters() {
  const block = document.getElementById('filtersBlock');
  const btn = document.querySelector('.filters-toggle-btn');
  if (block && btn) {
    block.classList.toggle('hidden');
    btn.textContent = block.classList.contains('hidden') ? '🔽 Фильтры' : '🔼 Скрыть фильтры';
  }
}
function switchView(view) {
  const listBtn = document.getElementById('listViewBtn');
  const calcBtn = document.getElementById('calcViewBtn');
  const listCont = document.getElementById('listingsContainer');  const calcCont = document.getElementById('calcContainer');
 
  if (view === 'list') {
    listBtn.classList.add('active'); calcBtn.classList.remove('active');
    listCont.classList.remove('hidden'); calcCont.classList.add('hidden'); hideBack();
  } else {
    listBtn.classList.remove('active'); calcBtn.classList.add('active');
    listCont.classList.add('hidden'); calcCont.classList.remove('hidden'); showBack();
  }
}

// === ИНИЦИАЛИЗАЦИЯ ===
async function init() {
  const loader = document.getElementById('loadingScreen');
  loader?.classList.remove('hidden');
 
  try {
    // 🎥 Управление видео/фото
    const videoEl = document.getElementById('welcomeVideo');
    const imgEl = document.getElementById('welcomeImage');
    if (CONFIG.welcomeVideo) {
      videoEl.querySelector('source').src = CONFIG.welcomeVideo;
      videoEl.classList.remove('hidden');
      imgEl.classList.add('hidden');
    } else {
      videoEl.classList.add('hidden');
      imgEl.classList.remove('hidden');
    }

    // Загрузка данных (пример структуры, адаптируй под свою таблицу)
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/1tLCnDY0j9GNpVde3P9XF9VVjpi2xLGXy_3ScYxEYSXk/pub?output=csv';
    listings = await loadFromGoogleSheets(sheetUrl);
   
    renderFilters();
    renderListings(listings.filter(l => l.active));
    hideBack();
  } catch (error) {
    console.error('Init Error:', error);
  } finally {
    loader?.classList.add('hidden');
  }
}

async function loadFromGoogleSheets(url) {
  const response = await fetch(url);
  return parseCSV(await response.text());
}

function parseCSV(csv) {
  const lines = csv.trim().split('\n');  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values = line.split(','); // Упрощенный парсер, для сложных данных используй твой старый
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i]?.trim() || '');
    return obj;
  });
}

// === ФИЛЬТРЫ ===
function renderFilters() {
  const fill = (id, key) => {
    const cont = document.getElementById(id);
    if (!cont) return;
    const vals = [...new Set(listings.map(l => l[key]).filter(Boolean))].sort();
    cont.innerHTML = vals.map(v => `<label class="checkbox-label"><input type="checkbox" value="${v}" class="filter-checkbox" data-filter="${key}"><span>${v}</span></label>`).join('');
  };
  fill('cityCheckboxes', 'city');
  fill('typeCheckboxes', 'type');
 
  const yieldFilter = document.getElementById('yieldFilter');
  const yieldValue = document.getElementById('yieldValue');
  if (yieldFilter && yieldValue) {
    yieldFilter.addEventListener('input', function() {
      yieldValue.textContent = this.value + '%';
      filterListings();
    });
  }
  document.querySelectorAll('.filter-checkbox').forEach(cb => cb.addEventListener('change', filterListings));
}

function filterListings() {
  const cities = Array.from(document.querySelectorAll('input[data-filter="city"]:checked')).map(cb => cb.value);
  const types = Array.from(document.querySelectorAll('input[data-filter="type"]:checked')).map(cb => cb.value);
  const minYield = parseFloat(document.getElementById('yieldFilter')?.value || 0);
 
  const filtered = listings.filter(item => {
    if (!item.active) return false;
    if (cities.length && !cities.includes(item.city)) return false;
    if (types.length && !types.includes(item.type)) return false;
    if (typeof item.yield !== 'number' || item.yield < minYield) return false;
    return true;
  });
  renderListings(filtered);
}

// === СПИСОК ===
function renderListings(data) {
  const cont = document.getElementById('listingsContainer');  if (!cont) return;
  cont.innerHTML = '';
  if (!data?.length) {
    cont.innerHTML = `<div class="empty-state">${listings.length ? 'Ничего не найдено' : 'Объекты ещё не добавлены'}</div>`;
    return;
  }
  data.forEach(item => {
    const price = typeof item.price === 'number' ? item.price.toLocaleString('ru-RU') : '?';
    const card = document.createElement('div');
    card.className = 'listing-card';
    card.onclick = e => { if(!e.target.closest('.consult-btn-inline')) openDetails(item.id); };
    card.innerHTML = `
      <img src="${item.image_main||''}" class="listing-image" onerror="this.style.display='none'">
      <div class="listing-info">
        <h3>${item.name||'Без названия'}</h3>
        <div class="listing-meta"><span>📍 ${item.city||''}</span><span>🏢 ${item.type||''}</span></div>
        <div class="listing-price">${price} ₽</div>
        <div class="listing-meta"><span>Доходность: ${item.yield||'?'}%</span></div>
        <button class="tg-btn consult-btn-inline" onclick="openConsultForm('${item.id}', event)">📞 Связаться</button>
      </div>`;
    cont.appendChild(card);
  });
}

// === КАЛЬКУЛЯТОР ===
function calculateYield() {
  const price = parseFloat(document.getElementById('calcPrice').value) || 0;
  const rent = parseFloat(document.getElementById('calcRent').value) || 0;
  if (price > 0 && rent > 0) {
    const annual = rent * 12;
    document.getElementById('resMonth').textContent = annual.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('resYield').textContent = ((annual/price)*100).toFixed(2) + '%';
    document.getElementById('resPayback').textContent = (price/annual).toFixed(1) + ' лет';
    document.getElementById('calcResult').classList.remove('hidden');
  }
}

// === ДЕТАЛИ & ФОРМА ===
function openDetails(id) {
  const item = listings.find(l => l.id === id);
  if (!item) return;
  currentModalId = id;
  document.getElementById('modalTitle').textContent = item.name || '';
  document.getElementById('modalPrice').textContent = `${item.price?.toLocaleString('ru-RU')||'?'} ₽`;
  document.getElementById('modalMeta').innerHTML = `<div class="meta-row">📍 ${item.city||''}</div>`;
  document.getElementById('modalDescription').textContent = item.description || '';
  document.getElementById('detailsModal').classList.remove('hidden');
  showBack();
}
function closeModal() { document.getElementById('detailsModal').classList.add('hidden'); hideBack(); }function openConsultForm(id, e) { if(e) e.stopPropagation(); currentModalId = id; sendConsultRequest(); }
function sendConsultRequest() {
  const item = listings.find(l => l.id === currentModalId);
  if (!item) return;
  document.getElementById('consultObjectName').textContent = '🏢 ' + item.name;
  document.getElementById('consultPhone').value = '+7 (';
  document.getElementById('consultModal').classList.remove('hidden');
  showBack();
}
function closeConsultModal() { document.getElementById('consultModal').classList.add('hidden'); hideBack(); }

function submitConsultForm(e) {
  e.preventDefault();
  const item = listings.find(l => l.id === currentModalId);
  const name = document.getElementById('consultName').value;
  const phone = document.getElementById('consultPhone').value;
  if (phone.length < 18) { tg?.showAlert('❌ Введите корректный номер'); return; }
 
  if (CONFIG.botToken && CONFIG.chatId) {
    const text = `🔔 Заявка ГАБ!\n🏢 ${item.name}\n👤 ${name}\n📱 ${phone}`;
    fetch(`https://api.telegram.org/bot${CONFIG.botToken}/sendMessage`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({chat_id: CONFIG.chatId, text})
    }).then(r => r.json()).then(d => {
      if(d.ok) { closeConsultModal(); tg?.showAlert('✅ Отправлено!'); e.target.reset(); }
      else tg?.showAlert('❌ Ошибка');
    });
  } else {
    tg?.openLink('https://t.me/ТВОЙ_БОТ'); closeConsultModal();
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
