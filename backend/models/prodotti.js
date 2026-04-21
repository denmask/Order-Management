const { knex } = require("../database");

const getAll = () =>
  knex("prodotti as p")
    .leftJoin("fornitori as f", "p.id_fornitore", "f.id")
    .select("p.*", "f.ragione_sociale as fornitore_nome")
    .orderBy("p.nome");

const getById = (id) => knex("prodotti").where({ id }).first();
const create = (data) => knex("prodotti").insert(data);
const update = (id, data) => knex("prodotti").where({ id }).update(data);
const remove = (id) => knex("prodotti").where({ id }).delete();

module.exports = { getAll, getById, create, update, remove };