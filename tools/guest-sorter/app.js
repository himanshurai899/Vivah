/* Vivaah Guest Sorter — app.js
 * Standalone offline-capable contact sorter.
 * Requires: xlsx.full.min.js (SheetJS), contacts-data.js (optional preloaded contacts)
 */

// ─── State ─────────────────────────────────────────────────────────────────
let allContacts = [];          // {id, name, phones[]}
let selectedIds = new Set();   // ids of contacts in Selected lane
let tags = {};                 // id → 'tilak' | 'wedding' | 'both'
let searchQuery = '';
let dragSrcId = null;
let dragSrcLane = null;        // 'import' | 'selected'
let nextId = 1;

// Pagination for import lane (performance with 2500+ contacts)
const PAGE_SIZE = 100;
let visiblePage = 1;

// ─── File meta for export ──────────────────────────────────────────────────
const FILE_META = [
  { key: 'tilak',   label: 'Tilak Ceremony',  filename: 'Tilak_Guest_List.xlsx' },
  { key: 'wedding', label: 'Wedding Baraati',  filename: 'Wedding_Guest_List.xlsx' },
  { key: 'both',    label: 'Both Events',      filename: 'Both_Events_Guest_List.xlsx' },
];

// ─── Init ──────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', init);

function init() {
  setupImportZone();
  setupFileInput();
  setupManualModal();
  setupSearch();
  setupButtons();
  renderStats();

  // Update preloaded button with real count if available
  if (typeof PRELOADED_CONTACTS !== 'undefined' && Array.isArray(PRELOADED_CONTACTS)) {
    const btn = document.getElementById('btnLoadPreloaded');
    const n = PRELOADED_CONTACTS.length.toLocaleString('en-IN');
    btn.querySelector('svg').insertAdjacentHTML('afterend', ` Load Phone Book (${n})`);
    // Remove the default text node
    const nodes = Array.from(btn.childNodes);
    if (nodes.length > 2) btn.removeChild(nodes[nodes.length - 1]);
  }
}

// ─── Show/hide board ───────────────────────────────────────────────────────
function showBoard() {
  document.getElementById('boardToolbar').classList.add('is-visible');
  document.getElementById('board').classList.add('is-visible');
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getInitials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Parsers ───────────────────────────────────────────────────────────────

function parseVCF(text) {
  const contacts = [];
  const blocks = text.split(/BEGIN:VCARD/i).slice(1);
  for (const block of blocks) {
    let name = '';
    const phones = [];
    for (let line of block.split('\n')) {
      line = line.replace(/\r$/, '').trim();
      if (!line) continue;
      // Handle folded lines
      if (/^FN:/i.test(line)) {
        name = line.replace(/^FN:/i, '').trim();
      } else if (/^N:/i.test(line) && !name) {
        const parts = line.replace(/^N:/i, '').split(';');
        name = [parts[1], parts[0]].filter(Boolean).join(' ').trim();
      } else if (/^TEL/i.test(line)) {
        const phone = line.replace(/^TEL[^:]*:/i, '').replace(/\s+/g, '').trim();
        if (phone && !phones.includes(phone)) phones.push(phone);
      }
    }
    if (name || phones.length) {
      contacts.push({ id: nextId++, name: name || phones[0] || '', phones });
    }
  }
  return contacts;
}

function parseJSON(text) {
  let data;
  try { data = JSON.parse(text); } catch { return []; }
  if (!Array.isArray(data)) {
    data = data.contacts || data.data || data.guests || data.members || data.list || [];
  }
  if (!Array.isArray(data)) return [];
  return data.map(item => {
    const name = String(
      item.name || item.fullName || item.full_name || item.displayName || item.Name || ''
    ).trim();
    const phones = extractPhones(item);
    return { id: nextId++, name, phones };
  }).filter(c => c.name || c.phones.length);
}

function extractPhones(item) {
  const phones = [];
  const add = v => { const s = String(v ?? '').replace(/\s+/g, '').trim(); if (s && !phones.includes(s)) phones.push(s); };
  if (item.phone) add(item.phone);
  if (item.mobile) add(item.mobile);
  if (item.tel) add(item.tel);
  if (item.telephone) add(item.telephone);
  if (item.phones && Array.isArray(item.phones)) item.phones.forEach(add);
  for (let i = 1; i <= 5; i++) {
    if (item[`phone${i}`]) add(item[`phone${i}`]);
    if (item[`Phone ${i}`]) add(item[`Phone ${i}`]);
  }
  return phones;
}

/* CSV split respecting quoted fields */
function splitCSVLine(line) {
  const cols = [];
  let current = '';
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { cols.push(current.trim()); current = ''; }
    else { current += ch; }
  }
  cols.push(current.trim());
  return cols.map(c => c.replace(/^"|"$/g, '').trim());
}

