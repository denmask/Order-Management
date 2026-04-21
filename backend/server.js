const express  = require("express");
const cors     = require("cors");
const path     = require("path");
const http     = require("http");
const { Server } = require("socket.io");
const os       = require("os");
const https    = require("https");
const { initDB } = require("./database");

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// Rendi io disponibile alle routes
app.set("io", io);

// ── SOCKET.IO ─────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`🔌 Client connesso: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`❌ Client disconnesso: ${socket.id}`);
  });
});

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

// ── UTILS IP ──────────────────────────────────────────────────
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1";
}

function getPublicIP() {
  return new Promise((resolve) => {
    https.get("https://api.ipify.org", (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data.trim()));
    }).on("error", () => resolve("non disponibile"));
  });
}

// ── START ─────────────────────────────────────────────────────
const PORT = 3000;

initDB().then(async () => {
  const localIP  = getLocalIP();
  const publicIP = await getPublicIP();

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`
🚀 Server avviato con successo!
--------------------------------------
📍 Localhost:   http://localhost:${PORT}
🏠 Rete locale: http://${localIP}:${PORT}
🌐 IP Pubblico: http://${publicIP}:${PORT}
--------------------------------------
💡 Il tuo compagno usa l'IP Locale se è sulla stessa rete WiFi
   oppure l'IP Pubblico se è fuori casa (assicurati di aprire la porta ${PORT} nel router)
    `);
  });
}).catch(err => {
  console.error("Errore inizializzazione DB:", err);
  process.exit(1);
});