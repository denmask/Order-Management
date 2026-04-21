// ── DATA ──────────────────────────────────────────────────────
const pageTitles = {
  dashboard: "Dashboard",   clienti:   "Clienti",
  fornitori: "Fornitori",   prodotti:  "Prodotti",
  ordini:    "Ordini",      dettagli:  "Righe Ordine",
  magazzino: "Giacenze",    movimenti: "Movimenti"
};

const renderers = {
  dashboard: renderDashboard, clienti:   renderClienti,
  fornitori: renderFornitori, prodotti:  renderProdotti,
  ordini:    renderOrdini,    dettagli:  renderDettagli,
  magazzino: renderMagazzino, movimenti: renderMovimenti
};

let currentPage = "dashboard";

// ── NAVIGAZIONE ───────────────────────────────────────────────
async function navigateTo(page) {
  currentPage = page;
  document.getElementById("pageTitle").textContent = pageTitles[page];
  document.querySelectorAll(".nav-link").forEach(l =>
    l.classList.toggle("active", l.dataset.page === page));

  const content = document.getElementById("content");
  content.innerHTML = `<p style="color:var(--text-muted);padding:24px">Caricamento...</p>`;
  content.innerHTML = await renderers[page]();

  if (page === "dashboard") {
    await loadDashboardTables();
  } else {
    renderTableBody(page, "");
  }
}

// ── DELETE ────────────────────────────────────────────────────
async function deleteRecord(page, id) {
  if (!confirm("Eliminare questo record?")) return;
  await apiDelete("/" + page + "/" + id);
  navigateTo(currentPage);
}

// ── EDIT ──────────────────────────────────────────────────────
const pageToType = {
  clienti:"cliente", fornitori:"fornitore", prodotti:"prodotto",
  ordini:"ordine", dettagli:"dettaglio", magazzino:"giacenza", movimenti:"movimento"
};

async function editRecord(page, id) {
  const record = (pageData[page]||[]).find(r => r.id === id);
  if (!record) return;
  await openModal(pageToType[page], record);
}

