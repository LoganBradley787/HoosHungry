async function main() {
  const res = await fetch('/api/menu');
  const data = await res.json();

  // Meta + stale banner
  const meta = document.getElementById('meta');
  meta.textContent = `${data.venue} • ${data.date}`;
  const banner = document.getElementById('banner');
  if (data.generated_at) {
    const gen = new Date(data.generated_at);
    const hours = (Date.now() - gen.getTime()) / 36e5;
    if (hours > 24) {
      banner.textContent = `Heads up: data may be stale (generated ${gen.toLocaleString()}).`;
      banner.classList.remove('hidden');
    }
  }

  const mealSel = document.getElementById('meal');
  const stationSel = document.getElementById('station');
  const q = document.getElementById('q');
  const list = document.getElementById('list');

  const meals = data.meals || [];

  // Populate meal dropdown
  const mealNames = ['All', ...meals.map(m => m.name)];
  mealSel.innerHTML = mealNames.map(n => `<option value="${n === 'All' ? '' : n}">${n}</option>`).join('');

  function stationsForMeal(mealName) {
    const ms = mealName ? meals.filter(m => m.name === mealName) : meals;
    const set = new Set();
    ms.forEach(m => (m.stations || []).forEach(s => set.add(s.name)));
    return ['All', ...Array.from(set)];
  }

  function renderStations() {
    const st = stationsForMeal(mealSel.value);
    stationSel.innerHTML = st.map(n => `<option value="${n === 'All' ? '' : n}">${n}</option>`).join('');
  }

  function pill(text, tone = 'zinc') {
    return `<span class="inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] leading-4 border-${tone}-300 dark:border-${tone}-800 text-${tone}-700 dark:text-${tone}-300">${text}</span>`;
  }

  function render() {
    const mealVal = mealSel.value;
    const stationVal = stationSel.value;
    const query = q.value.trim().toLowerCase();

    const ms = mealVal ? meals.filter(m => m.name === mealVal) : meals;

    list.innerHTML = '';
    for (const m of ms) {
      for (const s of (m.stations || [])) {
        if (stationVal && s.name !== stationVal) continue;

        // Filter items by query across title, tags, allergens
        const items = (s.items || []).filter(it => {
          if (!query) return true;
          const hay = [
            it.title,
            ...(it.tags || []),
            ...(it.allergens || []),
            it.notes || ''
          ].join(' ').toLowerCase();
          return hay.includes(query);
        });

        if (!items.length) continue;

        // Card
        const card = document.createElement('section');
        card.className = 'rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm';
        card.innerHTML = `
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs text-zinc-500">${m.name}</div>
              <h3 class="text-base font-semibold">${s.name}</h3>
            </div>
          </div>
          <ul class="mt-3 space-y-2">
            ${items.map(it => `
              <li class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div class="font-medium">${it.title}</div>
                <div class="flex flex-wrap gap-1">
                  ${(it.tags || []).map(t => pill(t, 'sky')).join('')}
                  ${(it.allergens || []).map(a => pill(a, 'rose')).join('')}
                </div>
              </li>
            `).join('')}
          </ul>
        `;
        list.appendChild(card);
      }
    }

    if (!list.children.length) {
      list.innerHTML = `<div class="text-sm text-zinc-500">No items match your filters.</div>`;
    }
  }

  // Events
  mealSel.addEventListener('change', () => { renderStations(); render(); });
  stationSel.addEventListener('change', render);
  q.addEventListener('input', render);

  // Theme toggle
  const toggle = document.getElementById('toggleDark');
  const rootEl = document.documentElement;
  const applyTheme = (v) => v ? rootEl.classList.add('dark') : rootEl.classList.remove('dark');
  let darkPref = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(darkPref);
  toggle.addEventListener('click', () => { darkPref = !darkPref; applyTheme(darkPref); });

  // Init
  renderStations();
  render();
}

main();