function findColIdx(headers, candidates) {
  for (const c of candidates) {
    const idx = headers.findIndex(h => h === c);
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headerLine = lines[0].toLowerCase();
  // Detect Google Contacts export (has "first name" or "phone 1 - value")
  if (headerLine.includes('first name') || headerLine.includes('phone 1 - value')) {
    return parseGoogleContactsCSV(lines);
  }
  return parseGenericCSV(lines);
}

function parseGenericCSV(lines) {
  const rawHeaders = splitCSVLine(lines[0]);
  const headers = rawHeaders.map(h => h.toLowerCase());
  const nameIdx = findColIdx(headers, ['name', 'full name', 'fullname', 'contact name', 'contact', 'person']);
  const phoneIdxs = headers
    .map((h, i) => ({ h, i }))
    .filter(({ h }) => h.includes('phone') || h.includes('mobile') || h.includes('tel') || h === 'number' || h === 'contact number')
    .map(({ i }) => i);
  const contacts = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    if (!cols.some(c => c)) continue;
    const name = nameIdx >= 0 ? (cols[nameIdx] || '').trim() : (cols[0] || '').trim();
    const phones = phoneIdxs
      .map(idx => (cols[idx] || '').replace(/\s+/g, '').trim())
      .filter(Boolean)
      .filter((v, idx, arr) => arr.indexOf(v) === idx);
    if (name || phones.length) contacts.push({ id: nextId++, name, phones });
  }
  return contacts;
}

function parseGoogleContactsCSV(lines) {
  const rawHeaders = splitCSVLine(lines[0]);
  const headers = rawHeaders.map(h => h.toLowerCase().trim());
  const fnIdx  = findColIdx(headers, ['first name', 'given name']);
  const lnIdx  = findColIdx(headers, ['last name', 'family name', 'surname']);
  const nameIdx = findColIdx(headers, ['name', 'full name']);
  const phoneIdxs = headers
    .map((h, i) => ({ h, i }))
    .filter(({ h }) => /phone.*value/i.test(h))
    .map(({ i }) => i);
  if (!phoneIdxs.length) {
    // fallback: any column with "phone"
    phoneIdxs.push(...headers
      .map((h, i) => ({ h, i }))
      .filter(({ h }) => h.includes('phone'))
      .map(({ i }) => i));
  }
  const contacts = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    if (!cols.some(c => c)) continue;
    let name = '';
    if (nameIdx >= 0) {
      name = (cols[nameIdx] || '').trim();
    } else {
      const fn = fnIdx >= 0 ? (cols[fnIdx] || '').trim() : '';
      const ln = lnIdx >= 0 ? (cols[lnIdx] || '').trim() : '';
      name = [fn, ln].filter(Boolean).join(' ');
    }
    const phones = phoneIdxs
      .map(idx => (cols[idx] || '').replace(/\s+/g, '').trim())
      .filter(Boolean)
      .filter((v, idx, arr) => arr.indexOf(v) === idx);
    if (name || phones.length) contacts.push({ id: nextId++, name, phones });
  }
  return contacts;
}

