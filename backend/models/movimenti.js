const { knex } = require("../database");

const getAll = () =>
  knex("movimenti as m")
    .leftJoin("prodotti as p", "m.id_prodotto", "p.id")
    .select("m.*", "p.nome as prodotto_nome", "p.codice")
    .orderBy("m.data", "desc");

const create = (data) => knex("movimenti").insert(data);
const update = (id, data) => knex("movimenti").where({ id }).update(data);
const remove = (id) => knex("movimenti").where({ id }).delete();

module.exports = { getAll, create, update, remove };