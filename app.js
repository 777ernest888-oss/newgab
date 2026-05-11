document.addEventListener('DOMContentLoaded', function() {

  const SHEET_ID = '1tLCnDY0j9GNpVde3P9XF9VVjpi2xLGXy_3ScYxEYSXk';
  const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

  // Безопасная инициализация Telegram
  let tg = null;
  try {
    if (window.Telegram && window.Telegram.WebApp) {
      tg = window.Telegram.WebApp;
      tg.expand();
      tg.ready();
      console.log("✅ Telegram WebApp инициализирован");
    }
  } catch(e) {
    console.warn("⚠️ Telegram WebApp недоступен:", e);
  }

  const listEl = document.getElementById('objectsList');
  const typeFilter = document.getElementById('typeFilter');
  const yieldFilter = document.getElementById('yieldFilter');
  const yieldVal = document.getElementById('yieldVal');
  const calcBtn = document.getElementById('calcBtn');
  const calcResult = document.getElementById('calcResult');
 
  const inputs = {
    price: document.getElementById('calcPrice'),
    rent: document.getElementById('calcRent'),
    vacancy: document.getElementById('calcVacancy'),
    expenses: document.getElementById('calcExpenses'),
    tax: document.getElementById('calcTax')
  };
  const outputs = {
    monthly: document.getElementById('resMonthly'),
    yield: document.getElementById('resYield'),
    payback: document.getElementById('resPayback')
  };

  let objects = [];

  async function loadObjects() {
    try {
      console.log('🔄 Загрузка данных из таблицы...');
      const response = await fetch(SHEET_URL);
      const text = await response.text();
     
      const jsonString = text.substring(47).slice(0, -2);
      const json = JSON.parse(jsonString);
     
      if (!json.table || !json.table.rows) {        console.error('❌ Нет данных в таблице');
        return [];
      }

      const rows = json.table.rows.filter(row => row.c && row.c[0] && row.c[0].v !== null);
     
      const loadedObjects = rows.map(row => ({
        id: row.c[0]?.v,
        title: row.c[1]?.v || '',
        type: row.c[2]?.v || 'retail',
        price: parseFloat(row.c[3]?.v) || 0,
        rent: parseFloat(row.c[4]?.v) || 0,
        yield: parseFloat(row.c[5]?.v) || 0,
        location: row.c[6]?.v || '',
        risks: row.c[7]?.v || ''
      })).filter(obj => obj.id && obj.price > 0);
     
      console.log('✅ Загружено объектов:', loadedObjects.length);
      return loadedObjects;
     
    } catch (e) {
      console.error('❌ Ошибка загрузки:', e);
      return [];
    }
  }

  function renderList() {
    if (!listEl) return;
   
    const type = typeFilter ? typeFilter.value : 'all';
    const minYield = yieldFilter ? parseFloat(yieldFilter.value) : 8;
    if (yieldVal) yieldVal.textContent = minYield;

    const filtered = objects.filter(obj =>
      (type === 'all' || obj.type === type) && obj.yield >= minYield
    );

    if (filtered.length === 0) {
      listEl.innerHTML = '<p style="text-align:center;color:var(--hint);padding:20px;">Нет объектов по фильтрам</p>';
      return;
    }

    listEl.innerHTML = filtered.map(obj => `
      <div class="card" onclick="loadToCalc(${obj.price}, ${obj.rent})">
        <div class="card-meta"><span>📍 ${obj.location}</span><span class="card-yield">≈${obj.yield}%</span></div>
        <h3>${obj.title}</h3>
        <div class="card-price">${(obj.price / 1000000).toFixed(2)} млн ₽</div>
        <div style="font-size:13px;color:var(--hint)">Аренда: ${obj.rent.toLocaleString()} ₽/мес</div>
        <button class="card-btn">📥 Загрузить в калькулятор</button>
      </div>    `).join('');
  }

  function calculate() {
    const price = parseFloat(inputs.price.value) || 0;
    const rent = parseFloat(inputs.rent.value) || 0;
    const vacancy = parseFloat(inputs.vacancy.value) || 0;
    const expenses = parseFloat(inputs.expenses.value) || 0;
    const taxRate = parseFloat(inputs.tax.value) || 0;

    if (price <= 0 || rent <= 0) {
      alert('Укажите цену объекта и сумму аренды');
      return;
    }

    const grossAnnual = rent * 12;
    const vacancyLoss = grossAnnual * (vacancy / 100);
    const effectiveIncome = grossAnnual - vacancyLoss;
    const expensesAnnual = expenses * 12;
    const taxAnnual = effectiveIncome * (taxRate / 100);
    const netAnnual = effectiveIncome - expensesAnnual - taxAnnual;

    const netMonthly = netAnnual / 12;
    const annualYield = (netAnnual / price) * 100;
    const paybackYears = netAnnual > 0 ? price / netAnnual : 99;

    if (outputs.monthly) outputs.monthly.textContent = `${Math.round(netMonthly).toLocaleString()} ₽`;
    if (outputs.yield) outputs.yield.textContent = `${annualYield.toFixed(2)}%`;
    if (outputs.payback) outputs.payback.textContent = `${paybackYears.toFixed(1)} лет`;

    if (calcResult) calcResult.classList.remove('hidden');
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
  }

  window.loadToCalc = function(price, rent) {
    if (inputs.price) inputs.price.value = price;
    if (inputs.rent) inputs.rent.value = rent;
    calculate();
    const calcSection = document.querySelector('.calculator');
    if (calcSection) calcSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  async function init() {
    objects = await loadObjects();
    console.log('📦 Всего объектов:', objects.length);
    renderList();
   
    if (typeFilter) typeFilter.addEventListener('change', renderList);
    if (yieldFilter) yieldFilter.addEventListener('input', renderList);
    if (calcBtn) calcBtn.addEventListener('click', (e) => { e.preventDefault(); calculate(); });  }

  init();
});