function parseExcel(arrayBuffer) {
  if (typeof XLSX === 'undefined') {
    showToast('xlsx.full.min.js not loaded — Excel import unavailable', 'error');
    return [];
  }
  try {
    const wb = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
    if (!rows.length) return [];
    return rows.map(row => {
      const keys = Object.keys(row);
      const nameKey = keys.find(k => /^(name|full.?name|contact.*name|person)$/i.test(k)) || keys[0];
      const phones = keys
        .filter(k => /phone|mobile|tel|number/i.test(k))
        .map(k => String(row[k]).replace(/\s+/g, '').trim())
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i);
      return { id: nextId++, name: String(row[nameKey] || '').trim(), phones };
    }).filter(c => c.name || c.phones.length);
  } catch (err) {
    showToast('Could not read Excel file: ' + err.message, 'error');
    return [];
  }
}

// ─── File handling ─────────────────────────────────────────────────────────

function handleFiles(files) {
  const fileArr = Array.from(files);
  if (!fileArr.length) return;
  let pending = fileArr.length;
  let totalAdded = 0;

  const done = () => {
    showToast(`Imported ${totalAdded.toLocaleString('en-IN')} new contacts`, 'success');
    visiblePage = 1;
    showBoard();
    render();
  };

  fileArr.forEach(file => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = e => {
        const contacts = parseExcel(e.target.result);
        totalAdded += mergeContacts(contacts);
        if (--pending === 0) done();
      };
      reader.onerror = () => { pending--; if (!pending) done(); };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = e => {
        const text = e.target.result;
        let contacts = [];
        if (ext === 'vcf') contacts = parseVCF(text);
        else if (ext === 'json') contacts = parseJSON(text);
        else contacts = parseCSV(text); // csv + google contacts + fallback
        totalAdded += mergeContacts(contacts);
        if (--pending === 0) done();
      };
      reader.onerror = () => { pending--; if (!pending) done(); };
      reader.readAsText(file);
    }
  });
}

