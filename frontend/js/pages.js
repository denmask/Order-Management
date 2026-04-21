const pageData = {};

function euro(n) { return "€ " + Number(n).toFixed(2); }

function statoBadge(stato) {
  const map = {
    "In attesa":   "badge-attesa",
    "Confermato":  "badge-confermato",
    "Spedito":     "badge-spedito",
    "Consegnato":  "badge-consegnato",
    "Annullato":   "badge-annullato",
    "Entrata":     "badge-entrata",
    "Uscita":      "badge-uscita",
    "Rettifica":   "badge-rettifica",
  };
  return `<span class="badge ${map[stato]||"badge-default"}">${stato}</span>`;
}

function filterRows(rows, q, fields) {
  if (!q) return rows;
  const lq = q.toLowerCase();
  return rows.filter(r => fields.some(f => (r[f]||"").toString().toLowerCase().includes(lq)));
}

function searchInput(id, placeholder) {
  return `<div class="search-bar"><input id="${id}" placeholder="${placeholder}" oninput="applySearch('${id}')" autocomplete="off"></div>`;
}

function applySearch(inputId) {
  const page = inputId.replace("search_","");
  renderTableBody(page, document.getElementById(inputId).value);
}

function renderTableBody(page, q="") {
  const rows = pageData[page] || [];
  const tbody = document.getElementById("tbody_" + page);
  if (!tbody) return;
  const f = filterRows(rows, q, getSearchFields(page));

  if (f.length === 0) {
    const cols = { clienti:6,fornitori:5,prodotti:5,ordini:6,dettagli:5,magazzino:5,movimenti:5 };
    tbody.innerHTML = `<tr class="empty-row"><td colspan="${cols[page]||5}">Nessun risultato</td></tr>`;
    return;
  }

  tbody.innerHTML = f.map(r => rowTemplate(page, r)).join("");
}

function getSearchFields(page) {
  return {
    clienti:   ["nome","cognome","azienda","email","citta"],
    fornitori: ["ragione_sociale","email","citta","categoria"],
    prodotti:  ["codice","nome","descrizione","fornitore_nome"],
    ordini:    ["numero","stato","cliente_nome","cliente_cognome","azienda"],
    dettagli:  ["prodotto_nome","codice","ordine_numero"],
    magazzino: ["prodotto_nome","codice","ubicazione"],
    movimenti: ["tipo","prodotto_nome","codice","note"],
  }[page] || [];
}

function rowTemplate(page, r) {
  const act = `<div class="actions-cell">
    <button class="btn btn-edit btn-sm" onclick="editRecord('${page}',${r.id})">✏️</button>
    <button class="btn btn-danger btn-sm" onclick="deleteRecord('${page}',${r.id})">🗑️</button>
  </div>`;

  if (page === "clienti") return `<tr>
    <td>${r.nome} ${r.cognome}</td>
    <td>${r.azienda||"—"}</td>
    <td>${r.email||"—"}</td>
    <td>${r.telefono||"—"}</td>
    <td>${r.citta||"—"}</td>
    <td>${act}</td></tr>`;

  if (page === "fornitori") return `<tr>
    <td>${r.ragione_sociale}</td>
    <td>${r.categoria||"—"}</td>
    <td>${r.email||"—"}</td>
    <td>${r.telefono||"—"}</td>
    <td>${act}</td></tr>`;

  if (page === "prodotti") return `<tr>
    <td><code style="font-size:12px;background:#f0f0f0;padding:2px 6px;border-radius:4px">${r.codice}</code></td>
    <td>${r.nome}</td>
    <td>${euro(r.prezzo)}</td>
    <td>${r.fornitore_nome||"—"}</td>
    <td>${act}</td></tr>`;

  if (page === "ordini") return `<tr>
    <td><strong>${r.numero}</strong></td>
    <td>${r.data}</td>
    <td>${r.cliente_nome?r.cliente_nome+" "+r.cliente_cognome:"—"}</td>
    <td>${statoBadge(r.stato)}</td>
    <td><strong>${euro(r.totale)}</strong></td>
    <td>${act}</td></tr>`;

  if (page === "dettagli") return `<tr>
    <td>${r.ordine_numero||"—"}</td>
    <td>${r.prodotto_nome||"—"}</td>
    <td>${r.quantita}</td>
    <td>${euro(r.prezzo_unit)}</td>
    <td>${act}</td></tr>`;

  if (page === "magazzino") {
    const warn = r.quantita < r.scorta_min ? " class=\"scorta-warn\"" : "";
    return `<tr${warn}>
      <td><code style="font-size:12px;background:#f0f0f0;padding:2px 6px;border-radius:4px">${r.codice}</code></td>
      <td>${r.prodotto_nome||"—"}</td>
      <td><strong>${r.quantita}</strong> ${r.quantita < r.scorta_min ? "⚠️" : ""}</td>
      <td>${r.scorta_min}</td>
      <td>${r.ubicazione||"—"}</td>
      <td>${act}</td></tr>`;
  }

  if (page === "movimenti") return `<tr>
    <td>${r.data}</td>
    <td>${statoBadge(r.tipo)}</td>
    <td>${r.prodotto_nome||"—"}</td>
    <td>${r.quantita}</td>
    <td>${r.note||"—"}</td>
    <td>${act}</td></tr>`;

  return "";
}

