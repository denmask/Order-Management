const { knex } = require("../database");

const getAll = () =>
  knex("ordini as o")
    .leftJoin("clienti as c", "o.id_cliente", "c.id")
    .leftJoin("dettagli_ordine as d", "d.id_ordine", "o.id")
    .select(
      "o.*",
      "c.nome as cliente_nome", "c.cognome as cliente_cognome", "c.azienda",
      knex.raw("COALESCE(SUM(d.quantita * d.prezzo_unit), 0) as totale")
    )
    .groupBy("o.id")
    .orderBy("o.data", "desc");

const getById = (id) => knex("ordini").where({ id }).first();
const create = (data) => knex("ordini").insert(data);
const update = (id, data) => knex("ordini").where({ id }).update(data);
const remove = (id) => knex("ordini").where({ id }).delete();

module.exports = { getAll, getById, create, update, remove };