// ─── Phone normalisation ───────────────────────────────────────────────────
// Strip non-digits, then use last 10 digits (Indian mobile numbers drop +91 prefix).
// Returns '' for unusable strings so callers can filter with .length >= 7.
function normalizePhone(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

// Build a Map<normalizedPhone → contactId> over allContacts
function buildPhoneIndex() {
  const idx = new Map();
  allContacts.forEach(c => {
    c.phones.forEach(p => {
      const n = normalizePhone(p);
      if (n.length >= 7) idx.set(n, c.id);
    });
  });
  return idx;
}

// Build a Map<normalizedName → contactId> over allContacts
function buildNameIndex() {
  const idx = new Map();
  allContacts.forEach(c => {
    const n = c.name.trim().toLowerCase();
    if (n.length > 2) idx.set(n, c.id);
  });
  return idx;
}

/* Add new contacts, merging duplicates by phone digit match OR exact name match.
 * Returns count of net-new contacts added. */
function mergeContacts(newContacts) {
  const phoneIdx = buildPhoneIndex();
  const nameIdx  = buildNameIndex();
  let added = 0;

  for (const nc of newContacts) {
    const ncNorms = nc.phones.map(normalizePhone).filter(p => p.length >= 7);
    const ncName  = nc.name.trim().toLowerCase();

    // Prefer phone match, fall back to name match
    let matchId = null;
    for (const norm of ncNorms) {
      if (phoneIdx.has(norm)) { matchId = phoneIdx.get(norm); break; }
    }
    if (matchId === null && ncName.length > 2) {
      matchId = nameIdx.get(ncName) ?? null;
    }

    if (matchId !== null) {
      // Merge new phones into the existing contact
      const existing = allContacts.find(c => c.id === matchId);
      if (existing) {
        nc.phones.forEach(p => {
          const norm = normalizePhone(p);
          if (norm.length >= 7 && !phoneIdx.has(norm)) {
            existing.phones.push(p);
            phoneIdx.set(norm, matchId);
          }
        });
        // Keep the longer / more complete name
        if (nc.name.trim().length > existing.name.trim().length) {
          nameIdx.delete(existing.name.trim().toLowerCase());
          existing.name = nc.name.trim();
          nameIdx.set(ncName, matchId);
        }
      }
    } else {
      const contact = { id: nextId++, name: nc.name, phones: nc.phones };
      allContacts.push(contact);
      ncNorms.forEach(norm => phoneIdx.set(norm, contact.id));
      if (ncName.length > 2) nameIdx.set(ncName, contact.id);
      added++;
    }
  }

  return added;
}

/* Run a deduplication pass over the already-loaded allContacts array.
 * Merges contacts that share a normalised phone digit sequence OR exact name.
 * Returns the number of duplicate entries removed. */
function deduplicateAll() {
  const phoneIdx = new Map(); // normalizedPhone → master array index
  const nameIdx  = new Map(); // normalizedName  → master array index
  const toRemove = new Set(); // ids to remove

  for (let i = 0; i < allContacts.length; i++) {
    const c = allContacts[i];
    const phoneNorms = c.phones.map(normalizePhone).filter(p => p.length >= 7);
    const nameNorm   = c.name.trim().toLowerCase();

    let masterIdx = null;
    for (const norm of phoneNorms) {
      if (phoneIdx.has(norm)) { masterIdx = phoneIdx.get(norm); break; }
    }
    if (masterIdx === null && nameNorm.length > 2) {
      masterIdx = nameIdx.has(nameNorm) ? nameIdx.get(nameNorm) : null;
    }

    if (masterIdx !== null && masterIdx !== i) {
      const master      = allContacts[masterIdx];
      const masterNorms = master.phones.map(normalizePhone);

      // Absorb new phones into master
      c.phones.forEach(p => {
        const norm = normalizePhone(p);
        if (norm.length >= 7 && !masterNorms.includes(norm)) {
          master.phones.push(p);
          masterNorms.push(norm);
          phoneIdx.set(norm, masterIdx);
        }
      });

      // Keep longer name
      if (c.name.trim().length > master.name.trim().length) {
        nameIdx.delete(master.name.trim().toLowerCase());
        master.name = c.name.trim();
        nameIdx.set(nameNorm, masterIdx);
      }

      // Transfer selection / tag to master if the duplicate was selected
      if (selectedIds.has(c.id)) {
        selectedIds.delete(c.id);
        selectedIds.add(master.id);
        if (tags[c.id] && !tags[master.id]) tags[master.id] = tags[c.id];
        delete tags[c.id];
      }

      toRemove.add(c.id);
    } else {
      // Register as master
      phoneNorms.forEach(norm => phoneIdx.set(norm, i));
      if (nameNorm.length > 2) nameIdx.set(nameNorm, i);
    }
  }

  if (toRemove.size) {
    allContacts = allContacts.filter(c => !toRemove.has(c.id));
  }
  return toRemove.size;
}

// ─── Rendering ─────────────────────────────────────────────────────────────

function render() {
  renderImportLane();
  renderSelectedLane();
  renderStats();
}

/* Build a contact card DOM element */
function buildCard(c, inSelected) {
  const phone1 = c.phones[0] || '';
  const phone2 = c.phones[1] || '';
  const tag = tags[c.id];

  const div = document.createElement('div');
  div.className = 'contact-card' + (inSelected ? ' selected-card' : '');
  div.dataset.id = c.id;
  div.setAttribute('draggable', 'true');
  div.setAttribute('role', 'listitem');

  if (!inSelected) {
    div.setAttribute('tabindex', '0');
    div.setAttribute('aria-label', `${c.name}${phone1 ? ', ' + phone1 : ''}, click to select`);
  }

  div.innerHTML = `
    <div class="card-main">
      <div class="card-avatar" aria-hidden="true">${esc(getInitials(c.name))}</div>
      <div class="card-info">
        <div class="card-name">${esc(c.name) || '<em style="color:var(--ink-3)">No name</em>'}</div>
        <div class="card-phones">${esc(phone1)}${phone2 ? ' <span aria-hidden="true">·</span> ' + esc(phone2) : ''}</div>
      </div>
      ${inSelected ? `
        <button type="button" class="card-remove" data-id="${c.id}" aria-label="Remove ${esc(c.name)} from selection">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      ` : ''}
    </div>
    ${inSelected ? `
      <div class="card-tags" role="group" aria-label="Assign event for ${esc(c.name)}">
        <button type="button" class="tag-btn${tag === 'tilak' ? ' active' : ''}" data-tag="tilak" data-id="${c.id}" aria-pressed="${tag === 'tilak'}">Tilak</button>
        <button type="button" class="tag-btn${tag === 'wedding' ? ' active' : ''}" data-tag="wedding" data-id="${c.id}" aria-pressed="${tag === 'wedding'}">Wedding</button>
        <button type="button" class="tag-btn${tag === 'both' ? ' active' : ''}" data-tag="both" data-id="${c.id}" aria-pressed="${tag === 'both'}">Both</button>
      </div>
    ` : ''}
  `;

  // Click to move between lanes
  if (!inSelected) {
    const onActivate = () => selectContact(c.id);
    div.addEventListener('click', onActivate);
    div.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(); }
    });
  }

  // Tag buttons & remove
  if (inSelected) {
    div.querySelector('.card-remove').addEventListener('click', e => {
      e.stopPropagation();
      deselectContact(c.id);
    });
    div.querySelectorAll('.tag-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const newTag = btn.dataset.tag;
        tags[c.id] = (tags[c.id] === newTag) ? undefined : newTag;
        if (!tags[c.id]) delete tags[c.id];
        renderSelectedLane();
        renderStats();
      });
    });
  }

  // Drag events
  div.addEventListener('dragstart', e => {
    dragSrcId   = c.id;
    dragSrcLane = inSelected ? 'selected' : 'import';
    div.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(c.id));
  });
  div.addEventListener('dragend', () => div.classList.remove('dragging'));

  return div;
}

