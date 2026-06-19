const statusDot = document.getElementById('statusDot');
const connDot = document.getElementById('connDot');
const connText = document.getElementById('connText');
const latencyValue = document.getElementById('latencyValue');
const countValue = document.getElementById('countValue');
const lastCheckValue = document.getElementById('lastCheckValue');
const serviceRows = document.getElementById('serviceRows');
const addForm = document.getElementById('addForm');
const clockEl = document.getElementById('clock');

function tickClock() {
  clockEl.textContent = new Date().toLocaleTimeString();
}
setInterval(tickClock, 1000);
tickClock();

async function checkDb() {
  try {
    const res = await fetch('/api/db-ping');
    const data = await res.json();
    if (data.ok) {
      connDot.className = 'dot up';
      connText.textContent = `db connected · ${data.latencyMs}ms`;
      statusDot.style.background = 'var(--accent-green)';
      latencyValue.textContent = `${data.latencyMs} ms`;
    } else {
      throw new Error(data.error || 'unknown error');
    }
  } catch (err) {
    connDot.className = 'dot down';
    connText.textContent = 'db offline';
    statusDot.style.background = 'var(--accent-red)';
    latencyValue.textContent = '—';
  }
  lastCheckValue.textContent = new Date().toLocaleTimeString();
}

function renderRows(services) {
  if (!services.length) {
    serviceRows.innerHTML = '<tr><td colspan="5" class="muted">No services yet. Add one above.</td></tr>';
    return;
  }
  serviceRows.innerHTML = services.map((s) => `
    <tr data-id="${s.id}">
      <td class="mono muted">${s.id}</td>
      <td>${escapeHtml(s.name)}</td>
      <td><span class="status-tag ${s.status}">${s.status}</span></td>
      <td class="mono muted">${new Date(s.updated_at).toLocaleString()}</td>
      <td><button class="row-delete" data-id="${s.id}">remove</button></td>
    </tr>
  `).join('');

  serviceRows.querySelectorAll('.row-delete').forEach((btn) => {
    btn.addEventListener('click', () => deleteService(btn.dataset.id));
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadServices() {
  try {
    const res = await fetch('/api/services');
    const services = await res.json();
    countValue.textContent = services.length;
    renderRows(services);
  } catch (err) {
    serviceRows.innerHTML = '<tr><td colspan="5" class="muted">Could not load services.</td></tr>';
  }
}

async function deleteService(id) {
  await fetch(`/api/services/${id}`, { method: 'DELETE' });
  loadServices();
}

addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('newName').value.trim();
  const status = document.getElementById('newStatus').value;
  if (!name) return;
  await fetch('/api/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, status }),
  });
  document.getElementById('newName').value = '';
  loadServices();
});

checkDb();
loadServices();
setInterval(checkDb, 5000);
