const { knex } = require("../database");

const getAll = () =>
  knex("magazzino as m")
    .leftJoin("prodotti as p", "m.id_prodotto", "p.id")
    .select("m.*", "p.nome as prodotto_nome", "p.codice", "p.prezzo")
    .orderBy("p.nome");

const getById = (id) => knex("magazzino").where({ id }).first();
const create = (data) => knex("magazzino").insert(data);
const update = (id, data) => knex("magazzino").where({ id }).update(data);
const remove = (id) => knex("magazzino").where({ id }).delete();

module.exports = { getAll, getById, create, update, remove };