/* Filtered, paginated contacts for import lane */
function filteredImportContacts() {
  const q = searchQuery.trim().toLowerCase();
  return allContacts.filter(c => {
    if (selectedIds.has(c.id)) return false;
    if (!q) return true;
    return c.name.toLowerCase().includes(q) ||
           c.phones.some(p => p.includes(q));
  });
}

function renderImportLane() {
  const body = document.getElementById('importLaneBody');
  const emptyState = document.getElementById('importEmpty');
  const loadMoreBar = document.getElementById('loadMoreBar');
  const visible = filteredImportContacts();

  document.getElementById('importCount').textContent = visible.length.toLocaleString('en-IN');

  // Hint in toolbar
  const hint = document.getElementById('selectedHint');
  if (hint) hint.textContent = selectedIds.size ? `${selectedIds.size} selected` : '';

  if (!visible.length) {
    emptyState.classList.remove('is-hidden');
    Array.from(body.children).forEach(el => {
      if (el.id !== 'importEmpty') el.remove();
    });
    loadMoreBar.classList.remove('is-visible');
    return;
  }
  emptyState.classList.add('is-hidden');

  const page = visible.slice(0, visiblePage * PAGE_SIZE);
  const frag = document.createDocumentFragment();
  page.forEach(c => frag.appendChild(buildCard(c, false)));

  Array.from(body.children).forEach(el => {
    if (el.id !== 'importEmpty') el.remove();
  });
  body.appendChild(frag);

  // Load more button
  if (visible.length > page.length) {
    const remaining = visible.length - page.length;
    document.getElementById('btnLoadMore').textContent =
      `Load ${Math.min(remaining, PAGE_SIZE).toLocaleString('en-IN')} more (${remaining.toLocaleString('en-IN')} remaining)`;
    loadMoreBar.classList.add('is-visible');
  } else {
    loadMoreBar.classList.remove('is-visible');
  }
}