// ── MODAL ─────────────────────────────────────────────────────
async function openModal(type, existing = null) {
  const modal  = document.getElementById("modal");
  const title  = document.getElementById("modalTitle");
  const body   = document.getElementById("modalBody");
  const isEdit = existing !== null;
  const v      = existing || {};
  let html     = "";

  if (type === "cliente") {
    title.textContent = isEdit ? "Modifica Cliente" : "Nuovo Cliente";
    html = `
      <div class="form-row">
        <div class="form-group"><label>Nome *</label><input id="f_nome" value="${v.nome||""}" placeholder="Mario"></div>
        <div class="form-group"><label>Cognome *</label><input id="f_cognome" value="${v.cognome||""}" placeholder="Rossi"></div>
      </div>
      <div class="form-group"><label>Azienda</label><input id="f_azienda" value="${v.azienda||""}" placeholder="Acme Srl"></div>
      <div class="form-row">
        <div class="form-group"><label>Email</label><input id="f_email" value="${v.email||""}" placeholder="mario@email.it"></div>
        <div class="form-group"><label>Telefono</label><input id="f_telefono" value="${v.telefono||""}" placeholder="333 1234567"></div>
      </div>
      <div class="form-group"><label>Città</label><input id="f_citta" value="${v.citta||""}" placeholder="Milano"></div>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="saveCliente(${isEdit?v.id:'null'})">Salva</button>
      </div>`;
  }

  else if (type === "fornitore") {
    title.textContent = isEdit ? "Modifica Fornitore" : "Nuovo Fornitore";
    html = `
      <div class="form-group"><label>Ragione Sociale *</label><input id="f_rs" value="${v.ragione_sociale||""}" placeholder="Fornitore Srl"></div>
      <div class="form-group"><label>Categoria</label><input id="f_cat" value="${v.categoria||""}" placeholder="Elettronica, Abbigliamento..."></div>
      <div class="form-row">
        <div class="form-group"><label>Email</label><input id="f_email" value="${v.email||""}" placeholder="info@fornitore.it"></div>
        <div class="form-group"><label>Telefono</label><input id="f_telefono" value="${v.telefono||""}" placeholder="02 1234567"></div>
      </div>
      <div class="form-group"><label>Città</label><input id="f_citta" value="${v.citta||""}" placeholder="Roma"></div>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="saveFornitore(${isEdit?v.id:'null'})">Salva</button>
      </div>`;
  }

  else if (type === "prodotto") {
    const fornitori = await apiGet("/fornitori");
    title.textContent = isEdit ? "Modifica Prodotto" : "Nuovo Prodotto";
    html = `
      <div class="form-row">
        <div class="form-group"><label>Codice *</label><input id="f_codice" value="${v.codice||""}" placeholder="PRD-001"></div>
        <div class="form-group"><label>Prezzo (€) *</label><input id="f_prezzo" type="number" step="0.01" value="${v.prezzo||""}" placeholder="0.00"></div>
      </div>
      <div class="form-group"><label>Nome *</label><input id="f_nome" value="${v.nome||""}" placeholder="Nome prodotto"></div>
      <div class="form-group"><label>Descrizione</label><textarea id="f_desc" rows="2">${v.descrizione||""}</textarea></div>
      <div class="form-group"><label>Fornitore</label>
        <select id="f_fornitore">
          <option value="">— Nessuno —</option>
          ${fornitori.map(f=>`<option value="${f.id}"${v.id_fornitore==f.id?" selected":""}>${f.ragione_sociale}</option>`).join("")}
        </select>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="saveProdotto(${isEdit?v.id:'null'})">Salva</button>
      </div>`;
  }

  else if (type === "ordine") {
    const clienti = await apiGet("/clienti");
    const stati = ["In attesa","Confermato","Spedito","Consegnato","Annullato"];
    title.textContent = isEdit ? "Modifica Ordine" : "Nuovo Ordine";
    html = `
      <div class="form-row">
        <div class="form-group"><label>Numero *</label><input id="f_numero" value="${v.numero||autoNumero()}" placeholder="ORD-001"></div>
        <div class="form-group"><label>Data *</label><input id="f_data" type="date" value="${v.data||today()}"></div>
      </div>
      <div class="form-group"><label>Cliente</label>
        <select id="f_cliente">
          <option value="">— Nessuno —</option>
          ${clienti.map(c=>`<option value="${c.id}"${v.id_cliente==c.id?" selected":""}>${c.nome} ${c.cognome}${c.azienda?" – "+c.azienda:""}</option>`).join("")}
        </select>
      </div>
      <div class="form-group"><label>Stato</label>
        <select id="f_stato">
          ${stati.map(s=>`<option value="${s}"${v.stato===s?" selected":""}>${s}</option>`).join("")}
        </select>
      </div>
      <div class="form-group"><label>Note</label><textarea id="f_note" rows="2">${v.note||""}</textarea></div>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="saveOrdine(${isEdit?v.id:'null'})">Salva</button>
      </div>`;
  }

  else if (type === "dettaglio") {
    const [ordini, prodotti] = await Promise.all([apiGet("/ordini"), apiGet("/prodotti")]);
    title.textContent = isEdit ? "Modifica Riga Ordine" : "Nuova Riga Ordine";
    html = `
      <div class="form-group"><label>Ordine *</label>
        <select id="f_ordine">
          <option value="">— Seleziona —</option>
          ${ordini.map(o=>`<option value="${o.id}"${v.id_ordine==o.id?" selected":""}>${o.numero} – ${o.cliente_nome||"?"}</option>`).join("")}
        </select>
      </div>
      <div class="form-group"><label>Prodotto *</label>
        <select id="f_prodotto">
          <option value="">— Seleziona —</option>
          ${prodotti.map(p=>`<option value="${p.id}"${v.id_prodotto==p.id?" selected":""}>${p.codice} – ${p.nome}</option>`).join("")}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Quantità *</label><input id="f_qty" type="number" min="1" value="${v.quantita||1}"></div>
        <div class="form-group"><label>Prezzo Unitario *</label><input id="f_prezzo" type="number" step="0.01" value="${v.prezzo_unit||""}"></div>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="saveDettaglio(${isEdit?v.id:'null'})">Salva</button>
      </div>`;
  }

  else if (type === "giacenza") {
    const prodotti = await apiGet("/prodotti");
    title.textContent = isEdit ? "Modifica Giacenza" : "Nuova Giacenza";
    html = `
      <div class="form-group"><label>Prodotto *</label>
        <select id="f_prodotto" ${isEdit?"disabled":""}>
          <option value="">— Seleziona —</option>
          ${prodotti.map(p=>`<option value="${p.id}"${v.id_prodotto==p.id?" selected":""}>${p.codice} – ${p.nome}</option>`).join("")}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Quantità</label><input id="f_qty" type="number" min="0" value="${v.quantita!=null?v.quantita:0}"></div>
        <div class="form-group"><label>Scorta Min.</label><input id="f_scorta" type="number" min="0" value="${v.scorta_min!=null?v.scorta_min:5}"></div>
      </div>
      <div class="form-group"><label>Ubicazione</label><input id="f_ubicazione" value="${v.ubicazione||""}" placeholder="Scaffale A3"></div>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="saveGiacenza(${isEdit?v.id:'null'},${v.id_prodotto||'null'})">Salva</button>
      </div>`;
  }

  else if (type === "movimento") {
    const prodotti = await apiGet("/prodotti");
    title.textContent = isEdit ? "Modifica Movimento" : "Nuovo Movimento";
    html = `
      <div class="form-row">
        <div class="form-group"><label>Data *</label><input id="f_data" type="date" value="${v.data||today()}"></div>
        <div class="form-group"><label>Tipo *</label>
          <select id="f_tipo">
            ${["Entrata","Uscita","Rettifica"].map(t=>`<option value="${t}"${v.tipo===t?" selected":""}>${t}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="form-group"><label>Prodotto *</label>
        <select id="f_prodotto">
          <option value="">— Seleziona —</option>
          ${prodotti.map(p=>`<option value="${p.id}"${v.id_prodotto==p.id?" selected":""}>${p.codice} – ${p.nome}</option>`).join("")}
        </select>
      </div>
      <div class="form-group"><label>Quantità *</label><input id="f_qty" type="number" min="1" value="${v.quantita||1}"></div>
      <div class="form-group"><label>Note</label><input id="f_note" value="${v.note||""}" placeholder="Carico da fornitore, reso cliente..."></div>
      <div class="form-actions">
        <button class="btn btn-primary" onclick="saveMovimento(${isEdit?v.id:'null'})">Salva</button>
      </div>`;
  }

  body.innerHTML = html;
  modal.classList.remove("hidden");
}

function closeModal() { document.getElementById("modal").classList.add("hidden"); }
document.getElementById("modalClose").onclick = closeModal;
document.getElementById("modal").onclick = e => { if (e.target.id==="modal") closeModal(); };

// ── HELPERS FORM ──────────────────────────────────────────────
function today() { return new Date().toISOString().split("T")[0]; }
function autoNumero() {
  const n = (pageData["ordini"]||[]).length + 1;
  return "ORD-" + String(n).padStart(3,"0");
}
function v(id) { return document.getElementById(id)?.value?.trim() || null; }
function vn(id) { return document.getElementById(id)?.value || null; }

// ── SAVE FUNCTIONS ────────────────────────────────────────────
async function saveCliente(id) {
  if (!v("f_nome")||!v("f_cognome")) return alert("Nome e cognome obbligatori.");
  const data = { nome:v("f_nome"), cognome:v("f_cognome"), azienda:v("f_azienda"), email:v("f_email"), telefono:v("f_telefono"), citta:v("f_citta") };
  id ? await apiPut("/clienti/"+id,data) : await apiPost("/clienti",data);
  closeModal(); navigateTo("clienti");
}

async function saveFornitore(id) {
  if (!v("f_rs")) return alert("Ragione sociale obbligatoria.");
  const data = { ragione_sociale:v("f_rs"), categoria:v("f_cat"), email:v("f_email"), telefono:v("f_telefono"), citta:v("f_citta") };
  id ? await apiPut("/fornitori/"+id,data) : await apiPost("/fornitori",data);
  closeModal(); navigateTo("fornitori");
}

async function saveProdotto(id) {
  if (!v("f_codice")||!v("f_nome")) return alert("Codice e nome obbligatori.");
  const data = { codice:v("f_codice"), nome:v("f_nome"), descrizione:v("f_desc"), prezzo:vn("f_prezzo")||0, id_fornitore:vn("f_fornitore") };
  id ? await apiPut("/prodotti/"+id,data) : await apiPost("/prodotti",data);
  closeModal(); navigateTo("prodotti");
}

async function saveOrdine(id) {
  if (!v("f_numero")||!v("f_data")) return alert("Numero e data obbligatori.");
  const data = { numero:v("f_numero"), data:v("f_data"), stato:vn("f_stato")||"In attesa", note:v("f_note"), id_cliente:vn("f_cliente") };
  id ? await apiPut("/ordini/"+id,data) : await apiPost("/ordini",data);
  closeModal(); navigateTo("ordini");
}

async function saveDettaglio(id) {
  if (!vn("f_ordine")||!vn("f_prodotto")) return alert("Ordine e prodotto obbligatori.");
  const data = { quantita:vn("f_qty")||1, prezzo_unit:vn("f_prezzo")||0, id_ordine:vn("f_ordine"), id_prodotto:vn("f_prodotto") };
  id ? await apiPut("/dettagli/"+id,data) : await apiPost("/dettagli",data);
  closeModal(); navigateTo("dettagli");
}

async function saveGiacenza(id, id_prodotto_esistente) {
  const data = { quantita:vn("f_qty")||0, scorta_min:vn("f_scorta")||5, ubicazione:v("f_ubicazione"), id_prodotto:id_prodotto_esistente||vn("f_prodotto") };
  id ? await apiPut("/magazzino/"+id,data) : await apiPost("/magazzino",data);
  closeModal(); navigateTo("magazzino");
}

async function saveMovimento(id) {
  if (!v("f_data")||!vn("f_prodotto")) return alert("Data e prodotto obbligatori.");
  const data = { data:v("f_data"), tipo:vn("f_tipo")||"Entrata", quantita:vn("f_qty")||1, note:v("f_note"), id_prodotto:vn("f_prodotto") };
  id ? await apiPut("/movimenti/"+id,data) : await apiPost("/movimenti",data);
  closeModal(); navigateTo("movimenti");
}

// ── INIT ──────────────────────────────────────────────────────
document.querySelectorAll(".nav-link").forEach(link =>
  link.addEventListener("click", e => { e.preventDefault(); navigateTo(link.dataset.page); })
);

document.getElementById("topbarDate").textContent =
  new Date().toLocaleDateString("it-IT", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

navigateTo("dashboard");

// ── SOCKET.IO — aggiornamenti in tempo reale ──────────────────
const socket = io();

socket.on("connect", () => {
  console.log("🔌 Connesso al server in tempo reale");
});

// Mappa tabella → pagina corrispondente
const tableToPage = {
  clienti:       "clienti",
  fornitori:     "fornitori",
  prodotti:      "prodotti",
  ordini:        "ordini",
  dettagli_ordine: "dettagli",
  magazzino:     "magazzino",
  movimenti:     "movimenti"
};

socket.on("data_changed", ({ table }) => {
  const page = tableToPage[table];
  // Ricarica solo se sei sulla pagina interessata o sulla dashboard
  if (currentPage === page) {
    navigateTo(currentPage);
  } else if (currentPage === "dashboard") {
    navigateTo("dashboard");
  }
});

socket.on("disconnect", () => {
  console.log("❌ Connessione al server persa");
});