async function renderDashboard() {
  const s = await apiGet("/stats");

  const statoMap = {};
  (s.ordini_stato||[]).forEach(x => statoMap[x.stato] = x.totale);

  return `
    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-icon-wrap">👥</div>
        <div class="stat-label">Clienti</div>
        <div class="stat-value">${s.clienti}</div>
      </div>
      <div class="stat-card teal">
        <div class="stat-icon-wrap">🏭</div>
        <div class="stat-label">Fornitori</div>
        <div class="stat-value">${s.fornitori}</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-icon-wrap">🏷️</div>
        <div class="stat-label">Prodotti</div>
        <div class="stat-value">${s.prodotti}</div>
      </div>
      <div class="stat-card orange">
        <div class="stat-icon-wrap">🛒</div>
        <div class="stat-label">Ordini Totali</div>
        <div class="stat-value">${s.ordini}</div>
      </div>
      <div class="stat-card yellow">
        <div class="stat-icon-wrap">⏳</div>
        <div class="stat-label">In Attesa</div>
        <div class="stat-value">${statoMap["In attesa"]||0}</div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon-wrap">💰</div>
        <div class="stat-label">Valore Magazzino</div>
        <div class="stat-value" style="font-size:20px;margin-top:4px">${euro(s.valore_magazzino)}</div>
      </div>
      <div class="stat-card red">
        <div class="stat-icon-wrap">⚠️</div>
        <div class="stat-label">Sotto Scorta</div>
        <div class="stat-value">${s.sotto_scorta}</div>
        <div class="stat-sub">prodotti da riordinare</div>
      </div>
    </div>

    ${s.sotto_scorta > 0 ? `
      <div class="alert-banner">
        ⚠️ &nbsp; Attenzione: ${s.sotto_scorta} prodotto/i ha scorte sotto il minimo — controlla le giacenze.
      </div>` : ""}

    <div class="dashboard-grid">
      <div>
        <div class="section-header"><h2 class="section-title">Ultimi Ordini</h2></div>
        <div class="card"><div class="table-wrap"><table>
          <thead><tr><th>N°</th><th>Data</th><th>Cliente</th><th>Stato</th><th>Totale</th></tr></thead>
          <tbody id="dash_ordini"></tbody>
        </table></div></div>
      </div>
      <div>
        <div class="section-header"><h2 class="section-title">Giacenze Critiche</h2></div>
        <div class="card"><div class="table-wrap"><table>
          <thead><tr><th>Prodotto</th><th>Qtà</th><th>Min</th></tr></thead>
          <tbody id="dash_scorte"></tbody>
        </table></div></div>
      </div>
    </div>`;
}