function renderSelectedLane() {
  const body = document.getElementById('selectedLaneBody');
  const placeholder = document.getElementById('dropPlaceholder');
  const selected = Array.from(selectedIds)
    .map(id => allContacts.find(c => c.id === id))
    .filter(Boolean);

  document.getElementById('selectedCount').textContent =
    selected.length.toLocaleString('en-IN');

  if (!selected.length) {
    placeholder.classList.remove('is-hidden');
    Array.from(body.children).forEach(el => {
      if (el.id !== 'dropPlaceholder') el.remove();
    });
    return;
  }
  placeholder.classList.add('is-hidden');

  const frag = document.createDocumentFragment();
  selected.forEach(c => frag.appendChild(buildCard(c, true)));
  Array.from(body.children).forEach(el => {
    if (el.id !== 'dropPlaceholder') el.remove();
  });
  body.appendChild(frag);
}

function renderStats() {
  const tilak   = Object.values(tags).filter(t => t === 'tilak').length;
  const wedding  = Object.values(tags).filter(t => t === 'wedding').length;
  const both     = Object.values(tags).filter(t => t === 'both').length;
  const total    = allContacts.length;
  const sel      = selectedIds.size;
  const untagged = sel - tilak - wedding - both;

  document.getElementById('headerStats').innerHTML = `
    <div class="stat-chip c-total"  title="Total contacts loaded">
      <span class="sn">${total.toLocaleString('en-IN')}</span>
      <span>Total</span>
    </div>
    <div class="stat-chip c-sel" title="Selected guests">
      <span class="sn">${sel.toLocaleString('en-IN')}</span>
      <span>Selected</span>
    </div>
    <div class="stat-chip c-tilak" title="Tagged for Tilak">
      <span class="sn">${tilak.toLocaleString('en-IN')}</span>
      <span>Tilak</span>
    </div>
    <div class="stat-chip c-wed" title="Tagged for Wedding">
      <span class="sn">${wedding.toLocaleString('en-IN')}</span>
      <span>Wedding</span>
    </div>
    <div class="stat-chip c-both" title="Tagged for Both events">
      <span class="sn">${both.toLocaleString('en-IN')}</span>
      <span>Both</span>
    </div>
    ${untagged > 0 ? `
    <div class="stat-chip c-none" title="Selected but not tagged yet">
      <span class="sn">${untagged.toLocaleString('en-IN')}</span>
      <span>Untagged</span>
    </div>` : ''}
  `;
}

// ─── Selection helpers ─────────────────────────────────────────────────────
function selectContact(id) {
  selectedIds.add(id);
  render();
}

function deselectContact(id) {
  selectedIds.delete(id);
  delete tags[id];
  render();
}

// ─── Drag and Drop setup ───────────────────────────────────────────────────
function setupDragDrop() {
  // Called after board is visible (on first render)
  const selectedBody = document.getElementById('selectedLaneBody');
  const importBody   = document.getElementById('importLaneBody');

  function makeDrop(body, onDrop) {
    body.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      body.classList.add('drag-over');
    });
    body.addEventListener('dragenter', e => {
      e.preventDefault();
      body.classList.add('drag-over');
    });
    body.addEventListener('dragleave', e => {
      if (!body.contains(e.relatedTarget)) body.classList.remove('drag-over');
    });
    body.addEventListener('drop', e => {
      e.preventDefault();
      body.classList.remove('drag-over');
      const id = parseInt(e.dataTransfer.getData('text/plain'), 10);
      if (!isNaN(id)) onDrop(id);
    });
  }

  makeDrop(selectedBody, id => {
    if (!selectedIds.has(id)) selectContact(id);
  });

  makeDrop(importBody, id => {
    if (selectedIds.has(id)) deselectContact(id);
  });
}

