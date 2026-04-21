const { knex } = require("../database");

const getAll = () =>
  knex("dettagli_ordine as d")
    .leftJoin("prodotti as p", "d.id_prodotto", "p.id")
    .leftJoin("ordini as o", "d.id_ordine", "o.id")
    .select("d.*", "p.nome as prodotto_nome", "p.codice", "o.numero as ordine_numero")
    .orderBy("d.id", "desc");

const getByOrdine = (id_ordine) =>
  knex("dettagli_ordine as d")
    .leftJoin("prodotti as p", "d.id_prodotto", "p.id")
    .select("d.*", "p.nome as prodotto_nome", "p.codice")
    .where("d.id_ordine", id_ordine);

const create = (data) => knex("dettagli_ordine").insert(data);
const update = (id, data) => knex("dettagli_ordine").where({ id }).update(data);
const remove = (id) => knex("dettagli_ordine").where({ id }).delete();

module.exports = { getAll, getByOrdine, create, update, remove };