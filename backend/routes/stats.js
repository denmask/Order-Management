const router = require("express").Router();
const { knex } = require("../database");

router.get("/", async (req, res) => {
  try {
    const [clienti, fornitori, prodotti, ordini, movimenti, ordiniStato, magVal, sottoScorta] = await Promise.all([
      knex("clienti").count("id as n").first(),
      knex("fornitori").count("id as n").first(),
      knex("prodotti").count("id as n").first(),
      knex("ordini").count("id as n").first(),
      knex("movimenti").count("id as n").first(),
      knex("ordini").select("stato").count("id as totale").groupBy("stato"),
      knex("magazzino as m").leftJoin("prodotti as p","m.id_prodotto","p.id")
        .select(knex.raw("COALESCE(SUM(m.quantita * p.prezzo), 0) as valore")).first(),
      knex("magazzino").whereRaw("quantita < scorta_min").count("id as n").first()
    ]);

    res.json({
      clienti:          clienti.n,
      fornitori:        fornitori.n,
      prodotti:         prodotti.n,
      ordini:           ordini.n,
      movimenti:        movimenti.n,
      ordini_stato:     ordiniStato,
      valore_magazzino: magVal.valore,
      sotto_scorta:     sottoScorta.n
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;