async function loadDashboardTables() {
  const [ordini, magazzino] = await Promise.all([apiGet("/ordini"), apiGet("/magazzino")]);
  const lastOrdini = ordini.slice(0, 6);
  const critici = magazzino.filter(m => m.quantita < m.scorta_min).slice(0, 6);

  const tbo = document.getElementById("dash_ordini");
  const tbs = document.getElementById("dash_scorte");
  if (tbo) tbo.innerHTML = lastOrdini.length === 0
    ? `<tr class="empty-row"><td colspan="5">Nessun ordine</td></tr>`
    : lastOrdini.map(o=>`<tr>
        <td><strong>${o.numero}</strong></td>
        <td>${o.data}</td>
        <td>${o.cliente_nome?o.cliente_nome+" "+o.cliente_cognome:"—"}</td>
        <td>${statoBadge(o.stato)}</td>
        <td>${euro(o.totale)}</td>
      </tr>`).join("");

  if (tbs) tbs.innerHTML = critici.length === 0
    ? `<tr class="empty-row"><td colspan="3">Tutto ok ✅</td></tr>`
    : critici.map(m=>`<tr class="scorta-warn">
        <td>${m.prodotto_nome}</td>
        <td><strong style="color:var(--red)">${m.quantita}</strong></td>
        <td>${m.scorta_min}</td>
      </tr>`).join("");
}

function tablePageHTML(page, title, icon, theadCols, searchPlaceholder, addType) {
  return `
    <div class="section-header">
      <div class="section-header-left">
        <h2 class="section-title">${icon} ${title}</h2>
        ${searchInput("search_"+page, searchPlaceholder)}
      </div>
      <button class="btn btn-primary" onclick="openModal('${addType}')">+ Aggiungi</button>
    </div>
    <div class="card"><div class="table-wrap"><table>
      <thead><tr>${theadCols.map(c=>`<th>${c}</th>`).join("")}<th></th></tr></thead>
      <tbody id="tbody_${page}"></tbody>
    </table></div></div>`;
}

async function renderClienti() {
  pageData["clienti"] = await apiGet("/clienti");
  return tablePageHTML("clienti","Clienti","👥",
    ["Nome / Cognome","Azienda","Email","Telefono","Città"],
    "Cerca cliente...","cliente");
}

async function renderFornitori() {
  pageData["fornitori"] = await apiGet("/fornitori");
  return tablePageHTML("fornitori","Fornitori","🏭",
    ["Ragione Sociale","Categoria","Email","Telefono"],
    "Cerca fornitore...","fornitore");
}

async function renderProdotti() {
  pageData["prodotti"] = await apiGet("/prodotti");
  return tablePageHTML("prodotti","Prodotti","🏷️",
    ["Codice","Nome","Prezzo","Fornitore"],
    "Cerca prodotto...","prodotto");
}

async function renderOrdini() {
  pageData["ordini"] = await apiGet("/ordini");
  return tablePageHTML("ordini","Ordini","🛒",
    ["Numero","Data","Cliente","Stato","Totale"],
    "Cerca ordine...","ordine");
}

async function renderDettagli() {
  pageData["dettagli"] = await apiGet("/dettagli");
  return tablePageHTML("dettagli","Righe Ordine","📋",
    ["Ordine","Prodotto","Qtà","Prezzo Unit."],
    "Cerca riga...","dettaglio");
}

async function renderMagazzino() {
  pageData["magazzino"] = await apiGet("/magazzino");
  return tablePageHTML("magazzino","Giacenze Magazzino","🏪",
    ["Codice","Prodotto","Quantità","Scorta Min","Ubicazione"],
    "Cerca prodotto...","giacenza");
}

async function renderMovimenti() {
  pageData["movimenti"] = await apiGet("/movimenti");
  return tablePageHTML("movimenti","Movimenti Magazzino","🔄",
    ["Data","Tipo","Prodotto","Quantità","Note"],
    "Cerca movimento...","movimento");
}