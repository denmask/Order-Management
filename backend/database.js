const knex = require("knex")({
  client: "sqlite3",
  connection: { filename: __dirname + "/gestionale.db" },
  useNullAsDefault: true
});

async function initDB() {
  // clienti
  if (!await knex.schema.hasTable("clienti")) {
    await knex.schema.createTable("clienti", t => {
      t.increments("id");
      t.string("nome").notNullable();
      t.string("cognome").notNullable();
      t.string("azienda");
      t.string("email");
      t.string("telefono");
      t.string("citta");
    });
  }
  // fornitori
  if (!await knex.schema.hasTable("fornitori")) {
    await knex.schema.createTable("fornitori", t => {
      t.increments("id");
      t.string("ragione_sociale").notNullable();
      t.string("email");
      t.string("telefono");
      t.string("citta");
      t.string("categoria");
    });
  }
  // prodotti
  if (!await knex.schema.hasTable("prodotti")) {
    await knex.schema.createTable("prodotti", t => {
      t.increments("id");
      t.string("codice").notNullable().unique();
      t.string("nome").notNullable();
      t.text("descrizione");
      t.float("prezzo").defaultTo(0);
      t.integer("id_fornitore").references("id").inTable("fornitori");
    });
  }
  // ordini
  if (!await knex.schema.hasTable("ordini")) {
    await knex.schema.createTable("ordini", t => {
      t.increments("id");
      t.string("numero").notNullable().unique();
      t.string("data").notNullable();
      t.string("stato").defaultTo("In attesa");
      t.text("note");
      t.integer("id_cliente").references("id").inTable("clienti");
    });
  }
  // dettagli_ordine
  if (!await knex.schema.hasTable("dettagli_ordine")) {
    await knex.schema.createTable("dettagli_ordine", t => {
      t.increments("id");
      t.integer("quantita").defaultTo(1);
      t.float("prezzo_unit").notNullable();
      t.integer("id_ordine").references("id").inTable("ordini");
      t.integer("id_prodotto").references("id").inTable("prodotti");
    });
  }
  // magazzino
  if (!await knex.schema.hasTable("magazzino")) {
    await knex.schema.createTable("magazzino", t => {
      t.increments("id");
      t.integer("id_prodotto").unique().references("id").inTable("prodotti");
      t.integer("quantita").defaultTo(0);
      t.integer("scorta_min").defaultTo(5);
      t.string("ubicazione");
    });
  }
  // movimenti
  if (!await knex.schema.hasTable("movimenti")) {
    await knex.schema.createTable("movimenti", t => {
      t.increments("id");
      t.string("data").notNullable();
      t.string("tipo").notNullable();
      t.integer("quantita").notNullable();
      t.text("note");
      t.integer("id_prodotto").references("id").inTable("prodotti");
    });
  }
}

module.exports = { knex, initDB };