// ─── Import zone ───────────────────────────────────────────────────────────
function setupImportZone() {
  const zone = document.getElementById('importZone');
  const fileInput = document.getElementById('fileInput');

  // Click anywhere on zone background (not on a button) opens the file picker
  zone.addEventListener('click', e => {
    if (!e.target.closest('button') && !e.target.closest('input')) fileInput.click();
  });

  // File drag-drop on import zone
  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('drag-active');
  });
  zone.addEventListener('dragleave', e => {
    if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-active');
  });
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-active');
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  });
}

function setupFileInput() {
  document.getElementById('fileInput').addEventListener('change', e => {
    if (e.target.files.length) handleFiles(e.target.files);
    e.target.value = ''; // allow re-importing same file
  });
}

// ─── Manual entry modal ────────────────────────────────────────────────────
function setupManualModal() {
  const modal = document.getElementById('manualModal');
  document.getElementById('btnManualAdd').addEventListener('click', () => {
    modal.classList.add('is-open');
    requestAnimationFrame(() => document.getElementById('manualName').focus());
  });
  document.getElementById('btnCloseModal').addEventListener('click', closeModal);
  document.getElementById('btnCancelManual').addEventListener('click', closeModal);
  document.getElementById('btnSaveManual').addEventListener('click', saveManual);

  // Dismiss on backdrop click
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  // Keyboard: Enter to save, Escape to close
  modal.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
      e.preventDefault();
      saveManual();
    }
  });
}

function closeModal() {
  const modal = document.getElementById('manualModal');
  modal.classList.remove('is-open');
  document.getElementById('manualForm').reset();
  document.querySelectorAll('.form-input.error').forEach(el => el.classList.remove('error'));
}

function saveManual() {
  const nameEl = document.getElementById('manualName');
  const name = nameEl.value.trim();
  if (!name) {
    nameEl.classList.add('error');
    nameEl.focus();
    return;
  }
  nameEl.classList.remove('error');

  const phones = [
    document.getElementById('manualPhone1').value.trim(),
    document.getElementById('manualPhone2').value.trim(),
    document.getElementById('manualPhone3').value.trim(),
  ].filter(Boolean);

  const contact = { id: nextId++, name, phones };
  allContacts.push(contact);
  closeModal();
  showBoard();
  visiblePage = 1;
  render();
  showToast(`Added "${name}"`, 'success');
}

// ─── Search ────────────────────────────────────────────────────────────────
function setupSearch() {
  document.getElementById('searchInput').addEventListener('input', e => {
    searchQuery = e.target.value;
    visiblePage = 1;
    renderImportLane();
  });
}

