// GAB Калькулятор — приложение для расчёта доходности ГАБ
document.addEventListener('DOMContentLoaded', function() {

  let tg = null;
  if (window.Telegram && window.Telegram.WebApp) {
      tg = window.Telegram.WebApp;
      tg.expand();
      tg.ready();
      console.log("Telegram WebApp инициализирован");
  } else {
      console.log("Запуск в обычном браузере");
  }

  const objects = [
    { id: 1, title: "Пекарня «Хлеб»", type: "retail", price: 4200000, rent: 35000, yield: 10.0, location: "Приморский р-н" },
    { id: 2, title: "Офисный блок А3", type: "office", price: 5800000, rent: 48000, yield: 9.9, location: "Центральный р-н" },
    { id: 3, title: "Складской модуль", type: "warehouse", price: 3100000, rent: 22000, yield: 8.5, location: "Колпинский р-н" },
    { id: 4, title: "Кофейня у метро", type: "retail", price: 6500000, rent: 55000, yield: 10.1, location: "Московский р-н" }
  ];

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

  function renderList() {
    if (!listEl) return;
   
    const type = typeFilter ? typeFilter.value : 'all';
    const minYield = yieldFilter ? parseFloat(yieldFilter.value) : 8;
    if (yieldVal) yieldVal.textContent = minYield;

    const filtered = objects.filter(obj =>      (type === 'all' || obj.type === type) && obj.yield >= minYield
    );

    listEl.innerHTML = filtered.length ? filtered.map(obj => `
      <div class="card" onclick="loadToCalc(${obj.price}, ${obj.rent})">
        <div class="card-meta"><span>📍 ${obj.location}</span><span class="card-yield">≈${obj.yield}%</span></div>
        <h3>${obj.title}</h3>
        <div class="card-price">${(obj.price / 1000000).toFixed(2)} млн ₽</div>
        <div style="font-size:13px;color:var(--hint)">Аренда: ${obj.rent.toLocaleString()} ₽/мес</div>
        <button class="card-btn">📥 Загрузить в калькулятор</button>
      </div>
    `).join('') : '<p style="text-align:center;color:var(--hint);padding:20px;">Нет объектов по фильтрам</p>';
  }

  function calculate() {
    const price = parseFloat(inputs.price.value) || 0;
    const rent = parseFloat(inputs.rent.value) || 0;
    const vacancy = parseFloat(inputs.vacancy.value) || 0;
    const expenses = parseFloat(inputs.expenses.value) || 0;
    const taxRate = parseFloat(inputs.tax.value) || 0;

    if (price <= 0 || rent <= 0) {
      if (tg) tg.showAlert('Укажите цену и аренду');
      else alert('Укажите цену объекта и сумму аренды');
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

  if (calcBtn) {
      calcBtn.addEventListener('click', function(e) {
          e.preventDefault();          calculate();
      });
  }

  if (typeFilter) typeFilter.addEventListener('change', renderList);
  if (yieldFilter) yieldFilter.addEventListener('input', renderList);

  window.loadToCalc = function(price, rent) {
      if (inputs.price) inputs.price.value = price;
      if (inputs.rent) inputs.rent.value = rent;
      calculate();
      const calcSection = document.querySelector('.calculator');
      if (calcSection) calcSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  renderList();
});
