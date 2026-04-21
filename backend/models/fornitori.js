const { knex } = require("../database");

const getAll = () => knex("fornitori").orderBy("ragione_sociale");
const getById = (id) => knex("fornitori").where({ id }).first();
const create = (data) => knex("fornitori").insert(data);
const update = (id, data) => knex("fornitori").where({ id }).update(data);
const remove = (id) => knex("fornitori").where({ id }).delete();

module.exports = { getAll, getById, create, update, remove };