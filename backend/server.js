const express = require("express");
const cors    = require("cors");
const path    = require("path");
const { initDB } = require("./database");

const app = express();
app.use(cors());
app.use(express.json());

// ── ROUTES ────────────────────────────────────────────────────
app.use("/api/clienti",   require("./routes/clienti"));
app.use("/api/fornitori", require("./routes/fornitori"));
app.use("/api/prodotti",  require("./routes/prodotti"));
app.use("/api/ordini",    require("./routes/ordini"));
app.use("/api/dettagli",  require("./routes/dettagli"));
app.use("/api/magazzino", require("./routes/magazzino"));
app.use("/api/movimenti", require("./routes/movimenti"));
app.use("/api/stats",     require("./routes/stats"));

// ── FRONTEND STATICO ──────────────────────────────────────────
const FRONTEND = path.join(__dirname, "..", "frontend");
app.use(express.static(FRONTEND));
app.get("/{*path}", (req, res) =>
  res.sendFile(path.join(FRONTEND, "index.html"))
);

// ── START ─────────────────────────────────────────────────────
const PORT = 3000;
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅  Server avviato → http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Errore inizializzazione DB:", err);
  process.exit(1);
});