// ─── Buttons ───────────────────────────────────────────────────────────────
function setupButtons() {
  // Load preloaded contacts
  document.getElementById('btnLoadPreloaded').addEventListener('click', () => {
    if (typeof PRELOADED_CONTACTS === 'undefined' || !Array.isArray(PRELOADED_CONTACTS)) {
      showToast('contacts-data.js not found — preloaded contacts unavailable', 'error');
      return;
    }
    // Ensure each has a unique id
    const maxExisting = allContacts.reduce((m, c) => Math.max(m, c.id), 0);
    nextId = Math.max(nextId, maxExisting + 1);

    const mapped = PRELOADED_CONTACTS.map(c => ({
      id: c.id ?? nextId++,
      name: c.name || '',
      phones: Array.isArray(c.phones) ? c.phones : [],
    }));

    // Update nextId
    nextId = Math.max(nextId, ...mapped.map(c => c.id)) + 1;

    const added = mergeContacts(mapped);
    visiblePage = 1;
    showBoard();
    setupDragDrop();
    render();
    showToast(`Loaded ${allContacts.length.toLocaleString('en-IN')} contacts (${added.toLocaleString('en-IN')} new)`, 'success');
  });

  // Load more
  document.getElementById('btnLoadMore').addEventListener('click', () => {
    visiblePage++;
    renderImportLane();
  });

  // Select all visible
  // Deduplicate
  document.getElementById('btnDedup').addEventListener('click', () => {
    if (!allContacts.length) { showToast('No contacts loaded yet', 'error'); return; }
    const before = allContacts.length;
    const removed = deduplicateAll();
    visiblePage = 1;
    render();
    if (removed === 0) {
      showToast('No duplicates found — contacts are already unique', 'success');
    } else {
      showToast(`Merged ${removed.toLocaleString('en-IN')} duplicate${removed !== 1 ? 's' : ''} (${before.toLocaleString('en-IN')} → ${allContacts.length.toLocaleString('en-IN')} contacts)`, 'success');
    }
  });

  document.getElementById('btnSelectAll').addEventListener('click', () => {
    const visible = filteredImportContacts();
    if (!visible.length) { showToast('No contacts to select', 'error'); return; }
    visible.forEach(c => selectedIds.add(c.id));
    visiblePage = 1;
    render();
    showToast(`Selected ${visible.length.toLocaleString('en-IN')} contacts`, 'success');
  });

  // Clear selected
  document.getElementById('btnClearSelected').addEventListener('click', () => {
    if (!selectedIds.size) { showToast('Nothing selected', 'error'); return; }
    if (!confirm(`Remove all ${selectedIds.size.toLocaleString('en-IN')} selected guests?`)) return;
    selectedIds.clear();
    Object.keys(tags).forEach(k => delete tags[k]);
    render();
    showToast('Selection cleared', 'success');
  });

  // Export
  document.getElementById('btnExport').addEventListener('click', exportExcels);
}

// ─── Export ────────────────────────────────────────────────────────────────
function exportExcels() {
  if (typeof XLSX === 'undefined') {
    showToast('xlsx.full.min.js not loaded — Excel export unavailable', 'error');
    return;
  }
  if (!selectedIds.size) {
    showToast('Select contacts first, then export', 'error');
    return;
  }

  const groups = { tilak: [], wedding: [], both: [] };
  let untagged = 0;

  selectedIds.forEach(id => {
    const c = allContacts.find(x => x.id === id);
    if (!c) return;
    const tag = tags[id];
    if (!tag) { untagged++; return; }
    groups[tag].push(c);
  });

  const exported = [];
  FILE_META.forEach(meta => {
    const list = groups[meta.key];
    if (!list.length) return;

    const rows = list.map((c, i) => ({
      'S.No':    i + 1,
      'Name':    c.name,
      'Phone 1': c.phones[0] || '',
      'Phone 2': c.phones[1] || '',
      'Phone 3': c.phones[2] || '',
      'Event':   meta.label,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 }, { wch: 32 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 20 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, meta.label.slice(0, 28));
    XLSX.writeFile(wb, meta.filename);
    exported.push(`${meta.filename} (${list.length})`);
  });

  if (!exported.length) {
    showToast(`All ${selectedIds.size} selected guests are untagged — assign Tilak / Wedding / Both first`, 'error');
    return;
  }
  let msg = `Exported: ${exported.join(', ')}`;
  if (untagged) msg += ` · ${untagged} untagged skipped`;
  showToast(msg, 'success');
}

// ─── Toast ─────────────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show${type !== 'info' ? ' toast-' + type : ''}`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// ─── Board + DragDrop init after first data load ───────────────────────────
// setupDragDrop is called after first import/load so the elements exist
// For subsequent renders the listeners are already attached (event delegation)
(function bootstrapBoard() {
  // Always init drag-drop immediately (elements are in DOM from page load)
  window.addEventListener('DOMContentLoaded', () => {
    setupDragDrop();
  });
})();
