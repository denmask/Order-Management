# 📦 Order Management Dashboard

Gestionale completo per ordini, clienti e magazzino.

## Stack
- **Backend**: Node.js + Express + better-sqlite3
- **Frontend**: HTML + CSS + JavaScript vanilla
- **Pattern**: Models separati dai Routes (separation of concerns)

## 7 Tabelle
| Tabella | Descrizione |
|---|---|
| `clienti` | Anagrafica clienti |
| `fornitori` | Anagrafica fornitori |
| `prodotti` | Catalogo prodotti con prezzi |
| `ordini` | Ordini con stato e totale automatico |
| `dettagli_ordine` | Righe di ogni ordine |
| `magazzino` | Giacenze per prodotto con scorta minima |
| `movimenti` | Storico entrate/uscite magazzino |

## Avvio

```bash
cd backend
npm install
npm start
# → http://localhost:3000
```

## Struttura
```
order-management-dashboard/
├── backend/
│   ├── server.js         ← Entry point
│   ├── database.js       ← Connessione SQLite singleton
│   ├── models/           ← Logica query DB
│   └── routes/           ← Route Express
└── frontend/
    ├── index.html
    ├── css/style.css
    └── js/
        ├── api.js        ← HTTP helpers
        ├── pages.js      ← Render pagine e tabelle
        └── app.js        ← Navigazione, modal, form
```